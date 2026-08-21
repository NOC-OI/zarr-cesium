import {
  Cartographic,
  Credit,
  DefaultProxy,
  Event,
  GeographicTilingScheme,
  ImageryLayerFeatureInfo,
  ImageryLayer,
  NeverTileDiscardPolicy,
  type ImageryProvider,
  Rectangle,
  type Request,
  type TilingScheme,
  WebMercatorTilingScheme
} from 'cesium';
import {
  ZarrTileProvider,
  type DimensionValues,
  type FullTransectResult,
  type QueryGeometry,
  type QueryOptions,
  type QueryPosition,
  type QueryResult,
  type TransectQueryOptions,
  type TransectResult,
  type ZarrSelectors,
  type ZarrSelectorsProps
} from 'zarr-maps-tiling';
import type { ColorMapName } from 'zarr-maps-colormap';
import type { CesiumHost, LayerOptions } from './types';

/** Cesium imagery layer backed by a shared {@link ZarrTileProvider}. */
export class ZarrImageryLayer extends ImageryLayer {
  /** Application-defined identifier; Cesium does not assign this automatically. */
  public id = '';
  /** Strongly typed Zarr imagery provider associated with this layer. */
  declare imageryProvider: ZarrLayerProvider;
  /** Viewer or widget used to request a render after runtime updates. */
  viewer?: CesiumHost;

  /**
   * Invalidates the imagery currently visible without destroying the provider.
   *
   * @remarks
   * The layer is removed and reinserted at the same collection index. Callers
   * normally use {@link updateStyle} or {@link updateSelectors} instead.
   */
  softRefreshCurrentView(): void {
    const scene = this.viewer?.scene;
    const collection = this.viewer?.imageryLayers;
    if (!collection || !scene) return;

    const index = collection.indexOf(this);
    collection.remove(this, false);
    collection.add(this, index);
    scene.requestRender();
  }

  /**
   * Updates rendering style and refreshes visible tiles when pixel colors change.
   *
   * @param options - Partial style update. `opacity` updates Cesium layer alpha;
   * `scale` and `colormap` update the shared tile renderer.
   */
  updateStyle(options: {
    opacity?: number;
    scale?: [number, number];
    colormap?: ColorMapName;
  }): void {
    const changed = this.imageryProvider.updateStyle(options);
    this.alpha = options.opacity ?? this.alpha;
    if (changed) this.softRefreshCurrentView();
  }

  /**
   * Replaces dimension selections and refreshes visible tiles when they change.
   *
   * @param selectors - Selectors keyed by normalized dimension name.
   */
  updateSelectors(selectors: Record<string, ZarrSelectorsProps>): void {
    if (this.imageryProvider.updateSelectors(selectors)) this.softRefreshCurrentView();
  }
}

/**
 * Thin Cesium adapter around the framework-independent Zarr tile renderer.
 * Dataset loading, slicing, styling, caching, and WebGL rendering live in
 * `zarr-maps-tiling`; this class only translates Cesium tile requests.
 */
export class ZarrLayerProvider implements ImageryProvider {
  readonly proxy = new DefaultProxy('');
  readonly tileDiscardPolicy = new NeverTileDiscardPolicy();
  private readonly source: ZarrTileProvider;
  private readonly _tileWidth: number;
  private readonly _tileHeight: number;
  private readonly _minimumLevel: number;
  private readonly _maximumLevel: number;
  private readonly _credit = new Credit('Rendered from Zarr');
  private readonly _errorEvent = new Event();
  private _tilingScheme: TilingScheme = new GeographicTilingScheme();
  private _rectangle = Rectangle.MAX_VALUE;
  private _ready = false;
  private readonly _readyPromise: Promise<boolean>;

  /**
   * Creates a Cesium imagery provider backed by a URL or custom Zarrita store.
   *
   * @param options - Dataset, tiling, selection, style, and request options.
   * @remarks Prefer {@link createLayer} when adding the result to a viewer.
   */
  constructor(options: LayerOptions) {
    this._tileWidth = options.tileWidth ?? 256;
    this._tileHeight = options.tileHeight ?? 256;
    this._minimumLevel = options.minimumLevel ?? 0;
    // Cesium may continue subdividing imagery beyond the source's native
    // resolution. Zarr pyramid selection is handled independently by resolution.
    this._maximumLevel = options.maximumLevel ?? 12;

    this.source = new ZarrTileProvider({
      url: options.url,
      store: options.store,
      variable: options.variable,
      crs: options.crs,
      tileSize: this._tileWidth,
      maxZoom: this._maximumLevel,
      scale: options.scale,
      colormap: options.colormap,
      selectors: options.selectors,
      zarrVersion: options.zarrVersion,
      dimensionNames: options.dimensionNames,
      noDataMin: options.noDataMin,
      noDataMax: options.noDataMax,
      requestOverrides: options.requestOverrides,
      transformRequest: options.transformRequest,
      onAuthError: options.onAuthError,
      multiscaleFormat: options.multiscaleFormat,
      latIsAscending: options.latIsAscending,
      renderTarget: 'cesium'
    });

    this._readyPromise = this.initialize();
  }

  private async initialize(): Promise<boolean> {
    const ready = await this.source.readyPromise;
    if (!ready || !this.source.coverageBoundsDeg) return false;

    this._tilingScheme =
      this.source.crs === 'EPSG:3857'
        ? new WebMercatorTilingScheme()
        : new GeographicTilingScheme();

    const bounds = this.source.coverageBoundsDeg;
    this._rectangle = Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north);
    this._ready = true;
    return true;
  }

  /**
   * Creates and initializes a {@link ZarrImageryLayer} ready to add to Cesium.
   *
   * @param viewer - Viewer or widget that will host the layer.
   * @param options - Zarr dataset and visualization options.
   * @returns A fully initialized imagery layer. Its provider is available as
   * `layer.imageryProvider`.
   * @throws If metadata, dimensions, CRS, or coverage cannot be initialized.
   *
   * @example
   * ```ts
   * const layer = await ZarrLayerProvider.createLayer(viewer, {
   *   url: 'https://example.com/data.zarr',
   *   variable: 'temperature',
   *   scale: [0, 30]
   * });
   * viewer.imageryLayers.add(layer);
   * ```
   */
  static async createLayer(viewer: CesiumHost, options: LayerOptions): Promise<ZarrImageryLayer> {
    const provider = new ZarrLayerProvider(options);
    if (!(await provider.readyPromise)) throw new Error('Failed to initialize ZarrLayerProvider');

    const layer = new ZarrImageryLayer(provider);
    layer.alpha = options.opacity ?? 1;
    layer.viewer = viewer;
    return layer;
  }

  /** Coordinate values keyed by normalized dimension name. */
  get dimensionValues(): DimensionValues {
    return this.source.dimensionValues;
  }

  /** Current index-based selectors used for tile rendering and queries. */
  get selectors(): Record<string, ZarrSelectorsProps> {
    return this.source.selectors;
  }

  /**
   * Updates tile color mapping without recreating the provider.
   *
   * @param options - New scale and/or colormap.
   * @returns `true` when the rendered tile output changed.
   */
  updateStyle(options: { scale?: [number, number]; colormap?: ColorMapName }): boolean {
    return this.source.updateStyle(options);
  }

  /**
   * Updates dimension selectors used for subsequent renders and queries.
   *
   * @param selectors - Selectors keyed by normalized dimension name.
   * @returns `true` when at least one selector changed.
   */
  updateSelectors(selectors: Record<string, ZarrSelectorsProps>): boolean {
    return this.source.updateSelectors(selectors);
  }

  /**
   * Queries the nearest raster cell for a WGS84 GeoJSON point.
   *
   * @param geometry - Point geometry in `[longitude, latitude]` degrees.
   * @param selectors - Optional selector overrides for this query only.
   * @param options - Abort, resolution-level, and coordinate-output controls.
   * @returns Values and coordinate labels for the selected cell or profile.
   * @throws For unsupported geometries, invalid selectors, or failed reads.
   */
  async queryData(
    geometry: QueryGeometry,
    selectors?: Record<string, ZarrSelectorsProps>,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    return this.source.queryData(geometry, selectors, options);
  }

  /**
   * Reads every time value at one WGS84 position.
   *
   * @param position - `[longitude, latitude]` in degrees.
   * @param selectors - Fixed selectors for dimensions other than time.
   * @param options - Query controls, including cancellation and resolution.
   * @returns A query result ordered by the time coordinate.
   */
  getTimeSeries(position: QueryPosition, selectors?: ZarrSelectors, options?: QueryOptions) {
    return this.source.getTimeSeries(position, selectors, options);
  }

  /**
   * Reads every elevation value at one WGS84 position.
   *
   * @param position - `[longitude, latitude]` in degrees.
   * @param selectors - Fixed selectors for dimensions other than elevation.
   * @param options - Query controls, including cancellation and resolution.
   * @returns A query result ordered by the elevation coordinate.
   */
  getVerticalProfile(position: QueryPosition, selectors?: ZarrSelectors, options?: QueryOptions) {
    return this.source.getVerticalProfile(position, selectors, options);
  }

  /**
   * Samples one selected level along a line between two WGS84 positions.
   *
   * @param start - Starting `[longitude, latitude]` coordinate in degrees.
   * @param end - Ending `[longitude, latitude]` coordinate in degrees.
   * @param selectors - Dimension selectors applied to every sample.
   * @param options - Sample count, concurrency, cancellation, and resolution controls.
   * @returns Distances, positions, and scalar values along the transect.
   */
  getTransect(
    start: QueryPosition,
    end: QueryPosition,
    selectors?: ZarrSelectors,
    options?: TransectQueryOptions
  ): Promise<TransectResult> {
    return this.source.getTransect(start, end, selectors, options);
  }

  /**
   * Samples all elevation levels along a line between two WGS84 positions.
   *
   * @param start - Starting `[longitude, latitude]` coordinate in degrees.
   * @param end - Ending `[longitude, latitude]` coordinate in degrees.
   * @param selectors - Fixed selectors for dimensions other than elevation.
   * @param options - Sample count, concurrency, cancellation, and resolution controls.
   * @returns A distance-by-elevation value matrix.
   */
  getFullTransect(
    start: QueryPosition,
    end: QueryPosition,
    selectors?: ZarrSelectors,
    options?: TransectQueryOptions
  ): Promise<FullTransectResult> {
    return this.source.getFullTransect(start, end, selectors, options);
  }

  /**
   * Renders one Cesium imagery tile.
   *
   * @param x - Tile column.
   * @param y - Tile row.
   * @param level - Cesium imagery level.
   * @param _request - Cesium request metadata; currently unused.
   * @returns A vertically oriented canvas or image bitmap suitable for Cesium.
   */
  async requestImage(
    x: number,
    y: number,
    level: number,
    _request?: Request
  ): Promise<HTMLCanvasElement | ImageBitmap> {
    if (!this.ready) await this.readyPromise;

    const rectangle = this.tilingScheme.tileXYToRectangle(x, y, level);
    const bounds = {
      west: rectangle.west * (180 / Math.PI),
      south: rectangle.south * (180 / Math.PI),
      east: rectangle.east * (180 / Math.PI),
      north: rectangle.north * (180 / Math.PI)
    };
    const key = `${level}/${x}/${y}`;
    const rendered = await this.source.renderTile(bounds, level, key);
    if (typeof createImageBitmap === 'function') {
      try {
        return await createImageBitmap(rendered, {
          imageOrientation: 'flipY',
          premultiplyAlpha: 'premultiply'
        });
      } catch {
        // Fall through to a canvas-based flip when ImageBitmap options are unavailable.
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = this.tileWidth;
    canvas.height = this.tileHeight;
    const context = canvas.getContext('2d')!;
    context.translate(0, canvas.height);
    context.scale(1, -1);
    context.drawImage(rendered, 0, 0);
    return canvas;
  }

  /** @returns Credit entries associated with every rendered tile. */
  getTileCredits(): Credit[] {
    return [this._credit];
  }

  /**
   * Queries the feature underneath a Cesium imagery pick position.
   *
   * @param _x - Tile column; the point query uses the supplied longitude instead.
   * @param _y - Tile row; the point query uses the supplied latitude instead.
   * @param level - Resolution level used by the query.
   * @param longitude - Longitude in radians.
   * @param latitude - Latitude in radians.
   * @returns Zero or one feature containing the queried value and coordinates.
   */
  async pickFeatures(
    _x: number,
    _y: number,
    level: number,
    longitude: number,
    latitude: number
  ): Promise<ImageryLayerFeatureInfo[]> {
    const result = await this.queryData(
      { type: 'Point', coordinates: [longitude * (180 / Math.PI), latitude * (180 / Math.PI)] },
      undefined,
      { level }
    );
    if (result.values.length === 0) return [];

    const feature = new ImageryLayerFeatureInfo();
    feature.name = result.variable;
    feature.data = result;
    feature.position = Cartographic.fromRadians(longitude, latitude);
    feature.configureDescriptionFromProperties({
      variable: result.variable,
      value: result.values[0],
      ...Object.fromEntries(Object.entries(result.coordinates).map(([key, value]) => [key, value[0]]))
    });
    return [feature];
  }

  /** Aborts pending reads and releases tile-renderer resources. */
  destroy(): void {
    this._ready = false;
    this.source.destroy();
  }

  /** Whether metadata initialization completed and the provider is usable. */
  get ready(): boolean { return this._ready && this.source.ready; }
  /** Promise resolving to the provider readiness state. */
  get readyPromise(): Promise<boolean> { return this._readyPromise; }
  /** Whether rendered tiles contain alpha values. Always `true`. */
  get hasAlphaChannel(): boolean { return true; }
  /** Cesium tiling scheme selected from the detected dataset CRS. */
  get tilingScheme(): TilingScheme { return this._tilingScheme; }
  /** Geographic coverage of the dataset. */
  get rectangle(): Rectangle { return this._rectangle; }
  /** Width of rendered imagery tiles in pixels. */
  get tileWidth(): number { return this._tileWidth; }
  /** Height of rendered imagery tiles in pixels. */
  get tileHeight(): number { return this._tileHeight; }
  /** Minimum imagery level requested by Cesium. */
  get minimumLevel(): number { return this._minimumLevel; }
  /** Maximum imagery level requested by Cesium. */
  get maximumLevel(): number { return this._maximumLevel; }
  /** Dataset attribution exposed to Cesium. */
  get credit(): Credit { return this._credit; }
  /** Cesium imagery-provider error event. */
  get errorEvent(): Event { return this._errorEvent; }
}
