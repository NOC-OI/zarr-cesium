import { type Viewer, Math } from 'cesium';
import { WindLayer, type WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';
import {
  calculateElevationSlice,
  calculateHeightMeters,
  calculateSliceArgs,
  calculateXYFromBounds,
  detectCRS,
  initZarrDataset
} from './zarr-utils';
import {
  type BoundsProps,
  type ColorMapName,
  type ColorScaleProps,
  type CRS,
  type CubeVelocityProps,
  type DimensionNamesProps,
  type VelocityOptions,
  type ZarrSelectorsProps
} from './types';
import { colormapBuilder } from './jsColormaps';

import ndarray from 'ndarray';
import {
  DEFAULT_COLORMAP,
  DEFAULT_VERTICAL_EXAGGERATION,
  DEFAULT_WIND_OPTIONS,
  validateBounds
} from './cesium-utils';

/**
 * Provider responsible for loading and rendering 3D velocity fields (U and V components)
 * from Zarr datasets as animated Cesium `WindLayer`s.
 *
 * @remarks
 * This class supports loading 3D vector field data (u, v components), slicing them by elevation,
 * and creating animated particle layers that visualize flow direction and speed.
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
  public dimensionValues: { [key: string]: Float64Array | number[] } = {};
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
  private viewer: Viewer;
  private zarrVersion: 2 | 3 | null = null;
  private layers: WindLayer[] = [];
  private flipElevation: boolean = false;
  private uUrl: string;
  private vUrl: string;
  private variables: { u: string; v: string };
  private crs: CRS | null = null;
  private dimensionNames: DimensionNamesProps;
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

  /**
   * Creates a new {@link ZarrCubeVelocityProvider} instance.
   *
   * @param viewer - Cesium viewer where the layers will be rendered.
   * @param options - Velocity dataset options (see {@link VelocityOptions}).
   */
  constructor(viewer: Viewer, options: VelocityOptions) {
    this.viewer = viewer;
    this.uUrl = options.urls.u;
    this.vUrl = options.urls.v;
    this.variables = options.variables;
    this.bounds = options.bounds;
    this.crs = options.crs ?? null;
    this.dimensionNames = options.dimensionNames ?? {};
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
    this.windOptions = {
      ...DEFAULT_WIND_OPTIONS,
      ...options.windOptions
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
  private async loadZarrVariable(url: string, variable: string): Promise<CubeVelocityProps | null> {
    const store = new zarr.FetchStore(url);
    const root = zarr.root(store);

    const { zarrArray, dimIndices, levelInfos, attrs, multiscaleLevel } = await initZarrDataset(
      store,
      root,
      variable,
      this.dimensionNames,
      this.levelMetadata,
      this.levelCache,
      this.zarrVersion,
      this.multiscaleLevel
    );
    if (multiscaleLevel !== undefined) {
      this.multiscaleLevel = multiscaleLevel;
    }
    this.levelInfos = levelInfos;

    this.crs = this.crs || (await detectCRS(attrs, zarrArray));

    const shape = zarrArray.shape;

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

    const { x, y } = calculateXYFromBounds(this.bounds, width, height, this.crs);
    const { sliceArgs, dimensionValues, selectors } = await calculateSliceArgs(
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
    this.selectors = selectors;
    this.dimensionValues = dimensionValues;
    this.elevationShape = zarrArray.shape[dimIndices.elevation.index];

    const data = await zarr.get(zarrArray, sliceArgs);

    // const data = (await ZarrCubeVelocityProvider.throttle(() =>
    //   zarr.get(zarrArray!, sliceArgs)
    // )) as ndarray.NdArray<any>;
    const arr = this.sanitizeArray(new Float32Array(data.data as ArrayLike<number>));

    return {
      array: ndarray(arr, data.shape, data.stride),
      width: x[1] - x[0],
      height: y[1] - y[0],
      elevation: elevationSlice[1] - elevationSlice[0],
      dimensionValues: dimensionValues
    };
  }

  /**
   * Loads both U and V components of the velocity field from their respective Zarr datasets.
   *
   * @returns Promise resolved when both datasets are loaded and rendered as wind layers.
   */
  async load(): Promise<void> {
    const [uCube, vCube] = await Promise.all([
      this.loadZarrVariable(this.uUrl, this.variables.u),
      this.loadZarrVariable(this.vUrl, this.variables.v)
    ]);
    if (!uCube || !vCube) {
      console.error('Failed to load U or V component data.');
      return;
    }
    this.cubeDimensions = [uCube.width, uCube.height, uCube.elevation];
    this.volumeData = { uCube, vCube };

    await this.createWindLayers();
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
        elevationValue,
        this.dimensionValues.elevation,
        this.verticalExaggeration,
        this.belowSeaLevel,
        this.flipElevation
      );
      const layerOptions = {
        ...this.windOptions,
        particleHeight: altitude
      };

      const layer = new WindLayer(this.viewer, windData, layerOptions);
      this.layers.push(layer);
    }
  }

  /**
   * Updates the dimension selectors, multiscale level, or geographic bounds,
   * and reloads the velocity data accordingly.
   * @param options:
   * - selectors - New dimension selectors. See {@link ZarrSelectorsProps}.
   * - multiscaleLevel - New multiscale level to load.
   * - bounds - Updated geographic bounds. See {@link BoundsProps}.
   */
  async updateSelectors({
    selectors,
    multiscaleLevel,
    bounds
  }: {
    selectors?: { [key: string]: ZarrSelectorsProps };
    multiscaleLevel?: number;
    bounds?: BoundsProps;
  }) {
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
   * @param options:
   * - sliceSpacing - Distance between rendered elevation slices.
   * - verticalExaggeration - Height exaggeration.
   * - belowSeaLevel - Whether elevations below sea level are considered.
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
   * @param options:
   * - opacity - Opacity.
   * - scale - [min, max] scale for coloring.
   * - colormap - Colormap name. See {@link ColorMapName}.
   * - windOptions - Additional parameters forwarded to the WindLayer (see {@link WindLayerOptions}).
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
    windOptions?: Partial<WindLayerOptions>;
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
      this.windOptions = {
        ...this.windOptions,
        ...windOptions
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
   */
  destroy(): void {
    for (const layer of this.layers) {
      layer.remove();
    }
    this.layers = [];
  }
}
