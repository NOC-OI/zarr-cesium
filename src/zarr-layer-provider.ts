import * as zarr from 'zarrita';
import { deriveRectangleAndScheme, latDegToMercY, lonDegToMercX } from './cesium-utils';
import { vertexShaderSource, fragmentShaderSource } from './shaders';
import { colormapBuilder } from './jsColormaps';
import {
  calculateNearestIndex,
  calculateSliceArgsRequestImage,
  detectCRS,
  extractNoDataMetadata,
  getXYLimits,
  initZarrDataset,
  loadDimensionValues,
  openLevelArray,
  resolveNoDataRange
} from './zarr-utils';
import { createColorRampTexture, createProgram, createShader } from './webgl-utils';
import {
  ColorMapName,
  type CRS,
  type DimensionNamesProps,
  type DimIndicesProps,
  type LayerOptions,
  type XYLimits,
  type ZarrLevelMetadata,
  type ZarrSelectorsProps
} from './types';
import {
  ImageryProvider,
  ImageryLayer,
  TilingScheme,
  Credit,
  DefaultProxy,
  NeverTileDiscardPolicy,
  Viewer,
  Math as CesiumMath,
  Rectangle,
  Event,
  WebMercatorTilingScheme
} from 'cesium';

let CURRENT_ZARR_SIGNAL: AbortSignal | null = null;
const originalFetch = fetch;

(globalThis as any).fetch = async function (url: RequestInfo, init?: RequestInit) {
  const appliedInit: RequestInit = init ? { ...init } : {};

  if (CURRENT_ZARR_SIGNAL) {
    appliedInit.signal = CURRENT_ZARR_SIGNAL;
  }

  try {
    const res = await originalFetch(url, appliedInit);
    return res;
  } catch (err: any) {
    throw err;
  }
};

/**
 * Custom Cesium imagery layer for Zarr datasets.
 *
 * @remarks
 * Extends Cesium's `ImageryLayer` to support real-time updates to
 * visualization style (opacity, color map, scale) from Zarr-based data.
 *
 * @param imageryProvider - Instance of {@link ZarrLayerProvider}.
 * @param viewer - Cesium viewer instance.
 */
export class ZarrImageryLayer extends ImageryLayer {
  /** Unique identifier for the cube provider instance. */
  public id: string = '';
  declare imageryProvider: ZarrLayerProvider;
  viewer?: Viewer;

  /**
   * Forces a re-render of the current view to reflect updated imagery.
   */
  softRefreshCurrentView() {
    const scene = this.viewer?.scene;
    const collection = this.viewer?.imageryLayers;
    if (!collection || !scene) return;

    const idx = collection.indexOf(this);
    collection.remove(this, false);
    collection.add(this, idx);
    scene.requestRender();
  }

  /**
   * Update the visual style of the imagery layer.
   * @param opts - Style options to update.
   * @param opts.opacity - Layer opacity.
   * @param opts.scale - [min, max] range for data scaling.
   * @param opts.colormap - Colormap name.
   */
  updateStyle(opts: { opacity?: number; scale?: [number, number]; colormap?: ColorMapName }) {
    const layerUpdated = this.imageryProvider.updateStyle({
      scale: opts.scale,
      colormap: opts.colormap
    });
    if (layerUpdated) {
      this.softRefreshCurrentView();
    }

    this.alpha = opts.opacity ?? this.alpha;
  }

  /**
   * Update the selectors used for slicing the Zarr dataset.
   * @param selectors - New selectors to apply.
   */
  updateSelectors(selectors: { [key: string]: ZarrSelectorsProps }) {
    const layerUpdated = this.imageryProvider.updateSelectors(selectors);
    if (layerUpdated) {
      this.softRefreshCurrentView();
    }
  }
}

/**
 * Imagery provider for rendering Zarr datasets as Cesium imagery tiles.
 *
 * @remarks
 * This class implements the Cesium `ImageryProvider` interface and manages
 * reading, slicing, and WebGL rendering of Zarr-based raster data.
 *
 * @example
 * ```ts
 * const provider = new ZarrLayerProvider({
 *   url: 'https://example.com/my.zarr',
 *   variable: 'temperature',
 *   scale: [0, 40],
 *   colormap: 'jet'
 * });
 * const imageryLayer = new ZarrImageryLayer(provider);
 * viewer.imageryLayers.add(imageryLayer);
 * ```
 * @see {@link ZarrImageryLayer}
 */
export class ZarrLayerProvider implements ImageryProvider {
  errorEvent = new Event();
  tileDiscardPolicy = new NeverTileDiscardPolicy();
  proxy = new DefaultProxy('');
  /** Values of the data coordinate dimensions (latitude, longitude, elevation, etc.). */
  public dimensionValues: { [key: string]: Float64Array | number[] } = {};
  /** User-defined selectors for slicing dimensions. */
  public selectors: { [key: string]: ZarrSelectorsProps } = {
    time: { selected: 0, type: 'index' },
    elevation: { selected: 0, type: 'index' }
  };
  private url: string;
  private variable: string;
  private zarrVersion: 2 | 3 | null = null;
  private crs: CRS | null = null;
  private dimensionNames: DimensionNamesProps;
  private uniforms: { [key: string]: WebGLUniformLocation | null } = {};
  private noDataMin: number | undefined;
  private noDataMax: number | undefined;
  private fillValue: number | undefined;
  private useFillValue: boolean = false;
  private scaleFactor: number = 1;
  private offset: number = 0;
  private _tilingScheme!: TilingScheme;
  private _coverageRectangle!: Rectangle;
  private readonly _tileWidth: number;
  private readonly _tileHeight: number;
  private readonly _minimumLevel: number;
  private readonly _maximumLevel: number;
  private readonly _credit: Credit;
  private _ready = false;
  private _readyPromise!: Promise<boolean>;
  private _emptyCanvas: HTMLCanvasElement | null = null;

  private colorScale: { min: number; max: number; colors: number[][] };
  private zarrArray: zarr.Array<any> | null = null;
  private dimIndices: DimIndicesProps = {};
  private store!: zarr.FetchStore;
  private root!: zarr.Location<zarr.FetchStore>;
  private levelInfos: string[] = [];
  private levelCache = new Map();
  private levelMetadata: Map<number, ZarrLevelMetadata> = new Map();
  private xyLimits: XYLimits | null = null;
  private colormap: ColorMapName;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private colorTexture: WebGLTexture | null = null;
  private static readonly concurrencyLimit = 15;
  private static activeRequests = 0;
  private static readonly queue: (() => void)[] = [];
  private abortControllers = new Map<string, AbortController>();
  private destroyed = false;
  private static supportsImageBitmap: boolean | null = null;

  constructor(options: LayerOptions) {
    this.url = options.url;
    this.variable = options.variable;
    this._tilingScheme = new WebMercatorTilingScheme();
    this._coverageRectangle = this._tilingScheme.rectangle;
    this.crs = options.crs || null;
    this._tileWidth = options.tileWidth ?? 256;
    this._tileHeight = options.tileHeight ?? 256;
    this._minimumLevel = options.minimumLevel ?? 0;
    this._maximumLevel = options.maximumLevel ?? 8;
    this._credit = new Credit('Zarr Data');
    this.dimensionNames = options.dimensionNames ?? {};
    this.zarrVersion = options.zarrVersion ?? null;
    this.dimensionValues = {};
    const [min, max] = options.scale ?? [-3, 3];
    this.colormap = options.colormap ?? 'viridis';
    const colors = colormapBuilder(this.colormap);
    this.colorScale = { min, max, colors: colors as number[][] };
    this.selectors = options.selectors || {};
    this.noDataMin = options.noDataMin;
    this.noDataMax = options.noDataMax;

    this.initWebGL();
    this._readyPromise = this.initialize().then(ok => ((this._ready = ok), ok));
  }

  private async initialize(): Promise<boolean> {
    try {
      this.store = new zarr.FetchStore(this.url);
      this.root = zarr.root(this.store);

      const { zarrArray, levelInfos, dimIndices, attrs } = await initZarrDataset(
        this.store,
        this.root,
        this.variable,
        this.dimensionNames,
        this.levelMetadata,
        this.levelCache,
        this.zarrVersion
      );
      this.zarrArray = zarrArray;
      this.levelInfos = levelInfos;
      this.dimIndices = dimIndices;
      this.xyLimits = await getXYLimits(
        this.root,
        this.dimIndices,
        this.levelInfos,
        this.levelInfos.length > 0,
        this.zarrVersion
      );

      const meta = extractNoDataMetadata(zarrArray);

      const range = resolveNoDataRange(
        this.noDataMin,
        this.noDataMax,
        meta.metadataMin,
        meta.metadataMax
      );

      this.noDataMin = range.noDataMin;
      this.noDataMax = range.noDataMax;

      this.fillValue = meta.useFillValue ? meta.fillValue : 0;
      this.useFillValue = meta.useFillValue;

      this.scaleFactor = attrs.scale_factor ?? 1;
      this.offset = attrs.add_offset ?? 0;
      this.crs = this.crs || (await detectCRS(attrs, zarrArray));

      const { rectangle, tilingScheme } = deriveRectangleAndScheme(
        this.crs,
        this.xyLimits,
        this.levelMetadata,
        zarrArray,
        dimIndices
      );

      this._coverageRectangle = rectangle;
      this._tilingScheme = tilingScheme;
      await this.loadInitialDimensionValues();

      this._ready = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize Zarr provider:', err);
      return false;
    }
  }

  private async loadInitialDimensionValues(): Promise<void> {
    const multiscaleLevel = this.levelInfos.length > 0 ? this.levelInfos[0] : null;

    for (const dimName of Object.keys(this.dimIndices)) {
      if (dimName !== 'lon' && dimName !== 'lat') {
        try {
          this.dimensionValues[dimName] = await loadDimensionValues(
            this.dimensionValues,
            multiscaleLevel,
            this.dimIndices[dimName],
            this.root,
            this.zarrVersion
          );

          if (!this.selectors[dimName]) {
            this.selectors[dimName] = { selected: 0, type: 'index' };
          } else if (this.selectors[dimName].type === 'value') {
            this.selectors[dimName].selected = calculateNearestIndex(
              this.dimensionValues[dimName],
              this.selectors[dimName].selected as number
            );
          }
        } catch (err) {
          console.warn(`Failed to load dimension values for ${dimName}:`, err);
        }
      }
    }
  }

  /**
   * Creates a Cesium imagery layer from the given viewer and Zarr options.
   * @param viewer - Cesium viewer instance.
   * @param options - Layer options (see {@link LayerOptions}).
   * @returns A promise that resolves to a {@link ZarrImageryLayer}.
   */
  static async createLayer(viewer: Viewer, options: LayerOptions): Promise<ZarrImageryLayer> {
    const provider = new ZarrLayerProvider(options);
    const ready = await provider.readyPromise;
    if (!ready) throw new Error('Failed to initialize ZarrLayerProvider');

    const imageryLayer = new ZarrImageryLayer(provider);
    imageryLayer.alpha = options.opacity ?? 1.0;
    imageryLayer.viewer = viewer;

    return imageryLayer;
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

  private static async checkImageBitmapSupport(): Promise<boolean> {
    if (this.supportsImageBitmap !== null) return this.supportsImageBitmap;

    if (typeof createImageBitmap === 'undefined') {
      this.supportsImageBitmap = false;
      return false;
    }

    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      const bitmap = await createImageBitmap(testCanvas, { imageOrientation: 'flipY' });
      bitmap.close?.();
      this.supportsImageBitmap = true;
    } catch {
      this.supportsImageBitmap = false;
    }
    return this.supportsImageBitmap;
  }

  /**
   * Updates the visualization style for the imagery provider.
   * @param options - Parameters to update.
   * @param options.scale - New [min, max] scale range.
   * @param options.colormap - New colormap name. See {@link ColorMapName}.
   * @returns `true` if any changes were applied, otherwise `false`.
   */
  public updateStyle(options: { scale?: [number, number]; colormap?: ColorMapName }): boolean {
    const { scale, colormap } = options;
    if (!scale && !colormap) return false;
    const nextMin = scale?.[0] ?? this.colorScale.min;
    const nextMax = scale?.[1] ?? this.colorScale.max;
    const nextColormap = colormap ?? this.colormap;

    if (
      nextMin === this.colorScale.min &&
      nextMax === this.colorScale.max &&
      nextColormap === this.colormap
    ) {
      return false;
    }
    if (scale) (this.colorScale.min = scale[0]), (this.colorScale.max = scale[1]);

    if (colormap) {
      this.colormap = colormap;
      const colors = colormapBuilder(colormap) as number[][];
      this.colorScale.colors = colors;
      this.updateColormapTexture();
    }
    return true;
  }

  /**
   * Updates the selectors for slicing dimensions.
   * @param selectors - New selectors mapping. See {@link ZarrSelectorsProps}.
   * @returns `true` if any changes were applied, otherwise `false`.
   */
  public updateSelectors(selectors: { [key: string]: ZarrSelectorsProps }): boolean {
    let layerUpdated = false;
    if (selectors !== undefined) {
      for (const key of Object.keys(selectors)) {
        if (
          !this.selectors[key] ||
          JSON.stringify(this.selectors[key]) !== JSON.stringify(selectors[key])
        ) {
          this.selectors[key] = selectors[key];
          layerUpdated = true;
        }
      }
    }
    return layerUpdated;
  }

  private updateColormapTexture(): void {
    if (!this.gl) return;
    if (this.colorTexture) this.gl.deleteTexture(this.colorTexture);
    this.colorTexture = createColorRampTexture(this.gl, this.colorScale.colors, 1);
  }

  private initWebGL() {
    const canvas = document.createElement('canvas');
    canvas.width = this.tileWidth;
    canvas.height = this.tileHeight;

    this.gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      premultipliedAlpha: false
    }) as WebGL2RenderingContext;

    if (!this.gl) {
      console.error('WebGL2 not supported');
      return;
    }
    const gl = this.gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error('Shader creation failed');
      return;
    }

    this.program = createProgram(gl, vertexShader!, fragmentShader!);
    if (!this.program) return;

    this.updateColormapTexture();

    const positions = new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
    this.uniforms = {
      u_dataTexture: gl.getUniformLocation(this.program, 'u_dataTexture'),
      u_colorRamp: gl.getUniformLocation(this.program, 'u_colorRamp'),
      u_min: gl.getUniformLocation(this.program, 'u_min'),
      u_max: gl.getUniformLocation(this.program, 'u_max'),
      u_noDataMin: gl.getUniformLocation(this.program, 'u_noDataMin'),
      u_noDataMax: gl.getUniformLocation(this.program, 'u_noDataMax'),
      u_fillValue: gl.getUniformLocation(this.program, 'u_fillValue'),
      u_useFillValue: gl.getUniformLocation(this.program, 'u_useFillValue'),
      u_scaleFactor: gl.getUniformLocation(this.program, 'u_scaleFactor'),
      u_addOffset: gl.getUniformLocation(this.program, 'u_addOffset')
    };
  }

  private choosePyramidLevel(cesiumLevel: number): string | null {
    if (!this.levelInfos || this.levelInfos.length === 0) return null;

    const maxCesium = this.maximumLevel;
    const normalized = cesiumLevel / maxCesium;
    const index = Math.floor(normalized * (this.levelInfos.length - 1));
    return this.levelInfos[index];
  }

  private prepareAbortController(key: string): AbortController {
    const prev = this.abortControllers.get(key);
    if (prev) prev.abort();

    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  private async getArrayForLevel(level: number) {
    if (!this.zarrArray) {
      throw new Error('Zarr array not initialized');
    }
    const multiscaleLevel = this.choosePyramidLevel(level);

    if (multiscaleLevel === null) {
      const dataHeight = this.zarrArray.shape[this.dimIndices.lat.index];
      const dataWidth = this.zarrArray.shape[this.dimIndices.lon.index];
      return { dataWidth, dataHeight, currentArray: this.zarrArray, multiscaleLevel: null };
    }

    const currentArray = await openLevelArray(
      this.root,
      multiscaleLevel,
      this.variable,
      this.levelCache
    );

    const multiscaleLevelIndex = this.levelInfos.indexOf(multiscaleLevel);
    const metadata = this.levelMetadata.get(multiscaleLevelIndex);

    if (!metadata) {
      const dataHeight = currentArray.shape[this.dimIndices.lat.index];
      const dataWidth = currentArray.shape[this.dimIndices.lon.index];
      return { dataWidth, dataHeight, currentArray, multiscaleLevel };
    }

    return {
      dataWidth: metadata.width,
      dataHeight: metadata.height,
      currentArray,
      multiscaleLevel
    };
  }

  private computeTileUVs(tileRect: Rectangle) {
    const rect = this._coverageRectangle;
    const toDeg = CesiumMath.toDegrees;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    if (this.crs === 'EPSG:3857') {
      const RXW = lonDegToMercX(toDeg(rect.west));
      const RXE = lonDegToMercX(toDeg(rect.east));
      const RYS = latDegToMercY(toDeg(rect.south));
      const RYN = latDegToMercY(toDeg(rect.north));
      const XW = lonDegToMercX(toDeg(tileRect.west));
      const XE = lonDegToMercX(toDeg(tileRect.east));
      const YS = latDegToMercY(toDeg(tileRect.south));
      const YN = latDegToMercY(toDeg(tileRect.north));
      return {
        u0: clamp((XW - RXW) / (RXE - RXW)),
        u1: clamp((XE - RXW) / (RXE - RXW)),
        v0: clamp((RYN - YN) / (RYN - RYS)),
        v1: clamp((RYN - YS) / (RYN - RYS))
      };
    }

    const west = toDeg(rect.west);
    const east = toDeg(rect.east);
    const south = toDeg(rect.south);
    const north = toDeg(rect.north);
    const tWest = toDeg(tileRect.west);
    const tEast = toDeg(tileRect.east);
    const tSouth = toDeg(tileRect.south);
    const tNorth = toDeg(tileRect.north);

    return {
      u0: clamp((tWest - west) / (east - west)),
      u1: clamp((tEast - west) / (east - west)),
      v0: clamp((north - tNorth) / (north - south)),
      v1: clamp((north - tSouth) / (north - south))
    };
  }

  private computePixelBounds(
    u0: number,
    u1: number,
    v0: number,
    v1: number,
    dataWidth: number,
    dataHeight: number
  ) {
    const startX = Math.floor(u0 * dataWidth),
      endX = Math.ceil(u1 * dataWidth);
    const startY = Math.floor(v0 * dataHeight),
      endY = Math.ceil(v1 * dataHeight);
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const sX = clamp(startX, 0, dataWidth - 1),
      eX = clamp(endX, 0, dataWidth);
    const sY = clamp(startY, 0, dataHeight - 1),
      eY = clamp(endY, 0, dataHeight);
    const width = eX - sX,
      height = eY - sY;
    return width > 0 && height > 0
      ? { startX: sX, endX: eX, startY: sY, endY: eY, width, height }
      : null;
  }

  private emptyCanvas(): HTMLCanvasElement {
    if (!this._emptyCanvas) {
      this._emptyCanvas = document.createElement('canvas');
      this._emptyCanvas.width = this._tileWidth;
      this._emptyCanvas.height = this._tileHeight;
    }
    return this._emptyCanvas;
  }

  /**
   * Requests a rendered image tile from the Zarr dataset.
   * @param x - Tile x coordinate.
   * @param y - Tile y coordinate.
   * @param level - Zoom level.
   * @returns A rendered tile as an HTMLCanvasElement or ImageBitmap.
   */
  async requestImage(
    x: number,
    y: number,
    level: number
  ): Promise<HTMLCanvasElement | ImageBitmap> {
    if (this.destroyed) {
      return this.emptyCanvas();
    }
    const key = `${level}/${x}/${y}`;

    const controller = this.prepareAbortController(key);
    if (!this.ready || !this.zarrArray || !this.gl || !this.program) {
      console.warn('[requestImage] not ready yet', {
        gl: !!this.gl,
        program: !!this.program,
        zarrArray: !!this.zarrArray
      });
      await this.readyPromise;
      if (!this.gl || !this.program) return this.emptyCanvas();
    }

    try {
      const tileRect = this._tilingScheme.tileXYToRectangle(x, y, level);
      const intersection = Rectangle.intersection(tileRect, this._coverageRectangle);

      if (!intersection) {
        return this.emptyCanvas();
      }

      const fracWest = (intersection.west - tileRect.west) / (tileRect.east - tileRect.west);
      const fracEast = (intersection.east - tileRect.west) / (tileRect.east - tileRect.west);
      const fracSouth = (intersection.south - tileRect.south) / (tileRect.north - tileRect.south);
      const fracNorth = (intersection.north - tileRect.south) / (tileRect.north - tileRect.south);

      const { dataWidth, dataHeight, currentArray, multiscaleLevel } = await this.getArrayForLevel(
        level
      );

      const { u0, u1, v0, v1 } = this.computeTileUVs(tileRect);

      const bounds = this.computePixelBounds(u0, u1, v0, v1, dataWidth, dataHeight);

      if (!bounds) {
        return this.emptyCanvas();
      }
      const sliceArgs = await calculateSliceArgsRequestImage(
        currentArray.shape,
        bounds,
        this.dimIndices,
        this.selectors
      );
      let data: zarr.Chunk<any>;
      try {
        CURRENT_ZARR_SIGNAL = controller.signal;
        data = await ZarrLayerProvider.throttle(() => zarr.get(currentArray, sliceArgs));
      } catch (err: any) {
        CURRENT_ZARR_SIGNAL = null;

        if (err.name === 'AbortError') {
          return this.emptyCanvas();
        }
        throw err;
      }
      CURRENT_ZARR_SIGNAL = null;

      if (controller.signal.aborted) return this.emptyCanvas();

      if (!data || !data.data || data.data.length === 0) {
        return this.emptyCanvas();
      }

      const flatData = new Float32Array((data.data as Float32Array).buffer);

      return this.renderWithWebGL(flatData, bounds.width, bounds.height, {
        fracWest,
        fracEast,
        fracSouth,
        fracNorth
      });
    } catch (error) {
      return this.emptyCanvas();
    } finally {
      this.abortControllers.delete(key);
    }
  }

  private async renderWithWebGL(
    data: Float32Array,
    width: number,
    height: number,
    frac: { fracWest: number; fracEast: number; fracSouth: number; fracNorth: number }
  ): Promise<HTMLCanvasElement | ImageBitmap> {
    const gl = this.gl as WebGL2RenderingContext;
    if (!gl || !this.program) throw new Error('WebGL2 not initialized');

    const { fracWest, fracEast, fracSouth, fracNorth } = frac;

    const dataTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, height, 0, gl.RED, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.useProgram(this.program);
    gl.viewport(0, 0, this._tileWidth, this._tileHeight);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const x0 = fracWest * 2.0 - 1.0;
    const x1 = fracEast * 2.0 - 1.0;
    const y0 = fracSouth * 2.0 - 1.0;
    const y1 = fracNorth * 2.0 - 1.0;

    const positions = new Float32Array([
      x0,
      y0,
      0,
      0,
      x1,
      y0,
      1,
      0,
      x0,
      y1,
      0,
      1,
      x0,
      y1,
      0,
      1,
      x1,
      y0,
      1,
      0,
      x1,
      y1,
      1,
      1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STREAM_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.uniform1i(this.uniforms.u_dataTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.uniform1i(this.uniforms.u_colorRamp, 1);

    gl.uniform1f(this.uniforms.u_min, this.colorScale.min);
    gl.uniform1f(this.uniforms.u_max, this.colorScale.max);

    gl.uniform1f(this.uniforms.u_noDataMin, this.noDataMin as number);
    gl.uniform1f(this.uniforms.u_noDataMax, this.noDataMax as number);
    gl.uniform1f(this.uniforms.u_fillValue, this.fillValue as number);
    gl.uniform1i(this.uniforms.u_useFillValue, this.useFillValue ? 1 : 0);
    gl.uniform1f(this.uniforms.u_scaleFactor, this.scaleFactor);
    gl.uniform1f(this.uniforms.u_addOffset, this.offset);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.deleteTexture(dataTexture);
    gl.deleteBuffer(buffer);

    if (await ZarrLayerProvider.checkImageBitmapSupport()) {
      try {
        return await createImageBitmap(gl.canvas as HTMLCanvasElement, {
          imageOrientation: 'flipY',
          premultiplyAlpha: 'premultiply'
        });
      } catch (err) {
        console.warn('ImageBitmap fallback:', err);
        ZarrLayerProvider.supportsImageBitmap = false;
      }
    }

    const fallback = document.createElement('canvas');
    fallback.width = this._tileWidth;
    fallback.height = this._tileHeight;
    fallback.getContext('2d')!.drawImage(gl.canvas as HTMLCanvasElement, 0, 0);
    return fallback;
  }

  /** Indicates whether the imagery has an alpha channel. */
  get hasAlphaChannel() {
    return true;
  }
  /** Picks features at a given geographic location. */
  pickFeatures() {
    return undefined;
  }
  /** Tiling scheme used by the imagery provider. */
  get tilingScheme() {
    return this._tilingScheme;
  }
  /** Geographic coverage rectangle of the imagery provider. */
  get rectangle() {
    return this._coverageRectangle;
  }
  /** Width of each tile, in pixels. */
  get tileWidth() {
    return this._tileWidth;
  }
  /** Height of each tile, in pixels. */
  get tileHeight() {
    return this._tileHeight;
  }
  /** Minimum zoom level supported by the provider. */
  get minimumLevel() {
    return this._minimumLevel;
  }
  /** Maximum zoom level supported by the provider. */
  get maximumLevel() {
    return this._maximumLevel;
  }
  /** Credit information for the imagery provider. */
  get credit() {
    return this._credit;
  }
  /** Indicates whether the provider is fully initialized and ready. */
  get ready() {
    return this._ready && !this.destroyed;
  }
  /**
   * Promise that resolves when the provider is fully initialized.
   */
  get readyPromise() {
    return this._readyPromise;
  }

  /**
   * Retrieves the credits for a specific tile.
   * @param x - Tile x coordinate.
   * @param y - Tile y coordinate.
   * @param level - Zoom level.
   * @returns An array of credits associated with the tile.
   */
  getTileCredits(x: number, y: number, level: number): Credit[] {
    return this._credit ? [this._credit] : [];
  }

  /** Cleans up resources used by the imagery provider. */
  destroy() {
    this.destroyed = true;

    for (const [key, controller] of this.abortControllers.entries()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}
