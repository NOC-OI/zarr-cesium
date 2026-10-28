import { cubePointIndices, longitudeInBounds, validateCubeBounds } from './cube-coordinates';
import { ZarrCubeDataProvider } from './zarr-cube-data-provider';
import * as zarr from 'zarrita';
import {
  calculateNearestIndex,
  createFetchStore,
  createTransformedFetch,
  detectCRS,
  extractNoDataMetadata,
  getZarrData,
  getCubeDimensions,
  getFullTransect as queryFullTransect,
  getTimeSeries as queryTimeSeries,
  getTransect as queryTransect,
  getVerticalProfile as queryVerticalProfile,
  initZarrDataset,
  resolveCRS,
  type QueryGeometry,
  type QueryOptions,
  type QueryPosition,
  type QueryResult,
  type FullTransectResult,
  type TransectQueryOptions,
  type TransectResult,
  type ZarrSelectors
} from 'zarr-maps-tiling';
import {
  DimensionValues,
  type BoundsProps,
  type CRS,
  type CubeOptions,
  type CesiumHost,
  type ElevationMode,
  type DimensionNamesProps,
  type DimIndicesProps,
  type MultiscaleFormat,
  type ZarrLevelMetadata,
  type ZarrSelectorsProps,
  CubeCrossSectionPoint
} from './types';
import { colormapBuilder, type ColorMapName, type ColorScaleProps } from 'zarr-maps-colormap';
import { updateImgData } from 'zarr-maps-tiling';
import {
  Primitive,
  GeometryInstance,
  Material,
  MaterialAppearance,
  Geometry,
  GeometryAttribute,
  GeometryAttributes,
  ComponentDatatype,
  PrimitiveType,
  BoundingSphere,
  Cartesian3,
  Math
} from 'cesium';
import ndarray from 'ndarray';
import { DEFAULT_VERTICAL_EXAGGERATION } from './cesium-utils';
import { DEFAULT_COLORMAP, DEFAULT_OPACITY, DEFAULT_SCALE } from 'zarr-maps-tiling';
import type { RequestOverrides } from 'zarr-maps-tiling';
import { CubeGpuRenderer } from './cube-gpu-renderer';

/**
 * Provides rendering of volumetric (3D) Zarr datasets as Cesium primitives.
 *
 * @remarks
 * This class handles loading Zarr cubes, slicing them along latitude,
 * longitude, and elevation axes, and rendering those slices as textured
 * Cesium primitives (both horizontal and vertical).
 *
 * It supports configurable color scales, opacity, vertical exaggeration,
 * and multiple visualization modes.
 *
 * @example
 * ```ts
 * const cubeProvider = new ZarrCubeProvider(viewer, {
 *   url: 'https://example.com/mycube.zarr',
 *   variable: 'temperature',
 *   bounds: { west: -20, south: 30, east: 10, north: 60 },
 *   showHorizontalSlices: true,
 *   showVerticalSlices: true,
 *   colormap: 'viridis'
 * });
 *
 * await cubeProvider.load();
 * ```
 */
export class ZarrCubeProvider {
  /** Values of the cube’s coordinate dimensions (latitude, longitude, elevation, etc.). */
  public dimensionValues: DimensionValues = {};
  /** Coordinate values represented by the currently loaded cube subset. */
  public cubeDimensionValues: DimensionValues = {};
  /** Size of the cube in [longitude, latitude, elevation]. */
  public cubeDimensions: [number, number, number] | null = null;
  /** Unique identifier for the cube provider instance. */
  public id: string = '';
  /** User-defined selectors for slicing dimensions. */
  public selectors: { [key: string]: ZarrSelectorsProps };
  /** Shape (size) of the elevation dimension. */
  public elevationShape: number = 0;
  /** Current index of the latitude slice being visualized. */
  public latSliceIndex: number = -1;
  /** Current index of the longitude slice being visualized. */
  public lonSliceIndex: number = -1;
  /** Current index of the elevation slice being visualized. */
  public elevationSliceIndex: number = -1;
  /** Information about multiscale levels in the Zarr dataset. */
  public levelInfos: string[] = [];
  /** Current multiscale level to load. */
  public multiscaleLevel: number = 0;
  /** Configuration defining the geographic bounds of the cube. */
  public bounds: BoundsProps = { west: -180, south: -90, east: 180, north: 90 };
  private viewer: CesiumHost;
  private zarrVersion: 2 | 3 | null = null;
  private flipElevation: boolean = false;
  private url?: string;
  private customStore?: zarr.Readable;
  private requestOverrides?: RequestOverrides;
  private transformedFetch?: typeof fetch;
  private variable: string;
  private crs: CRS | null = null;
  private requestedBounds?: BoundsProps;
  private projectionDefinition?: string | Record<string, unknown>;
  private projection: import('zarr-maps-tiling').ResolvedCRS | null = null;
  private latIsAscendingOverride?: boolean;
  private latIsAscending: boolean = false;
  private dimensionNames: DimensionNamesProps;
  private multiscaleFormat: MultiscaleFormat = 'auto';
  private verticalExaggeration: number;
  private maximumElevationValue = 0;
  /** Numeric coordinates used only for plane placement; labels remain unchanged. */
  private renderingElevationValues: number[] = [];
  private opacity: number;
  private showHorizontalSlices: boolean;
  private showVerticalSlices: boolean;
  private elevationMode: ElevationMode;
  private volumeData: ndarray.NdArray<any> | null = null;
  private scaleFactor = 1;
  private addOffset = 0;
  private fillValue: number | undefined;
  private useFillValue = false;
  private noDataMin: number | undefined;
  private noDataMax: number | undefined;
  private longitudeIndices: number[] = [];
  private loadedOrigin = { x: 0, y: 0, elevation: 0 };

  /**
   * Global coordinate offsets represented by index zero of the in-memory subset.
   *
   * @returns Offsets used by shared profile and transect query helpers.
   */
  get queryIndexOffsets(): Record<string, number> {
    return { elevation: this.loadedOrigin.elevation };
  }
  /** Coordinate values addressable by queries against the loaded cube subset. */
  get queryDimensionValues(): DimensionValues {
    return this.cubeDimensionValues;
  }
  private static readonly concurrencyLimit = 4;
  private static activeRequests = 0;
  private static readonly queue: (() => void)[] = [];

  private levelCache = new Map();
  private levelMetadata: Map<number, ZarrLevelMetadata> = new Map();
  private zarrArray: zarr.Array<any> | null = null;
  private dimIndices: DimIndicesProps = {};
  private store!: zarr.Readable;
  private root: zarr.Location<zarr.Readable> | null = null;
  private colorScale: ColorScaleProps;
  private colormap: ColorMapName;
  private horizontalPrimitives: Primitive | null = null;
  private verticalLonPrimitives: Primitive | null = null;
  private verticalLatPrimitives: Primitive | null = null;
  private gpuRenderer: CubeGpuRenderer | null = null;
  private gpuFallbackReason: string | null = null;
  private crossSection: { start: CubeCrossSectionPoint; end: CubeCrossSectionPoint } | null = null;
  /**
   * Creates a new instance of {@link ZarrCubeProvider}.
   *
   * @param viewer - Cesium viewer or widget instance to which primitives will be added.
   * @param options - Configuration for the cube visualization (see {@link CubeOptions}).
   * @throws If neither `options.url` nor `options.store` is provided.
   */
  constructor(viewer: CesiumHost, options: CubeOptions) {
    if (!options.url && !options.store) {
      throw new Error('ZarrCubeProvider requires either url or store');
    }
    this.viewer = viewer;
    this.url = options.url;
    this.customStore = options.store;
    this.requestOverrides = options.requestOverrides;
    this.transformedFetch = options.transformRequest
      ? createTransformedFetch(options.transformRequest, options.onAuthError)
      : undefined;
    this.variable = options.variable;
    this.requestedBounds = options.bounds ? { ...options.bounds } : undefined;
    if (this.requestedBounds) this.bounds = { ...this.requestedBounds };
    this.dimensionNames = options.dimensionNames ?? {};
    this.crs = options.crs || null;
    this.projectionDefinition = options.proj4;
    this.latIsAscendingOverride = options.latIsAscending;
    if (options.latIsAscending !== undefined) {
      this.latIsAscending = options.latIsAscending;
    }
    this.multiscaleFormat = options.multiscaleFormat ?? 'auto';
    this.multiscaleLevel = options.multiscaleLevel ?? 0;
    this.selectors = structuredClone(options.selectors ?? {});
    this.verticalExaggeration = options.verticalExaggeration ?? DEFAULT_VERTICAL_EXAGGERATION;
    this.opacity = options.opacity ?? DEFAULT_OPACITY;
    this.showHorizontalSlices = options.showHorizontalSlices ?? true;
    this.showVerticalSlices = options.showVerticalSlices ?? true;
    this.elevationMode = options.elevationMode ?? 'height';
    this.zarrVersion = options.zarrVersion ?? null;
    this.flipElevation = options.flipElevation ?? false;
    this.noDataMin = options.noDataMin;
    this.noDataMax = options.noDataMax;
    const [min, max] = options.scale ?? DEFAULT_SCALE;
    this.colormap = options.colormap ?? DEFAULT_COLORMAP;
    const colors = colormapBuilder(this.colormap);
    this.colorScale = { min, max, colors };
  }

  /**
   * Loads the Zarr dataset and initializes the cube data and metadata.
   *
   * @param force - Recreate slice primitives even when their indices did not change.
   * @returns A promise that resolves after metadata, coordinates, the selected
   * subset, and its Cesium primitives have loaded.
   * @throws When the custom or URL-backed store, selected array, dimensions, or data chunks cannot be read.
   * @remarks Calling `load` again replaces the in-memory subset. Use
   * {@link updateSelectors} for normal runtime changes.
   */
  async load(force: boolean = false): Promise<void> {
    this.store =
      this.customStore ?? createFetchStore(this.url!, this.requestOverrides, this.transformedFetch);
    this.root = zarr.root(this.store);
    const { zarrArray, dimIndices, levelInfos, attrs, multiscaleLevel } = await initZarrDataset(
      this.store,
      this.root,
      this.variable,
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
    this.zarrArray = zarrArray as unknown as zarr.Array<any>;
    this.dimIndices = dimIndices;
    this.levelInfos = levelInfos;
    this.scaleFactor = attrs.scale_factor ?? 1;
    this.addOffset = attrs.add_offset ?? 0;
    const noDataMetadata = extractNoDataMetadata(zarrArray);
    this.fillValue = noDataMetadata.fillValue;
    this.useFillValue = noDataMetadata.useFillValue;
    this.noDataMin ??= noDataMetadata.metadataMin;
    this.noDataMax ??= noDataMetadata.metadataMax;

    this.crs = this.crs || (this.projectionDefinition ? 'CUSTOM:SOURCE' : null) ||
      (await detectCRS(attrs, zarrArray));
    this.projection = resolveCRS(this.crs, this.projectionDefinition, attrs, zarrArray.attrs);
    this.crs = this.projection.code;

    if (!this.dimIndices.elevation) {
      console.warn('No elevation dimension found in Zarr array.');
      return;
    }
    const levelInfo = this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null;
    const cube = await new ZarrCubeDataProvider({
      array: this.zarrArray,
      root: this.root,
      dimensions: this.dimIndices,
      level: levelInfo,
      zarrVersion: this.zarrVersion,
      selectors: this.selectors,
      bounds: this.requestedBounds,
      projection: this.projection,
      latIsAscending: this.latIsAscendingOverride
    }).load();
    this.dimensionValues = cube.dimensionValues;
    this.cubeDimensionValues = cube.cubeDimensionValues;
    this.bounds = cube.bounds;
    const elevationCoordinates = this.cubeDimensionValues.elevation ?? [];
    this.renderingElevationValues = Array.from(
      { length: elevationCoordinates.length },
      (_, index) => {
        const value = elevationCoordinates[index];
        return typeof value === 'number' && Number.isFinite(value) ? value : index;
      }
    );
    this.maximumElevationValue = this.renderingElevationValues.length > 0
      ? globalThis.Math.max(...this.renderingElevationValues)
      : 0;
    this.selectors = cube.selectors;
    this.loadedOrigin = cube.origin;
    this.longitudeIndices = cube.coordinates.x;
    this.latIsAscending = cube.coordinates.latIsAscending;
    this.elevationShape = this.zarrArray.shape[this.dimIndices.elevation.index];
    this.volumeData = cube.data;
    this.cubeDimensions = cube.dimensions;
    this.initializeGpuRenderer();
    this.updateSlices({
      latIndex: this.latIsAscending ? this.cubeDimensions[1] - 1 : 0,
      lonIndex: 0,
      elevationIndex: 0,
      force
    });
  }

  /**
   * Queries a voxel or vertical profile from the cube subset currently held in memory.
   * A scalar elevation selector returns one voxel; an elevation range returns a profile.
   *
   * @param geometry - WGS84 point geometry in `[longitude, latitude]` degrees.
   * @param selectors - Optional time/elevation overrides for this query.
   * @param options - Cancellation and coordinate-output controls.
   * @returns Queried values with coordinates expressed using dataset dimension names.
   * @throws If called before {@link load}, for unsupported geometries, or for
   * selector indices outside the loaded subset.
   */
  async queryData(
    geometry: QueryGeometry,
    selectors?: Record<string, ZarrSelectorsProps>,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    if (geometry.type !== 'Point') {
      throw new Error(
        `Query geometry ${geometry.type} is not implemented; only Point is supported`
      );
    }
    if (!this.volumeData || !this.cubeDimensions) {
      throw new Error('ZarrCubeProvider must be loaded before it can be queried');
    }
    this.throwIfQueryAborted(options.signal);

    const [inputLongitude, latitude] = geometry.coordinates;
    const longitude = longitudeInBounds(inputLongitude, this.bounds);
    const emptyResult = (): QueryResult => ({
      variable: this.variable,
      values: [],
      dimensions: [],
      coordinates: {}
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

    const lonValues = this.cubeDimensionValues.lon;
    const latValues = this.cubeDimensionValues.lat;
    const elevationValues = this.cubeDimensionValues.elevation;
    if (!lonValues || !latValues || !elevationValues) {
      throw new Error('Cube spatial coordinate values are unavailable');
    }
    const [lonIndex, latIndex] = cubePointIndices(
      lonValues,
      latValues,
      longitude,
      latitude,
      this.projection!
    );

    const timeKey = this.dimIndices.time?.name ?? 'time';
    const requestedTime = selectors?.time ?? selectors?.[timeKey];
    if (requestedTime && Array.isArray(requestedTime.selected)) {
      return this.queryTimeSeries(
        longitude,
        latitude,
        lonIndex,
        latIndex,
        requestedTime,
        selectors ?? {},
        options
      );
    }

    const elevationKey = this.dimIndices.elevation?.name ?? 'elevation';
    const requestedElevation = selectors?.elevation ?? selectors?.[elevationKey];
    for (const [requestedDimension, selector] of Object.entries(selectors ?? {})) {
      const dimension = this.dimIndices[requestedDimension]
        ? requestedDimension
        : Object.keys(this.dimIndices).find(
            key => this.dimIndices[key].name === requestedDimension
          );
      if (!dimension || dimension === 'lon' || dimension === 'lat') {
        throw new Error(`Unknown or spatial selector dimension: ${requestedDimension}`);
      }
      if (dimension !== 'elevation') {
        const current = this.selectors[dimension]?.selected;
        if (JSON.stringify(current) !== JSON.stringify(selector.selected)) {
          throw new Error(
            `The loaded cube cannot query a different ${requestedDimension} selector; reload it first`
          );
        }
      }
    }

    const loadedElevation = this.selectors.elevation?.selected;
    const globalElevationOffset = Array.isArray(loadedElevation) ? Number(loadedElevation[0]) : 0;
    const selection = requestedElevation ??
      this.selectors.elevation ?? {
        selected: globalElevationOffset,
        type: 'index' as const
      };
    let elevationIndices: number[];
    if (Array.isArray(selection.selected)) {
      let start: number;
      let end: number;
      if (selection.type === 'value') {
        const first = calculateNearestIndex(elevationValues, selection.selected[0]);
        const last = calculateNearestIndex(elevationValues, selection.selected[1]);
        start = globalThis.Math.min(first, last);
        end = globalThis.Math.max(first, last) + 1;
      } else {
        start = Number(selection.selected[0]) - globalElevationOffset;
        end = Number(selection.selected[1]) - globalElevationOffset;
      }
      if (start < 0 || end <= start || end > elevationValues.length) {
        throw new RangeError('Elevation profile is outside the loaded cube bounds');
      }
      elevationIndices = Array.from({ length: end - start }, (_, index) => start + index);
    } else {
      const index =
        selection.type === 'value'
          ? calculateNearestIndex(elevationValues, selection.selected)
          : Number(selection.selected) - globalElevationOffset;
      if (!Number.isInteger(index) || index < 0 || index >= elevationValues.length) {
        throw new RangeError('Elevation selector is outside the loaded cube bounds');
      }
      elevationIndices = [index];
    }

    const { strides } = getCubeDimensions(this.cubeDimensions, this.dimIndices);
    const values: number[] = [];
    const validElevations: (number | string)[] = [];
    for (const elevationIndex of elevationIndices) {
      this.throwIfQueryAborted(options.signal);
      const flatIndex =
        lonIndex * strides.lon + latIndex * strides.lat + elevationIndex * strides.elevation;
      const rawValue = Number(this.volumeData.data[flatIndex]);
      const value = rawValue * this.scaleFactor + this.addOffset;
      if (
        !Number.isFinite(value) ||
        (this.useFillValue && rawValue === this.fillValue) ||
        (this.noDataMin !== undefined && value < this.noDataMin) ||
        (this.noDataMax !== undefined && value > this.noDataMax)
      )
        continue;
      values.push(value);
      validElevations.push(elevationValues[elevationIndex]);
    }

    const lonName = this.dimIndices.lon?.name ?? 'lon';
    const latName = this.dimIndices.lat?.name ?? 'lat';
    const coordinates: QueryResult['coordinates'] = {};
    if (options.includeSpatialCoordinates !== false && values.length > 0) {
      coordinates[lonName] = [longitude];
      coordinates[latName] = [latitude];
    }
    if (values.length > 0) coordinates[elevationKey] = validElevations;
    for (const [dimension, selector] of Object.entries(this.selectors)) {
      if (dimension === 'lon' || dimension === 'lat' || dimension === 'elevation') continue;
      if (Array.isArray(selector.selected)) continue;
      const coordinate = this.dimensionValues[dimension]?.[Number(selector.selected)];
      if (coordinate !== undefined) {
        coordinates[this.dimIndices[dimension]?.name ?? dimension] = [coordinate];
      }
    }

    return {
      variable: this.variable,
      values,
      dimensions: values.length === 0 ? [] : Object.keys(coordinates),
      coordinates
    };
  }

  /**
   * Queries all available time coordinates at one WGS84 position.
   *
   * @param position - `[longitude, latitude]` in degrees.
   * @param selectors - Fixed selectors for dimensions other than time.
   * @param options - Query cancellation and coordinate-output controls.
   * @returns A result ordered by the time coordinate.
   */
  getTimeSeries(position: QueryPosition, selectors?: ZarrSelectors, options?: QueryOptions) {
    return queryTimeSeries(this, position, selectors, options);
  }

  /**
   * Queries all loaded elevation coordinates at one WGS84 position.
   *
   * @param position - `[longitude, latitude]` in degrees.
   * @param selectors - Fixed selectors for dimensions other than elevation.
   * @param options - Query cancellation and coordinate-output controls.
   * @returns A result ordered by elevation.
   */
  getVerticalProfile(position: QueryPosition, selectors?: ZarrSelectors, options?: QueryOptions) {
    return queryVerticalProfile(this, position, selectors, options);
  }

  /**
   * Samples one selected elevation along a WGS84 line.
   *
   * @param start - Starting `[longitude, latitude]` coordinate in degrees.
   * @param end - Ending `[longitude, latitude]` coordinate in degrees.
   * @param selectors - Dimension selectors applied to every sample.
   * @param options - Sample count, concurrency, and cancellation controls.
   * @returns Positions, distances, and values along the transect.
   */
  getTransect(
    start: QueryPosition,
    end: QueryPosition,
    selectors?: ZarrSelectors,
    options?: TransectQueryOptions
  ): Promise<TransectResult> {
    return queryTransect(this, start, end, selectors, options);
  }

  /**
   * Samples every loaded elevation along a WGS84 line.
   *
   * @param start - Starting `[longitude, latitude]` coordinate in degrees.
   * @param end - Ending `[longitude, latitude]` coordinate in degrees.
   * @param selectors - Fixed selectors for dimensions other than elevation.
   * @param options - Sample count, concurrency, and cancellation controls.
   * @returns A distance-by-elevation value matrix.
   */
  getFullTransect(
    start: QueryPosition,
    end: QueryPosition,
    selectors?: ZarrSelectors,
    options?: TransectQueryOptions
  ): Promise<FullTransectResult> {
    return queryFullTransect(this, start, end, selectors, options);
  }

  private throwIfQueryAborted(signal?: AbortSignal): void {
    if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
  }

  private async queryTimeSeries(
    longitude: number,
    latitude: number,
    localLonIndex: number,
    localLatIndex: number,
    timeSelection: ZarrSelectorsProps,
    selectors: Record<string, ZarrSelectorsProps>,
    options: QueryOptions
  ): Promise<QueryResult> {
    if (!this.zarrArray || !this.dimIndices.time) {
      throw new Error('This cube has no queryable time dimension');
    }
    const timeValues = this.dimensionValues.time;
    if (!timeValues || !Array.isArray(timeSelection.selected)) {
      throw new Error('Time coordinate values are unavailable');
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
    const timeSize = this.zarrArray.shape[this.dimIndices.time.index];
    if (
      !Number.isInteger(timeStart) ||
      !Number.isInteger(timeEnd) ||
      timeStart < 0 ||
      timeEnd <= timeStart ||
      timeEnd > timeSize
    ) {
      throw new RangeError('Time-series selector is outside the array bounds');
    }

    const elevationKey = this.dimIndices.elevation?.name ?? 'elevation';
    const elevationSelection = selectors.elevation ?? selectors[elevationKey];
    if (elevationSelection && Array.isArray(elevationSelection.selected)) {
      throw new Error('A time series requires one scalar elevation selector');
    }
    const elevationValues = this.cubeDimensionValues.elevation;
    const defaultLocalElevation = this.elevationSliceIndex >= 0 ? this.elevationSliceIndex : 0;
    const localElevationIndex = elevationSelection
      ? elevationSelection.type === 'value'
        ? calculateNearestIndex(elevationValues, elevationSelection.selected as number | string)
        : Number(elevationSelection.selected) - this.loadedOrigin.elevation
      : defaultLocalElevation;
    if (
      !Number.isInteger(localElevationIndex) ||
      localElevationIndex < 0 ||
      localElevationIndex >= elevationValues.length
    ) {
      throw new RangeError('Elevation selector is outside the loaded cube bounds');
    }

    const selection: (number | ReturnType<typeof zarr.slice>)[] = new Array(
      this.zarrArray.shape.length
    ).fill(0);
    selection[this.dimIndices.lon.index] = this.longitudeIndices[localLonIndex];
    selection[this.dimIndices.lat.index] = this.loadedOrigin.y + localLatIndex;
    selection[this.dimIndices.elevation.index] = this.loadedOrigin.elevation + localElevationIndex;
    selection[this.dimIndices.time.index] = zarr.slice(timeStart, timeEnd);
    for (const [dimension, dimInfo] of Object.entries(this.dimIndices)) {
      if (
        dimension === 'lon' ||
        dimension === 'lat' ||
        dimension === 'elevation' ||
        dimension === 'time'
      ) {
        continue;
      }
      const requested = selectors[dimension] ?? selectors[dimInfo.name];
      if (requested && Array.isArray(requested.selected)) {
        throw new Error('A time series supports only one ranged selector');
      }
      const selected = requested ?? this.selectors[dimension];
      if (selected) {
        selection[dimInfo.index] =
          selected.type === 'value'
            ? calculateNearestIndex(
                this.dimensionValues[dimension],
                selected.selected as number | string
              )
            : Number(selected.selected);
      }
    }

    this.throwIfQueryAborted(options.signal);
    const data = await getZarrData(
      this.zarrArray as any,
      selection,
      options.signal ? { opts: { signal: options.signal } } : undefined
    );
    this.throwIfQueryAborted(options.signal);

    const rawValues = data.data as ArrayLike<number>;
    const values: number[] = [];
    const validTimes: (number | string)[] = [];
    for (let index = 0; index < rawValues.length; index++) {
      const rawValue = Number(rawValues[index]);
      const value = rawValue * this.scaleFactor + this.addOffset;
      if (
        !Number.isFinite(value) ||
        (this.useFillValue && rawValue === this.fillValue) ||
        (this.noDataMin !== undefined && value < this.noDataMin) ||
        (this.noDataMax !== undefined && value > this.noDataMax)
      ) {
        continue;
      }
      values.push(value);
      validTimes.push(timeValues[timeStart + index]);
    }

    const lonName = this.dimIndices.lon?.name ?? 'lon';
    const latName = this.dimIndices.lat?.name ?? 'lat';
    const timeName = this.dimIndices.time.name;
    const coordinates: QueryResult['coordinates'] = {
      [timeName]: validTimes,
      [elevationKey]: [elevationValues[localElevationIndex]]
    };
    if (options.includeSpatialCoordinates !== false && values.length > 0) {
      coordinates[lonName] = [longitude];
      coordinates[latName] = [latitude];
    }
    return {
      variable: this.variable,
      values,
      dimensions: values.length === 0 ? [] : Object.keys(coordinates),
      coordinates
    };
  }

  /**
   * Updates the rendered slices based on the provided indices.
   *
   * @param options - Slice update options. `latIndex`, `lonIndex`, and
   * `elevationIndex` are local indices within the loaded subset.
   * `verticalExaggeration` and `elevationMode` control height placement, while
   * `force` recreates unchanged primitives.
   * @remarks Has no effect until {@link load} has completed.
   */
  updateSlices({
    latIndex,
    lonIndex,
    elevationIndex,
    verticalExaggeration,
    force = false,
    elevationMode
  }: {
    latIndex?: number;
    lonIndex?: number;
    elevationIndex?: number;
    verticalExaggeration?: number;
    force?: boolean;
    elevationMode?: ElevationMode;
  }): void {
    if (verticalExaggeration !== undefined) {
      if (verticalExaggeration <= 0) {
        console.warn('Vertical exaggeration must be a positive number.');
        return;
      }
      if (verticalExaggeration !== this.verticalExaggeration) {
        this.verticalExaggeration = verticalExaggeration;
        force = true;
      }
    }
    if (elevationMode !== undefined && elevationMode !== this.elevationMode) {
      this.elevationMode = elevationMode;
      force = true;
    }
    if (!this.volumeData || !this.cubeDimensions) return;
    if (latIndex === undefined) latIndex = this.latSliceIndex;
    if (lonIndex === undefined) lonIndex = this.lonSliceIndex;
    if (elevationIndex === undefined) elevationIndex = this.elevationSliceIndex;
    if (this.gpuRenderer) {
      this.latSliceIndex = latIndex;
      this.lonSliceIndex = lonIndex;
      this.elevationSliceIndex = elevationIndex;
      this.gpuRenderer.setVerticalLayout(this.verticalExaggeration, this.elevationMode);
      this.gpuRenderer.setSlices(latIndex, lonIndex, elevationIndex);
      this.viewer.scene.requestRender?.();
      return;
    }
    if (this.showHorizontalSlices) {
      if (elevationIndex !== this.elevationSliceIndex || force) {
        this.createElevationSlicePrimitive(elevationIndex);
      }
    }
    if (this.showVerticalSlices) {
      if (lonIndex !== this.lonSliceIndex || force) {
        this.createLatSlicePrimitive(lonIndex);
      }
      if (latIndex !== this.latSliceIndex || force) {
        this.createLonSlicePrimitive(latIndex);
      }
    }
  }

  /**
   * Get the current slice indices for latitude, longitude, and elevation.
   * @returns An object containing the current slice indices for latitude, longitude, and elevation.
   */
  getSlices(): {
    latSliceIndex: number;
    lonSliceIndex: number;
    elevationSliceIndex: number;
  } {
    return {
      latSliceIndex: this.latSliceIndex,
      lonSliceIndex: this.lonSliceIndex,
      elevationSliceIndex: this.elevationSliceIndex
    };
  }

  /**
   * Displays an arbitrary vertical cross-section between two geographic points.
   *
   * @param start - Starting `[longitude, latitude]` coordinate in degrees.
   * @param end - Ending `[longitude, latitude]` coordinate in degrees.
   * @throws When an endpoint is invalid, outside the loaded bounds, or GPU rendering is unavailable.
   */
  setCrossSection(start: CubeCrossSectionPoint, end: CubeCrossSectionPoint): void {
    const validate = ([longitude, latitude]: CubeCrossSectionPoint) =>
      Number.isFinite(longitude) &&
      Number.isFinite(latitude) &&
      longitude >= this.bounds.west &&
      longitude <= this.bounds.east &&
      latitude >= this.bounds.south &&
      latitude <= this.bounds.north;
    if (!validate(start) || !validate(end)) {
      throw new RangeError('Cross-section endpoints must be inside the loaded cube bounds');
    }
    if (start[0] === end[0] && start[1] === end[1]) {
      throw new RangeError('Cross-section endpoints must be different');
    }
    if (!this.gpuRenderer) {
      throw new Error(
        `Arbitrary cross-sections require GPU rendering${
          this.gpuFallbackReason ? `: ${this.gpuFallbackReason}` : ''
        }`
      );
    }
    this.crossSection = { start: [...start], end: [...end] };
    this.gpuRenderer.setCrossSection(start, end);
    this.viewer.scene.requestRender?.();
  }

  /** Removes the arbitrary cross-section while retaining the standard cube slices. */
  clearCrossSection(): void {
    this.crossSection = null;
    this.gpuRenderer?.clearCrossSection();
    this.viewer.scene.requestRender?.();
  }

  /** Returns the active arbitrary cross-section, if one is displayed. */
  getCrossSection(): { start: CubeCrossSectionPoint; end: CubeCrossSectionPoint } | null {
    return this.crossSection
      ? { start: [...this.crossSection.start], end: [...this.crossSection.end] }
      : null;
  }

  /**
   * Updates the dimension selectors, multiscale level, and bounds.
   *
   * @param options - Partial data-selection update. Changed selectors, level,
   * or bounds cause the current primitives to be destroyed and reloaded.
   * @returns A promise that resolves after any required reload completes.
   * @remarks Bounds are validated against geographic latitude limits.
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
          this.selectors[key] = structuredClone(selectors[key]);
          updateLayer = true;
        }
      }
    }
    if (multiscaleLevel !== undefined && this.multiscaleLevel !== multiscaleLevel) {
      this.multiscaleLevel = multiscaleLevel;
      updateLayer = true;
    }
    if (bounds !== undefined && JSON.stringify(this.bounds) !== JSON.stringify(bounds)) {
      if (validateCubeBounds(bounds)) {
        this.bounds = {
          ...bounds,
          south: bounds.south,
          north: bounds.north
        };
        this.requestedBounds = { ...this.bounds };
        updateLayer = true;
      }
    }
    if (updateLayer) {
      this.destroy();
      await this.load(true);
    }
  }

  /**
   * Updates cube styling and recreates the visible slices when a value changes.
   *
   * @param options - Partial style update: opacity, numeric color range,
   * and/or colormap.
   * @remarks This reuses the loaded data and does not refetch Zarr chunks.
   */
  updateStyle({
    opacity,
    scale,
    colormap
  }: {
    opacity?: number;
    scale?: [number, number];
    colormap?: ColorMapName;
  }): void {
    let changed = false;
    if (opacity !== undefined && opacity !== this.opacity) {
      this.opacity = opacity;
      changed = true;
    }
    if (scale !== undefined) {
      const [min, max] = scale;
      if (min !== this.colorScale.min || max !== this.colorScale.max) {
        this.colorScale.min = min;
        this.colorScale.max = max;
        changed = true;
      }
    }
    if (colormap !== undefined && colormap !== this.colormap) {
      const colors = colormapBuilder(colormap);
      this.colorScale.colors = colors;
      this.colormap = colormap;
      changed = true;
    }
    if (!changed) return;
    if (this.gpuRenderer) {
      this.gpuRenderer.setStyle(
        this.colorScale.colors,
        this.colorScale.min,
        this.colorScale.max,
        this.opacity
      );
      this.viewer.scene.requestRender?.();
      return;
    }
    this.updateSlices({
      latIndex: this.latSliceIndex,
      lonIndex: this.lonSliceIndex,
      elevationIndex: this.elevationSliceIndex,
      force: true
    });
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

  private getSliceParameters() {
    if (!this.cubeDimensions) throw new Error('Cube dimensions not set');
    const viewer = this.viewer;
    const { nx, ny, nz, indicesOrder, strides } = getCubeDimensions(
      this.cubeDimensions,
      this.dimIndices
    );

    return { viewer, nx, ny, nz, indicesOrder, strides };
  }

  /** Geographic coverage that can actually be represented by the source CRS. */
  private getRenderBounds(): BoundsProps {
    if (this.crs !== 'EPSG:3857') return this.bounds;
    const maximumMercatorLatitude = 85.05112878;
    return {
      ...this.bounds,
      south: globalThis.Math.max(this.bounds.south, -maximumMercatorLatitude),
      north: globalThis.Math.min(this.bounds.north, maximumMercatorLatitude)
    };
  }

  /** Map a source-grid fraction to WGS84 for projected cube geometry. */
  private geographicAtSourceFraction(xFraction: number, yFraction: number): [number, number] {
    if (!this.projection) throw new Error('Cube projection is not initialized');
    const xValues = Array.from(this.cubeDimensionValues.lon ?? [], Number);
    const yValues = Array.from(this.cubeDimensionValues.lat ?? [], Number);
    if (!xValues.length || !yValues.length) throw new Error('Cube spatial coordinates are unavailable');
    const interpolate = (values: number[], fraction: number) => {
      const position = globalThis.Math.max(
        0,
        globalThis.Math.min(values.length - 1, fraction * (values.length - 1))
      );
      const lower = globalThis.Math.floor(position);
      const upper = globalThis.Math.min(values.length - 1, lower + 1);
      return values[lower] + (position - lower) * (values[upper] - values[lower]);
    };
    const x = interpolate(xValues, xFraction);
    const sourceYFraction = this.latIsAscending ? yFraction : 1 - yFraction;
    const y = interpolate(yValues, sourceYFraction);
    return this.projection.inverse([x, y]);
  }

  /** Converts a south-to-north data fraction into its geographic latitude. */
  private latitudeAtFraction(fraction: number, bounds = this.getRenderBounds()): number {
    if (this.crs !== 'EPSG:3857') {
      return bounds.south + fraction * (bounds.north - bounds.south);
    }
    const radians = (degrees: number) => degrees * globalThis.Math.PI / 180;
    const mercator = (latitude: number) =>
      globalThis.Math.log(globalThis.Math.tan(globalThis.Math.PI / 4 + radians(latitude) / 2));
    const south = mercator(bounds.south);
    const north = mercator(bounds.north);
    const projected = south + fraction * (north - south);
    return (2 * globalThis.Math.atan(globalThis.Math.exp(projected)) - globalThis.Math.PI / 2) *
      180 / globalThis.Math.PI;
  }

  /** Creates the GPU atlas renderer when the current Cesium context can support it. */
  private initializeGpuRenderer(): void {
    if (!this.volumeData || !this.cubeDimensions) return;
    if (this.gpuRenderer) {
      (this.viewer.scene.primitives as any).remove(this.gpuRenderer);
      this.gpuRenderer.destroy();
      this.gpuRenderer = null;
    }
    const reason = CubeGpuRenderer.supportReason(this.viewer.scene, this.cubeDimensions);
    this.gpuFallbackReason = reason;
    if (reason) {
      console.warn(`ZarrCubeProvider is using the CPU slice renderer: ${reason}.`);
      return;
    }
    try {
      this.gpuRenderer = new CubeGpuRenderer({
        scene: this.viewer.scene,
        data: this.volumeData,
        dimensions: this.cubeDimensions,
        dimensionIndices: this.dimIndices,
        dimensionElevations: this.renderingElevationValues,
        bounds: this.getRenderBounds(),
        latIsAscending: this.latIsAscending,
        flipElevation: this.flipElevation,
        verticalExaggeration: this.verticalExaggeration,
        elevationMode: this.elevationMode,
        scaleFactor: this.scaleFactor,
        addOffset: this.addOffset,
        fillValue: this.fillValue,
        useFillValue: this.useFillValue,
        noDataMin: this.noDataMin,
        noDataMax: this.noDataMax,
        colors: this.colorScale.colors,
        colorMin: this.colorScale.min,
        colorMax: this.colorScale.max,
        opacity: this.opacity,
        showHorizontal: this.showHorizontalSlices,
        showVertical: this.showVerticalSlices,
        projectedCrs: this.crs === 'EPSG:3857',
        projection: this.projection ?? undefined,
        dimensionX: this.cubeDimensionValues.lon,
        dimensionY: this.cubeDimensionValues.lat
      });
      if (this.crossSection) {
        this.gpuRenderer.setCrossSection(this.crossSection.start, this.crossSection.end);
      }
      (this.viewer.scene.primitives as any).add(this.gpuRenderer);
    } catch (error) {
      this.gpuFallbackReason = error instanceof Error ? error.message : String(error);
      this.gpuRenderer?.destroy();
      this.gpuRenderer = null;
      console.warn(
        `ZarrCubeProvider could not initialize GPU rendering; using CPU slices: ${this.gpuFallbackReason}.`
      );
    }
  }

  /** Converts a south-to-north display index into the dataset latitude index. */
  private getLatitudeDataIndex(displayIndex: number, height: number): number {
    return this.latIsAscending ? displayIndex : height - 1 - displayIndex;
  }

  private createCanvas(
    width: number,
    height: number
  ): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; imgData: ImageData } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const imgData = ctx.createImageData(width, height);
    return { canvas, ctx, imgData };
  }

  private createElevationSlicePrimitive(elevationIndex: number) {
    if (!this.volumeData || !this.cubeDimensions) return;
    if (this.horizontalPrimitives) {
      this.viewer.scene.primitives.remove(this.horizontalPrimitives);
      this.horizontalPrimitives = null;
    }
    this.elevationSliceIndex = elevationIndex;
    const { viewer, nx, ny, nz, indicesOrder, strides } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(nx, ny);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const coord: Record<string, number> = {
          lon: x,
          // Image textures use canvas row 0 at the geographic north edge.
          // Convert that north-to-south canvas row to the dataset latitude index.
          lat: this.getLatitudeDataIndex(ny - 1 - y, ny),
          elevation: this.elevationSliceIndex
        };
        const idx =
          coord[indicesOrder[0]] * strides[indicesOrder[0]] +
          coord[indicesOrder[1]] * strides[indicesOrder[1]] +
          coord[indicesOrder[2]] * strides[indicesOrder[2]];
        const value = this.volumeData.data[idx];
        const pixelIdx = (y * nx + x) * 4;
        imgData = updateImgData(value, pixelIdx, imgData, this.colorScale, this.opacity);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const placementElevationIndex = this.flipElevation
      ? nz - 1 - this.elevationSliceIndex
      : this.elevationSliceIndex;
    const elevationValue = this.renderingElevationValues[placementElevationIndex] ?? placementElevationIndex;
    const heightMeters = this.calculateElevationHeight(elevationValue);

    const primitive = this.createHorizontalPrimitive(canvas, heightMeters);

    viewer.scene.primitives.add(primitive);

    this.horizontalPrimitives = primitive;
  }

  private createHorizontalPrimitive(canvas: HTMLCanvasElement, height: number): Primitive {
    const bounds = this.getRenderBounds();
    const horizontalSegments = 64;
    const verticalSegments = 64;
    const positions: number[] = [];
    const sts: number[] = [];
    const indices: number[] = [];
    for (let y = 0; y <= verticalSegments; y++) {
      const latitudeFraction = y / verticalSegments;
      const latitude = this.latitudeAtFraction(latitudeFraction, bounds);
      for (let x = 0; x <= horizontalSegments; x++) {
        const longitudeFraction = x / horizontalSegments;
        const [longitude, renderedLatitude] =
          this.crs === 'EPSG:4326' || this.crs === 'EPSG:3857'
            ? [bounds.west + longitudeFraction * (bounds.east - bounds.west), latitude]
            : this.geographicAtSourceFraction(longitudeFraction, latitudeFraction);
        const position = Cartesian3.fromDegrees(longitude, renderedLatitude, height);
        positions.push(position.x, position.y, position.z);
        sts.push(longitudeFraction, latitudeFraction);
      }
    }
    const rowWidth = horizontalSegments + 1;
    for (let y = 0; y < verticalSegments; y++) {
      for (let x = 0; x < horizontalSegments; x++) {
        const lowerLeft = y * rowWidth + x;
        const lowerRight = lowerLeft + 1;
        const upperLeft = lowerLeft + rowWidth;
        const upperRight = upperLeft + 1;
        indices.push(lowerLeft, upperLeft, lowerRight, lowerRight, upperLeft, upperRight);
      }
    }
    const geometry = new Geometry({
      attributes: {
        position: new GeometryAttribute({
          componentDatatype: ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: new Float64Array(positions)
        }),
        st: new GeometryAttribute({
          componentDatatype: ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(sts)
        })
      } as GeometryAttributes,
      indices: new Uint16Array(indices),
      primitiveType: PrimitiveType.TRIANGLES,
      boundingSphere: BoundingSphere.fromVertices(positions)
    });
    return new Primitive({
      geometryInstances: new GeometryInstance({ geometry }),
      appearance: new MaterialAppearance({
        material: new Material({ fabric: { type: 'Image', uniforms: { image: canvas } } }),
        faceForward: false
      }),
      asynchronous: false
    });
  }

  private calculatePrimitive(
    nx: number,
    ny: number,
    nz: number,
    canvas: HTMLCanvasElement,
    sliceType: 'lat' | 'lon'
  ) {
    const nValue = sliceType === 'lon' ? ny : nx;
    const sliceIndex = sliceType === 'lon' ? this.latSliceIndex : this.lonSliceIndex;
    const fraction = sliceIndex / (nValue - 1);

    const bounds = this.getRenderBounds();

    const slice =
      sliceType === 'lon'
        ? this.latitudeAtFraction(this.latIsAscending ? fraction : 1 - fraction, bounds)
        : bounds.west + fraction * (bounds.east - bounds.west);

    const positions = [];
    const sts = [];
    const indices = [];

    const segments = sliceType === 'lon' ? nx - 1 : ny - 1;
    const segmentsZ = nz - 1;

    for (let iz = 0; iz <= segmentsZ; iz++) {
      const heightFraction = iz / segmentsZ;
      const elevationValue = this.renderingElevationValues[iz] ?? iz;
      const height = this.calculateElevationHeight(elevationValue);

      for (let iN = 0; iN <= segments; iN++) {
        const otherFraction = iN / segments;
        const latOrlon =
          sliceType === 'lon'
            ? bounds.west + otherFraction * (bounds.east - bounds.west)
            : this.latitudeAtFraction(otherFraction, bounds);

        let longitude: number;
        let latitude: number;
        if (this.crs === 'EPSG:4326' || this.crs === 'EPSG:3857') {
          [longitude, latitude] = sliceType === 'lon' ? [latOrlon, slice] : [slice, latOrlon];
        } else {
          [longitude, latitude] = sliceType === 'lon'
            ? this.geographicAtSourceFraction(
                otherFraction,
                this.latIsAscending ? fraction : 1 - fraction
              )
            : this.geographicAtSourceFraction(fraction, otherFraction);
        }
        const cart = Cartesian3.fromDegrees(longitude, latitude, height);
        positions.push(cart.x, cart.y, cart.z);
        if (sliceType === 'lon') {
          sts.push(otherFraction, heightFraction);
        } else {
          sts.push(otherFraction, heightFraction);
        }
      }
    }

    for (let iz = 0; iz < segmentsZ; iz++) {
      for (let iN = 0; iN < segments; iN++) {
        const i0 = iz * (segments + 1) + iN;
        const i1 = i0 + 1;
        const i2 = i0 + (segments + 1);
        const i3 = i2 + 1;

        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geometry = new Geometry({
      attributes: {
        position: new GeometryAttribute({
          componentDatatype: ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: new Float64Array(positions)
        }),
        st: new GeometryAttribute({
          componentDatatype: ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(sts)
        })
      } as GeometryAttributes,
      indices: new Uint16Array(indices),
      primitiveType: PrimitiveType.TRIANGLES,
      boundingSphere: BoundingSphere.fromVertices(positions)
    });

    const primitive = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: geometry
      }),
      appearance: new MaterialAppearance({
        material: new Material({
          fabric: { type: 'Image', uniforms: { image: canvas } }
        }),
        faceForward: false
      }),
      asynchronous: false
    });

    return primitive;
  }

  /** Converts one vertical coordinate to its Cesium height independently of data ordering. */
  private calculateElevationHeight(elevationValue: number): number {
    return this.elevationMode === 'depth'
      ? (elevationValue - this.maximumElevationValue) * this.verticalExaggeration
      : elevationValue * this.verticalExaggeration;
  }

  private createLonSlicePrimitive(latIndex: number) {
    if (!this.volumeData || !this.cubeDimensions) return;
    if (this.verticalLonPrimitives) {
      this.viewer.scene.primitives.remove(this.verticalLonPrimitives);
      this.verticalLonPrimitives = null;
    }
    this.latSliceIndex = latIndex;
    const { viewer, nx, ny, nz, indicesOrder, strides } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(nx, nz);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    for (let z = 0; z < nz; z++) {
      const elevationSliceIndex = this.flipElevation ? nz - z - 1 : z;
      for (let x = 0; x < nx; x++) {
        const coord: Record<string, number> = {
          lon: x,
          lat: this.latSliceIndex,
          elevation: elevationSliceIndex
        };
        const idx =
          coord[indicesOrder[0]] * strides[indicesOrder[0]] +
          coord[indicesOrder[1]] * strides[indicesOrder[1]] +
          coord[indicesOrder[2]] * strides[indicesOrder[2]];

        const value = this.volumeData.data[idx];
        const canvasY = nz - 1 - z;
        const pixelIdx = (canvasY * nx + x) * 4;
        imgData = updateImgData(value, pixelIdx, imgData, this.colorScale, this.opacity);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const primitive = this.calculatePrimitive(nx, ny, nz, canvas, 'lon');

    viewer.scene.primitives.add(primitive);

    this.verticalLonPrimitives = primitive;
  }

  private createLatSlicePrimitive(lonIndex: number) {
    if (!this.volumeData || !this.cubeDimensions) return;
    if (this.verticalLatPrimitives) {
      this.viewer.scene.primitives.remove(this.verticalLatPrimitives);
      this.verticalLatPrimitives = null;
    }
    this.lonSliceIndex = lonIndex;
    const { viewer, nx, ny, nz, indicesOrder, strides } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(ny, nz);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    for (let z = 0; z < nz; z++) {
      const elevationSliceIndex = this.flipElevation ? nz - z - 1 : z;
      for (let y = 0; y < ny; y++) {
        const coord: Record<string, number> = {
          lon: this.lonSliceIndex,
          lat: this.getLatitudeDataIndex(y, ny),
          elevation: elevationSliceIndex
        };
        const idx =
          coord[indicesOrder[0]] * strides[indicesOrder[0]] +
          coord[indicesOrder[1]] * strides[indicesOrder[1]] +
          coord[indicesOrder[2]] * strides[indicesOrder[2]];
        const value = this.volumeData.data[idx];
        const canvasY = nz - 1 - z;
        const pixelIdx = (canvasY * ny + y) * 4;
        imgData = updateImgData(value, pixelIdx, imgData, this.colorScale, this.opacity);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const primitive = this.calculatePrimitive(nx, ny, nz, canvas, 'lat');

    viewer.scene.primitives.add(primitive);

    this.verticalLatPrimitives = primitive;
  }

  /**
   * Removes all currently rendered slice primitives from the scene.
   *
   * @remarks Loaded Zarr data and current selectors remain available, so slices
   * can be recreated with {@link updateSlices}.
   */
  clear(): void {
    if (this.gpuRenderer) {
      (this.viewer.scene.primitives as any).remove(this.gpuRenderer);
      this.gpuRenderer.destroy();
      this.gpuRenderer = null;
    }
    this.viewer.scene.primitives.remove(this.verticalLonPrimitives);
    this.verticalLonPrimitives = null;
    this.viewer.scene.primitives.remove(this.verticalLatPrimitives);
    this.verticalLatPrimitives = null;
    this.viewer.scene.primitives.remove(this.horizontalPrimitives);
    this.horizontalPrimitives = null;
  }

  /**
   * Removes all Cesium primitives owned by this provider.
   *
   * @remarks The currently loaded array remains in memory. Call {@link load} or
   * {@link updateSelectors} to render it again.
   */
  destroy(): void {
    this.clear();
  }
}
