import { type Viewer, Math } from 'cesium';
import { WindLayer, type WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';
import {
  calculateElevationSlice,
  calculateHeightMeters,
  calculateNearestIndex,
  calculateSliceArgs,
  calculateXYFromBounds,
  detectCRS,
  getZarrData,
  getTimeSeries as queryTimeSeries,
  getVerticalProfile as queryVerticalProfile,
  initZarrDataset
} from 'zarr-maps-tiling';
import {
  type BoundsProps,
  type CesiumHost,
  type CRS,
  type CubeVelocityProps,
  type DimensionNamesProps,
  type MultiscaleFormat,
  type DimIndicesProps,
  type VelocityOptions,
  type VelocityWindOptions,
  type ZarrSelectorsProps
} from './types';
import type { ColorMapName, ColorScaleProps } from 'zarr-maps-colormap';
import type {
  QueryGeometry,
  QueryOptions,
  QueryPosition,
  QueryResult,
  ZarrSelectors
} from 'zarr-maps-tiling';
import { colormapBuilder } from 'zarr-maps-colormap';

import ndarray from 'ndarray';
import {
  DEFAULT_VERTICAL_EXAGGERATION,
  DEFAULT_WIND_OPTIONS,
  validateBounds
} from './cesium-utils';
import { DEFAULT_COLORMAP } from 'zarr-maps-tiling';
import type { RequestOverrides } from 'zarr-maps-tiling';
import { createFetchStore, createTransformedFetch } from './zarr-store-utils';

export interface VelocityQueryResult extends QueryResult {
  /** Vector components aligned with `values` (which contains speed). */
  components: {
    u: number[];
    v: number[];
  };
}

/**
 * Provider responsible for loading and rendering 3D velocity fields (U and V components)
 * from Zarr datasets as animated Cesium `WindLayer`s.
 *
 * @remarks
 * This provider targets the NOC-OI fork of `cesium-wind-layer` v0.11.0. The
 * fork adds bounded camera-driven particle scaling through `minVisibleRatio`
 * and restores overview styling after zooming back out. The provider loads 3D
 * vector data, slices it by elevation, and creates animated particle layers
 * that visualize flow direction and speed.
 *
 * @example
 * ```ts
 * const provider = new ZarrCubeVelocityProvider(viewer, {
 *   urls: { u: 'uo.zarr', v: 'vo.zarr' },
 *   variables: { u: 'uo', v: 'vo' },
 *   bounds: { west: -10, south: 30, east: 10, north: 45 }
 * });
 * await provider.load();
 * ```
 */
export class ZarrCubeVelocityProvider {
  /** Dimension coordinate arrays (e.g. lat, lon, elevation). */
  public dimensionValues: { [key: string]: Float64Array | number[] | string[] } = {};
  /** Cube dimensions: [longitude, latitude, elevation]. */
  public cubeDimensions: [number, number, number] | null = null;
  /** Unique identifier for the cube provider instance. */
  public id: string = '';
  /** User-defined selectors for slicing dimensions. */
  public selectors: { [key: string]: ZarrSelectorsProps };
  /** Shape (size) of the elevation dimension. */
  public elevationShape: number = 0;
  /** Information about multiscale levels in the Zarr dataset. */
  public levelInfos: string[] = [];
  /** Current multiscale level to load. */
  public multiscaleLevel: number = 0;
  /** Configuration defining the geographic bounds of the cube. */
  public bounds: BoundsProps;
  /**
   * Global coordinate offsets represented by index zero of the in-memory subset.
   *
   * @returns Elevation offset used by shared profile query helpers.
   */
  get queryIndexOffsets(): Record<string, number> {
    return { elevation: this.loadedOrigin.elevation };
  }
  private viewer: CesiumHost;
  private zarrVersion: 2 | 3 | null = null;
  private layers: WindLayer[] = [];
  private flipElevation: boolean = false;
  private urls: { u?: string; v?: string };
  private customStores: { u?: zarr.Readable; v?: zarr.Readable };
  private requestOverrides?: RequestOverrides;
  private transformedFetch?: typeof fetch;
  private variables: { u: string; v: string };
  private crs: CRS | null = null;
  private latIsAscendingOverride?: boolean;
  private latIsAscending: boolean = false;
  private dimensionNames: DimensionNamesProps;
  private multiscaleFormat: MultiscaleFormat = 'auto';
  private verticalExaggeration: number;
  private opacity: number;
  private sliceSpacing: number;
  private belowSeaLevel: boolean;
  private static readonly concurrencyLimit = 4;
  private static activeRequests = 0;
  private static readonly queue: (() => void)[] = [];
  private volumeData: { uCube: CubeVelocityProps; vCube: CubeVelocityProps } | null = null;
  private levelCache = new Map();
  private levelMetadata: Map<number, { width: number; height: number }> = new Map();
  private colorScale: ColorScaleProps;
  private colormap: ColorMapName = DEFAULT_COLORMAP;
  private windOptions: Partial<WindLayerOptions>;
  private windFlipYOverride?: boolean;
  private zarrArrays: Partial<Record<'u' | 'v', zarr.Array<any>>> = {};
  private validityData: Partial<Record<'u' | 'v', Uint8Array>> = {};
  private dimIndices: DimIndicesProps = {};
  private loadedOrigin = { x: 0, y: 0, elevation: 0 };

  /**
   * Creates a new {@link ZarrCubeVelocityProvider} instance.
   *
   * @param viewer - Cesium viewer or widget where the layers will be rendered.
   * @param options - Velocity dataset options (see {@link VelocityOptions}).
   * @throws If either U or V has neither a URL nor a custom store.
   */
  constructor(viewer: CesiumHost, options: VelocityOptions) {
    if ((!options.urls?.u && !options.stores?.u) || (!options.urls?.v && !options.stores?.v)) {
      throw new Error('ZarrCubeVelocityProvider requires a URL or store for both U and V');
    }
    this.viewer = viewer;
    this.urls = options.urls ?? {};
    this.customStores = options.stores ?? {};
    this.requestOverrides = options.requestOverrides;
    this.transformedFetch = options.transformRequest
      ? createTransformedFetch(options.transformRequest, options.onAuthError)
      : undefined;
    this.variables = options.variables;
    this.bounds = options.bounds;
    this.crs = options.crs ?? null;
    this.latIsAscendingOverride = options.latIsAscending;
    if (options.latIsAscending !== undefined) {
      this.latIsAscending = options.latIsAscending;
    }
    this.dimensionNames = options.dimensionNames ?? {};
    this.multiscaleFormat = options.multiscaleFormat ?? 'auto';
    this.multiscaleLevel = options.multiscaleLevel ?? 0;
    this.selectors = options.selectors ?? {};
    this.verticalExaggeration = options.verticalExaggeration ?? DEFAULT_VERTICAL_EXAGGERATION;
    this.opacity = options.opacity ?? 1;
    this.sliceSpacing = options.sliceSpacing ?? 1;
    this.belowSeaLevel = options.belowSeaLevel ?? false;
    this.zarrVersion = options.zarrVersion ?? null;
    const [min, max] = options.scale ?? [-3, 3];
    this.colormap = options.colormap || DEFAULT_COLORMAP;
    const colors = colormapBuilder(this.colormap, 'css', 255, this.opacity);
    this.colorScale = { min, max, colors };
    this.flipElevation = options.flipElevation ?? false;
    this.windFlipYOverride = options.windOptions?.flipY;
    const initialWindOptions = { ...(options.windOptions ?? {}) } as Partial<WindLayerOptions>;
    delete initialWindOptions.particleHeight;
    this.windOptions = {
      ...DEFAULT_WIND_OPTIONS,
      ...initialWindOptions
    };
    if (!this.windOptions.domain) {
      this.windOptions.domain = { min: this.colorScale.min, max: this.colorScale.max };
    }
    if (!this.windOptions.colors) {
      this.windOptions.colors = this.colorScale.colors as string[];
    }
  }

  private sanitizeArray(arr: Float32Array): Float32Array {
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) arr[i] = 0;
    }
    return arr;
  }

  private static async throttle<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeRequests >= this.concurrencyLimit) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.activeRequests++;
    try {
      return await fn();
    } finally {
      this.activeRequests--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
  private async loadZarrVariable(
    component: 'u' | 'v',
    variable: string
  ): Promise<CubeVelocityProps | null> {
    const store =
      this.customStores[component] ??
      createFetchStore(this.urls[component]!, this.requestOverrides, this.transformedFetch);
    const root = zarr.root(store);

    const { zarrArray, dimIndices, levelInfos, attrs, multiscaleLevel } = await initZarrDataset(
      store,
      root,
      variable,
      this.dimensionNames,
      this.levelMetadata,
      this.levelCache,
      this.zarrVersion,
      this.multiscaleLevel,
      this.multiscaleFormat
    );
    if (multiscaleLevel !== undefined) {
      this.multiscaleLevel = multiscaleLevel;
    }
    this.levelInfos = levelInfos;

    this.crs = this.crs || (await detectCRS(attrs, zarrArray));

    const shape = zarrArray.shape;
    this.zarrArrays[component] = zarrArray;
    if (component === 'u') this.dimIndices = dimIndices;

    if (!dimIndices.elevation) {
      console.warn('No elevation dimension found in Zarr array.');
      return null;
    }

    const height = shape[dimIndices.lat.index];
    const width = shape[dimIndices.lon.index];

    const { dimensionValuesWithElevation, elevationSlice } = await calculateElevationSlice(
      shape[dimIndices.elevation.index],
      dimIndices.elevation,
      this.selectors.elevation,
      this.dimensionValues,
      root,
      this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
      this.zarrVersion
    );

    const { x, y: descendingY } = calculateXYFromBounds(this.bounds, width, height, this.crs);
    let y: [number, number] = this.latIsAscending
      ? [height - descendingY[1], height - descendingY[0]]
      : descendingY;
    let sliceResult = await calculateSliceArgs(
      shape,
      {
        startX: x[0],
        endX: x[1],
        startY: y[0],
        endY: y[1],
        startElevation: elevationSlice[0],
        endElevation: elevationSlice[1]
      },
      dimIndices,
      this.selectors,
      dimensionValuesWithElevation,
      root,
      this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
      this.zarrVersion,
      true
    );
    this.dimensionValues = sliceResult.dimensionValues;
    this.resolveLatitudeOrientation();
    const resolvedY: [number, number] = this.latIsAscending
      ? [height - descendingY[1], height - descendingY[0]]
      : descendingY;
    if (resolvedY[0] !== y[0] || resolvedY[1] !== y[1]) {
      y = resolvedY;
      sliceResult = await calculateSliceArgs(
        shape,
        {
          startX: x[0],
          endX: x[1],
          startY: y[0],
          endY: y[1],
          startElevation: elevationSlice[0],
          endElevation: elevationSlice[1]
        },
        dimIndices,
        this.selectors,
        dimensionValuesWithElevation,
        root,
        this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
        this.zarrVersion,
        true
      );
      this.dimensionValues = sliceResult.dimensionValues;
    }
    this.selectors = sliceResult.selectors;
    this.elevationShape = zarrArray.shape[dimIndices.elevation.index];
    if (component === 'u') {
      this.loadedOrigin = { x: x[0], y: y[0], elevation: elevationSlice[0] };
    }

    const data = await getZarrData(zarrArray, sliceResult.sliceArgs);

    const arr = new Float32Array(data.data as ArrayLike<number>);
    this.validityData[component] = Uint8Array.from(arr, value => Number.isFinite(value) ? 1 : 0);
    this.sanitizeArray(arr);

    return {
      array: ndarray(arr, data.shape, data.stride),
      width: x[1] - x[0],
      height: y[1] - y[0],
      elevation: elevationSlice[1] - elevationSlice[0],
      dimensionValues: sliceResult.dimensionValues
    };
  }

  /**
   * Loads both U and V components of the velocity field from their respective Zarr datasets.
   *
   * @returns A promise resolved after both components, coordinates, selected
   * subsets, and all elevation wind layers have loaded.
   * @throws When either custom or URL-backed store, selected array, dimensions, or data chunks cannot be read.
   * @remarks U and V are loaded concurrently and must describe compatible grids.
   */
  async load(): Promise<void> {
    const [uCube, vCube] = await Promise.all([
      this.loadZarrVariable('u', this.variables.u),
      this.loadZarrVariable('v', this.variables.v)
    ]);
    if (!uCube || !vCube) {
      console.error('Failed to load U or V component data.');
      return;
    }
    this.cubeDimensions = [uCube.width, uCube.height, uCube.elevation];
    this.volumeData = { uCube, vCube };

    await this.createWindLayers();
  }

  private resolveLatitudeOrientation(): void {
    if (this.latIsAscendingOverride !== undefined) {
      this.latIsAscending = this.latIsAscendingOverride;
      return;
    }
    const values = this.dimensionValues.lat as ArrayLike<number> | undefined;
    if (values && values.length > 1) {
      this.latIsAscending = Number(values[0]) < Number(values[values.length - 1]);
      return;
    }
    console.warn('Failed to infer latitude ordering. Falling back to descending latitude.');
  }

  private async createWindLayers(): Promise<void> {
    if (!this.volumeData) {
      console.error('Volume data not loaded.');
      return;
    }
    const { uCube, vCube } = this.volumeData;
    const { width, height, dimensionValues } = uCube;

    for (let d = 0; d < dimensionValues.elevation.length; d += this.sliceSpacing) {
      const offset = d * width * height;
      const uoSlice = uCube.array.data.subarray(offset, offset + width * height);
      const voSlice = vCube.array.data.subarray(offset, offset + width * height);

      const windData = {
        u: { array: uoSlice, min: -0.5, max: 0.5 },
        v: { array: voSlice, min: -0.5, max: 0.5 },
        width,
        height,
        unit: 'm s-1',
        bounds: this.bounds
      };
      const elevationValue = dimensionValues.elevation[d];
      const altitude = calculateHeightMeters(
        elevationValue as number,
        this.dimensionValues.elevation as number[],
        this.verticalExaggeration,
        this.belowSeaLevel,
        this.flipElevation
      );
      const layerOptions = {
        ...this.windOptions,
        flipY: this.windFlipYOverride ?? !this.latIsAscending,
        // Zarr elevation is authoritative for velocity-layer height.
        particleHeight: altitude
      };

      // WindLayer only uses APIs shared by Viewer and CesiumWidget, but its
      // published declaration currently narrows this parameter to Viewer.
      const layer = new WindLayer(this.viewer as Viewer, windData, layerOptions);
      this.layers.push(layer);
    }
  }

  /**
   * Queries velocity components and derived speed at a WGS84 point.
   *
   * @param geometry - Point geometry in `[longitude, latitude]` degrees.
   * @param selectors - Optional time/elevation selectors for this query.
   * @param options - Cancellation and coordinate-output controls.
   * @returns Speed values plus aligned U and V component arrays.
   * @throws For unsupported geometries, invalid selectors, or failed reads.
   * @remarks A ranged elevation selector returns a vertical profile; a ranged
   * time selector reads the source arrays instead of only the rendered layers.
   */
  async queryData(
    geometry: QueryGeometry,
    selectors: ZarrSelectors = {},
    options: QueryOptions = {}
  ): Promise<VelocityQueryResult> {
    if (geometry.type !== 'Point') {
      throw new Error(`Query geometry ${geometry.type} is not implemented; only Point is supported`);
    }
    this.throwIfQueryAborted(options.signal);
    const [longitude, latitude] = geometry.coordinates;
    const emptyResult = (): VelocityQueryResult => ({
      variable: 'current_speed',
      values: [],
      dimensions: [],
      coordinates: {},
      components: { u: [], v: [] }
    });
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < this.bounds.west ||
      longitude > this.bounds.east ||
      latitude < this.bounds.south ||
      latitude > this.bounds.north
    ) {
      return emptyResult();
    }

    const timeKey = this.dimIndices.time?.name ?? 'time';
    const timeSelection = selectors.time ?? selectors[timeKey];
    if (timeSelection && Array.isArray(timeSelection.selected)) {
      return this.queryVelocityTimeSeries(
        longitude,
        latitude,
        timeSelection,
        selectors,
        options
      );
    }

    const elevationKey = this.dimIndices.elevation?.name ?? 'elevation';
    const elevationSelection = selectors.elevation ?? selectors[elevationKey];
    const requestedIndices = this.resolveElevationIndices(elevationSelection);
    const values: number[] = [];
    const u: number[] = [];
    const v: number[] = [];
    const elevations: (number | string)[] = [];
    for (const elevationIndex of requestedIndices) {
      this.throwIfQueryAborted(options.signal);
      if (!this.hasValidCurrentAt(longitude, latitude, elevationIndex)) continue;
      const layerIndex = globalThis.Math.floor(elevationIndex / this.sliceSpacing);
      const layer = this.layers[layerIndex];
      if (!layer || elevationIndex % this.sliceSpacing !== 0) continue;
      const current = layer.getDataAtLonLat(longitude, latitude);
      if (!current || !Number.isFinite(current.interpolated.speed)) continue;
      values.push(current.interpolated.speed);
      u.push(current.interpolated.u);
      v.push(current.interpolated.v);
      elevations.push(this.dimensionValues.elevation[elevationIndex]);
    }

    const coordinates: QueryResult['coordinates'] = {};
    if (values.length > 0) {
      coordinates[elevationKey] = elevations;
      if (options.includeSpatialCoordinates !== false) {
        coordinates[this.dimIndices.lon?.name ?? 'lon'] = [longitude];
        coordinates[this.dimIndices.lat?.name ?? 'lat'] = [latitude];
      }
    }
    return {
      variable: 'current_speed',
      values,
      dimensions: values.length > 0 ? Object.keys(coordinates) : [],
      coordinates,
      components: { u, v }
    };
  }

  private hasValidCurrentAt(
    longitude: number,
    latitude: number,
    elevationIndex: number
  ): boolean {
    if (!this.cubeDimensions) return false;
    const longitudeValues = this.dimensionValues.lon;
    const latitudeValues = this.dimensionValues.lat;
    const uValidity = this.validityData.u;
    const vValidity = this.validityData.v;
    if (!longitudeValues?.length || !latitudeValues?.length || !uValidity || !vValidity) {
      return false;
    }
    let sourceLongitude = longitude;
    if (Number(longitudeValues[0]) >= 0 && Number(longitudeValues[longitudeValues.length - 1]) > 180) {
      sourceLongitude = ((longitude % 360) + 360) % 360;
    }
    const longitudeIndex = calculateNearestIndex(longitudeValues, sourceLongitude);
    const latitudeIndex = calculateNearestIndex(latitudeValues, latitude);
    const [width, height] = this.cubeDimensions;
    const flatIndex = elevationIndex * width * height + latitudeIndex * width + longitudeIndex;
    return uValidity[flatIndex] === 1 && vValidity[flatIndex] === 1;
  }

  /** Query every loaded elevation at a point. */
  /**
   * Queries all loaded elevation values and vector components at one position.
   *
   * @param position - `[longitude, latitude]` in WGS84 degrees.
   * @param selectors - Fixed selectors for dimensions other than elevation.
   * @param options - Query cancellation and coordinate-output controls.
   * @returns Speed and component values ordered by elevation.
   */
  getVerticalProfile(
    position: QueryPosition,
    selectors?: ZarrSelectors,
    options?: QueryOptions
  ): Promise<QueryResult> {
    return queryVerticalProfile(this, position, selectors, options);
  }

  /** Query all times at the first (lowest-index) loaded Zarr elevation. */
  /**
   * Queries all time values and vector components at one position.
   *
   * @param position - `[longitude, latitude]` in WGS84 degrees.
   * @param selectors - Fixed selectors for dimensions other than time.
   * @param options - Query cancellation and coordinate-output controls.
   * @returns Speed and component values ordered by time.
   */
  getTimeSeries(
    position: QueryPosition,
    selectors?: ZarrSelectors,
    options?: QueryOptions
  ): Promise<QueryResult> {
    return queryTimeSeries(this, position, selectors, options);
  }

  private resolveElevationIndices(selection?: ZarrSelectorsProps): number[] {
    const elevations = this.dimensionValues.elevation;
    if (!elevations?.length) throw new Error('Velocity elevation coordinates are unavailable');
    if (!selection || !Array.isArray(selection.selected)) return [0];

    let start: number;
    let end: number;
    if (selection.type === 'value') {
      const first = calculateNearestIndex(elevations, selection.selected[0]);
      const last = calculateNearestIndex(elevations, selection.selected[1]);
      start = globalThis.Math.min(first, last);
      end = globalThis.Math.max(first, last) + 1;
    } else {
      start = Number(selection.selected[0]) - this.loadedOrigin.elevation;
      end = Number(selection.selected[1]) - this.loadedOrigin.elevation;
    }
    if (start < 0 || end <= start || end > elevations.length) {
      throw new RangeError('Elevation profile is outside the loaded velocity cube bounds');
    }
    return Array.from({ length: end - start }, (_, index) => start + index);
  }

  private async queryVelocityTimeSeries(
    longitude: number,
    latitude: number,
    timeSelection: ZarrSelectorsProps,
    selectors: ZarrSelectors,
    options: QueryOptions
  ): Promise<VelocityQueryResult> {
    const uArray = this.zarrArrays.u;
    const vArray = this.zarrArrays.v;
    const timeInfo = this.dimIndices.time;
    const elevationInfo = this.dimIndices.elevation;
    if (!uArray || !vArray || !timeInfo || !elevationInfo) {
      throw new Error('Velocity Zarr arrays do not have queryable time and elevation dimensions');
    }
    const timeValues = this.dimensionValues.time;
    const lonValues = this.dimensionValues.lon;
    const latValues = this.dimensionValues.lat;
    if (!timeValues?.length || !lonValues?.length || !latValues?.length) {
      throw new Error('Velocity coordinate values are unavailable');
    }
    if (!Array.isArray(timeSelection.selected)) {
      throw new Error('A time series requires a ranged time selector');
    }

    let timeStart: number;
    let timeEnd: number;
    if (timeSelection.type === 'value') {
      const first = calculateNearestIndex(timeValues, timeSelection.selected[0]);
      const last = calculateNearestIndex(timeValues, timeSelection.selected[1]);
      timeStart = globalThis.Math.min(first, last);
      timeEnd = globalThis.Math.max(first, last) + 1;
    } else {
      timeStart = Number(timeSelection.selected[0]);
      timeEnd = Number(timeSelection.selected[1]);
    }
    if (timeStart < 0 || timeEnd <= timeStart || timeEnd > uArray.shape[timeInfo.index]) {
      throw new RangeError('Time-series selector is outside the velocity array bounds');
    }

    let sourceLongitude = longitude;
    if (Number(lonValues[0]) >= 0 && Number(lonValues[lonValues.length - 1]) > 180) {
      sourceLongitude = ((longitude % 360) + 360) % 360;
    }
    const localLonIndex = calculateNearestIndex(lonValues, sourceLongitude);
    const localLatIndex = calculateNearestIndex(latValues, latitude);
    const createSelection = (array: zarr.Array<any>) => {
      const selection: (number | ReturnType<typeof zarr.slice>)[] = new Array(array.shape.length).fill(0);
      selection[this.dimIndices.lon.index] = this.loadedOrigin.x + localLonIndex;
      selection[this.dimIndices.lat.index] = this.loadedOrigin.y + localLatIndex;
      // Time series are intentionally queried at the first loaded elevation.
      selection[elevationInfo.index] = this.loadedOrigin.elevation;
      selection[timeInfo.index] = zarr.slice(timeStart, timeEnd);
      for (const [dimension, dimInfo] of Object.entries(this.dimIndices)) {
        if (['lon', 'lat', 'elevation', 'time'].includes(dimension)) continue;
        const selector = selectors[dimension] ?? selectors[dimInfo.name] ?? this.selectors[dimension];
        if (selector && !Array.isArray(selector.selected)) {
          selection[dimInfo.index] = selector.type === 'value'
            ? calculateNearestIndex(this.dimensionValues[dimension], selector.selected)
            : Number(selector.selected);
        }
      }
      return selection;
    };

    this.throwIfQueryAborted(options.signal);
    const requestOptions = options.signal ? { opts: { signal: options.signal } } : undefined;
    const [uData, vData] = await Promise.all([
      getZarrData(uArray, createSelection(uArray), requestOptions),
      getZarrData(vArray, createSelection(vArray), requestOptions)
    ]);
    this.throwIfQueryAborted(options.signal);

    const values: number[] = [];
    const u: number[] = [];
    const v: number[] = [];
    const validTimes: (number | string)[] = [];
    const sampleCount = globalThis.Math.min(uData.data.length, vData.data.length);
    for (let index = 0; index < sampleCount; index++) {
      const uValue = Number(uData.data[index]);
      const vValue = Number(vData.data[index]);
      if (!Number.isFinite(uValue) || !Number.isFinite(vValue)) continue;
      u.push(uValue);
      v.push(vValue);
      values.push(globalThis.Math.hypot(uValue, vValue));
      validTimes.push(timeValues[timeStart + index]);
    }

    const coordinates: QueryResult['coordinates'] = {
      [timeInfo.name]: validTimes,
      [elevationInfo.name]: [this.dimensionValues.elevation[0]]
    };
    if (options.includeSpatialCoordinates !== false && values.length > 0) {
      coordinates[this.dimIndices.lon?.name ?? 'lon'] = [longitude];
      coordinates[this.dimIndices.lat?.name ?? 'lat'] = [latitude];
    }
    return {
      variable: 'current_speed',
      values,
      dimensions: values.length > 0 ? Object.keys(coordinates) : [],
      coordinates,
      components: { u, v }
    };
  }

  private throwIfQueryAborted(signal?: AbortSignal): void {
    if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
  }

  /**
   * Updates the dimension selectors, multiscale level, or geographic bounds,
   * and reloads the velocity data accordingly.
   *
   * @param options - Partial data-selection update. Changed selectors, level,
   * or bounds destroy the existing wind layers and reload both components.
   * @returns A promise that resolves after the change is scheduled. If no value
   * changed, it resolves without rebuilding layers.
   * @remarks Latitude bounds are clamped to the Web Mercator limit.
   */
  async updateSelectors({
    selectors,
    multiscaleLevel,
    bounds
  }: {
    selectors?: { [key: string]: ZarrSelectorsProps };
    multiscaleLevel?: number;
    bounds?: BoundsProps;
  }): Promise<void> {
    let updateLayer = false;
    if (selectors !== undefined) {
      for (const key of Object.keys(selectors)) {
        if (
          !this.selectors[key] ||
          JSON.stringify(this.selectors[key]) !== JSON.stringify(selectors[key])
        ) {
          this.selectors[key] = selectors[key];
          updateLayer = true;
        }
      }
    }
    if (multiscaleLevel !== undefined && this.multiscaleLevel !== multiscaleLevel) {
      this.multiscaleLevel = multiscaleLevel;
      updateLayer = true;
    }
    if (bounds !== undefined && JSON.stringify(this.bounds) !== JSON.stringify(bounds)) {
      if (validateBounds(bounds)) {
        bounds.south = Math.clamp(bounds.south, -85.05112878, 85.05112878);
        bounds.north = Math.clamp(bounds.north, -85.05112878, 85.05112878);
        this.bounds = bounds;
        updateLayer = true;
      }
    }
    if (updateLayer) {
      this.destroy();
      this.load();
    }
  }

  /**
   * Updates the rendered slices (number of vertical layers) based on the spacing or exaggeration.
   *
   * @param options - Partial slice-layout update. `sliceSpacing` is an elevation
   * index interval; `verticalExaggeration` scales height; `belowSeaLevel`
   * controls whether depth is placed beneath the ellipsoid.
   * @returns A promise resolved after replacement wind layers are created.
   * @remarks Non-positive spacing/exaggeration and spacing beyond the elevation
   * dimension are rejected with a warning.
   */
  async updateSlices({
    sliceSpacing,
    verticalExaggeration,
    belowSeaLevel
  }: {
    sliceSpacing?: number;
    verticalExaggeration?: number;
    belowSeaLevel?: boolean;
  }): Promise<void> {
    if (!this.volumeData || !this.cubeDimensions) return;
    let updateLayers = false;
    if (sliceSpacing !== undefined) {
      if (sliceSpacing <= 0) {
        console.warn('Slice spacing must be a positive integer.');
        return;
      }
      if (sliceSpacing >= this.dimensionValues.elevation.length) {
        console.warn('Slice spacing exceeds number of elevation levels.');
        return;
      }
      if (this.sliceSpacing !== sliceSpacing) {
        this.sliceSpacing = sliceSpacing;
        updateLayers = true;
      }
    }
    if (belowSeaLevel !== undefined) {
      if (this.belowSeaLevel !== belowSeaLevel) {
        updateLayers = true;
        this.belowSeaLevel = belowSeaLevel;
      }
    }
    if (verticalExaggeration !== undefined) {
      if (verticalExaggeration <= 0) {
        console.warn('Vertical exaggeration must be a positive integer.');
        return;
      }
      if (this.verticalExaggeration !== verticalExaggeration) {
        updateLayers = true;
        this.verticalExaggeration = verticalExaggeration;
      }
    }
    if (!updateLayers) return;
    this.destroy();
    await this.createWindLayers();
  }

  /**
   * Updates the visual style of the velocity layers, such as opacity,
   * color scale, or particle simulation parameters.
   *
   * @param options - Partial style update. `windOptions` are forwarded to each
   * WindLayer except `particleHeight`, which remains derived from Zarr elevation.
   * @remarks Existing layers are updated in place; source data is not reloaded.
   */
  updateStyle({
    opacity,
    scale,
    colormap,
    windOptions
  }: {
    opacity?: number;
    scale?: [number, number];
    colormap?: ColorMapName;
    windOptions?: VelocityWindOptions;
  }): void {
    if (opacity !== undefined) {
      this.opacity = opacity;
      const colors = colormapBuilder(this.colormap, 'css', 255, this.opacity);
      this.colorScale.colors = colors;
    }
    if (scale !== undefined) {
      const [min, max] = scale;
      this.colorScale.min = min;
      this.colorScale.max = max;
    }
    if (colormap !== undefined) {
      const colors = colormapBuilder(colormap, 'css', 255, this.opacity);
      this.colorScale.colors = colors;
      this.colormap = colormap;
    }
    if (windOptions !== undefined) {
      if (windOptions.flipY !== undefined) {
        this.windFlipYOverride = windOptions.flipY;
      }
      const updatedWindOptions = { ...windOptions } as Partial<WindLayerOptions>;
      delete updatedWindOptions.particleHeight;
      this.windOptions = {
        ...this.windOptions,
        ...updatedWindOptions
      };
    }
    this.windOptions = {
      ...this.windOptions,
      domain: { min: this.colorScale.min, max: this.colorScale.max },
      colors: this.colorScale.colors as string[]
    };
    for (const layer of this.layers) {
      layer.updateOptions(this.windOptions);
    }
  }

  /**
   * Removes all active wind layers from the Cesium scene.
   *
   * @remarks Loaded U/V arrays and selectors remain in memory. Call
   * {@link updateSlices} or {@link load} to render layers again.
   */
  destroy(): void {
    for (const layer of this.layers) {
      layer.remove();
    }
    this.layers = [];
  }
}
