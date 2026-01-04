import * as zarr from 'zarrita';
import { deriveRectangleAndScheme, latDegToMercY, lonDegToMercX } from './cesium-utils';
import { vertexShaderSource, fragmentShaderSource } from './shaders';
import { colormapBuilder } from './jsColormaps';
import {
  calculateNearestIndex,
  calculateSliceArgsRequestImage,
  getBands,
  loadDimensionValues,
  normalizeSelectors,
  toSelectorProps
} from './zarr-utils';
import { createColorRampTexture, createProgram, createShader, detectBrowser } from './webgl-utils';
import {
  BoundsProps,
  ColorMapName,
  CustomShaderConfig,
  DimensionValues,
  NormalizedSelectors,
  Selectors,
  type CRS,
  type DimensionNamesProps,
  type DimIndicesProps,
  type LayerOptions,
  type XYLimits
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
import { ZarrStore } from './zarr-store';

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
  /** Unique identifier for the layer provider instance. */
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
   * @param opts.clim - [min, max] range for data scaling.
   * @param opts.colormap - Colormap name.
   */
  updateStyle(opts: { opacity?: number; clim?: [number, number]; colormap?: ColorMapName }) {
    const layerUpdated = this.imageryProvider.updateStyle({
      clim: opts.clim,
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
  updateSelectors(selectors: Selectors) {
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
 *   source: 'https://example.com/my.zarr',
 *   variable: 'temperature',
 *   clim: [0, 40],
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
  public dimensionValues: DimensionValues = {};
  /** User-defined selectors for slicing dimensions. */
  private _selectors: Selectors = {
    time: { selected: 0, type: 'index' },
    elevation: { selected: 0, type: 'index' }
  };
  private normalizedSelector: NormalizedSelectors = {};
  private source: string;
  private variable: string;
  private dataTexture: WebGLTexture | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private attribs: { [key: string]: number } = {};
  private zarrVersion: 2 | 3 | null = null;
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
  private readonly browser = detectBrowser();
  private _ready = false;
  private _readyPromise!: Promise<boolean>;
  private _emptyCanvas: HTMLCanvasElement | null = null;
  private zarrStore: ZarrStore | null = null;
  private bandNames: string[] = [];
  private customShaderConfig: CustomShaderConfig | null = null;
  private colorScale: { min: number; max: number; colors: number[][] };
  private dimIndices: DimIndicesProps = {};
  private levelInfos: string[] = [];
  private colormap: ColorMapName;
  private proj4: string | undefined;
  private crs: CRS | null = null;
  private bounds: BoundsProps | undefined;
  private latIsAscending: boolean | null = null;
  private customFrag: string | undefined;
  private customUniforms: Record<string, number> = {};
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private colorTexture: WebGLTexture | null = null;
  private static readonly concurrencyLimit = 32;
  private static activeRequests = 0;
  private static readonly queue: (() => void)[] = [];
  private abortControllers = new Map<string, AbortController>();
  private destroyed = false;
  private static supportsImageBitmap: boolean | null = null;
  private selectorVersion = 0;

  constructor(options: LayerOptions) {
    this.source = options.source;
    this.variable = options.variable;
    this._selectors = options.selectors || {};
    const [min, max] = options.clim ?? [-3, 3];
    this.colormap = options.colormap ?? 'viridis';
    const colors = colormapBuilder(this.colormap);
    this.colorScale = { min, max, colors: colors as number[][] };
    this._tileWidth = options.tileWidth ?? 256;
    this._tileHeight = options.tileHeight ?? 256;
    this._minimumLevel = options.minimumLevel ?? 0;
    this._maximumLevel = options.maximumLevel ?? 8;
    this.zarrVersion = options.zarrVersion ?? null;
    this.dimensionValues = {};
    this.bounds = options.bounds;
    this.latIsAscending = options.latIsAscending ?? null;
    this.noDataMin = options.noDataMin;
    this.noDataMax = options.noDataMax;

    this.crs = options.crs || null;
    this.dimensionNames = options.dimensionNames ?? {};
    this._tilingScheme = new WebMercatorTilingScheme();
    this._coverageRectangle = this._tilingScheme.rectangle;

    this._credit = new Credit('Zarr Data');
    this.initWebGL();
    this._readyPromise = this.initialize().then(ok => ((this._ready = ok), ok));
  }

  private async initialize(): Promise<boolean> {
    try {
      this.zarrStore = new ZarrStore({
        source: this.source,
        version: this.zarrVersion,
        variable: this.variable,
        dimensionNames: this.dimensionNames,
        bounds: this.bounds,
        latIsAscending: this.latIsAscending,
        coordinateKeys: Object.keys(this._selectors),
        proj4: this.proj4
      });

      await this.zarrStore.initialized;

      const desc = this.zarrStore.describe();

      this.levelInfos = desc.levels;
      this.dimIndices = desc.dimIndices;
      this.scaleFactor = desc.scaleFactor;
      this.offset = desc.addOffset;

      if (this.fillValue === null && desc.fill_value !== null && desc.fill_value !== undefined) {
        this.fillValue = desc.fill_value;
      }

      this.normalizedSelector = normalizeSelectors(this._selectors);
      await this.loadInitialDimensionValues();

      const { rectangle, tilingScheme } = deriveRectangleAndScheme(
        this.zarrStore.crs,
        this.zarrStore.xyLimits as XYLimits
      );

      this._coverageRectangle = rectangle;
      this._tilingScheme = tilingScheme;

      this.bandNames = getBands(this.variable, this.normalizedSelector);
      if (this.bandNames.length > 1 || this.customFrag) {
        this.customShaderConfig = {
          bands: this.bandNames,
          customFrag: this.customFrag,
          customUniforms: this.customUniforms
        };
      } else {
        this.customShaderConfig = null;
      }

      this._ready = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize Zarr provider:', err);
      if (this.zarrStore) {
        this.zarrStore.cleanup();
        this.zarrStore = null;
      }
      return false;
    }
  }

  private async loadInitialDimensionValues(): Promise<void> {
    if (!this.zarrStore?.root) return;

    const multiscaleLevel = this.levelInfos.length > 0 ? this.levelInfos[0] : null;
    for (const [dimName, value] of Object.entries(this._selectors)) {
      this.normalizedSelector[dimName] = toSelectorProps(value);
    }
    for (const dimName of Object.keys(this.dimIndices)) {
      if (dimName !== 'lon' && dimName !== 'lat') {
        try {
          this.dimensionValues[dimName] = await loadDimensionValues(
            this.dimensionValues,
            multiscaleLevel,
            this.dimIndices[dimName],
            this.zarrStore.root as zarr.Location<zarr.FetchStore>,
            this.zarrStore.version
          );

          if (!this.normalizedSelector[dimName]) {
            this.normalizedSelector[dimName] = { selected: 0, type: 'index' };
          } else if (this.normalizedSelector[dimName].type === 'value') {
            this.normalizedSelector[dimName].selected = calculateNearestIndex(
              this.dimensionValues[dimName],
              this.normalizedSelector[dimName].selected as number
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
    if (options.id) imageryLayer.id = options.id;

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
   * @param options.clim - New [min, max] colormap limits.
   * @param options.colormap - New colormap name. See {@link ColorMapName}.
   * @returns `true` if any changes were applied, otherwise `false`.
   */
  public updateStyle(options: { clim?: [number, number]; colormap?: ColorMapName }): boolean {
    const { clim, colormap } = options;
    if (!clim && !colormap) return false;
    const nextMin = clim?.[0] ?? this.colorScale.min;
    const nextMax = clim?.[1] ?? this.colorScale.max;
    const nextColormap = colormap ?? this.colormap;

    if (
      nextMin === this.colorScale.min &&
      nextMax === this.colorScale.max &&
      nextColormap === this.colormap
    ) {
      return false;
    }
    if (clim) (this.colorScale.min = clim[0]), (this.colorScale.max = clim[1]);

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
  public updateSelectors(selectors: Selectors): boolean {
    let layerUpdated = false;
    for (const key of Object.keys(selectors ?? {})) {
      if (
        !this._selectors[key] ||
        JSON.stringify(this._selectors[key]) !== JSON.stringify(selectors[key])
      ) {
        this._selectors[key] = selectors[key];
        layerUpdated = true;
      }
    }
    if (layerUpdated) {
      this.normalizedSelector = normalizeSelectors(this._selectors);
      this.selectorVersion++;
      // Update band names and custom shader config (Mapbox style)
      this.bandNames = getBands(this.variable, this.normalizedSelector);
      if (this.bandNames.length > 1 || this.customFrag) {
        this.customShaderConfig = {
          bands: this.bandNames,
          customFrag: this.customFrag,
          customUniforms: this.customUniforms
        };
      } else {
        this.customShaderConfig = null;
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
      preserveDrawingBuffer: false,
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

    // const positions = new Float32Array([
    //   -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1
    // ]);

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 24 * 4, gl.DYNAMIC_DRAW);

    // gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
    this.attribs = { a_position: positionLocation, a_texCoord: texCoordLocation };

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    this.dataTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.uniforms = {
      u_dataTexture: gl.getUniformLocation(this.program, 'u_dataTexture'),
      u_colorRamp: gl.getUniformLocation(this.program, 'u_colorRamp'),
      u_min: gl.getUniformLocation(this.program, 'u_min'),
      u_max: gl.getUniformLocation(this.program, 'u_max'),
      // u_noDataMin: gl.getUniformLocation(this.program, 'u_noDataMin'),
      // u_noDataMax: gl.getUniformLocation(this.program, 'u_noDataMax'),
      u_fillValue: gl.getUniformLocation(this.program, 'u_fillValue'),
      u_useFillValue: gl.getUniformLocation(this.program, 'u_useFillValue'),
      u_scaleFactor: gl.getUniformLocation(this.program, 'u_scaleFactor'),
      u_addOffset: gl.getUniformLocation(this.program, 'u_addOffset'),
      u_texScale: gl.getUniformLocation(this.program, 'u_texScale'),
      u_texOffset: gl.getUniformLocation(this.program, 'u_texOffset'),
      u_channel: gl.getUniformLocation(this.program, 'u_channel')
    };
  }

  private prepareAbortController(key: string): AbortController {
    const prev = this.abortControllers.get(key);
    if (prev) prev.abort();

    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  private computeTileUVs(tileRect: Rectangle) {
    const rect = this._coverageRectangle;
    const toDeg = CesiumMath.toDegrees;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    if (this.zarrStore!.crs === 'EPSG:3857') {
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
    const version = this.selectorVersion;
    const key = `${version}:${level}/${x}/${y}`;
    // const key = `${level}/${x}/${y}`;

    const controller = this.prepareAbortController(key);
    if (!this.ready || !this.zarrStore || !this.gl || !this.program) {
      console.warn('[requestImage] not ready yet', {
        gl: !!this.gl,
        program: !!this.program,
        zarrStore: !!this.zarrStore
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
      if (version !== this.selectorVersion) return this.emptyCanvas();

      const fracWest = (intersection.west - tileRect.west) / (tileRect.east - tileRect.west);
      const fracEast = (intersection.east - tileRect.west) / (tileRect.east - tileRect.west);
      const fracSouth = (intersection.south - tileRect.south) / (tileRect.north - tileRect.south);
      const fracNorth = (intersection.north - tileRect.south) / (tileRect.north - tileRect.south);
      const frac = { fracWest, fracEast, fracSouth, fracNorth };

      const {
        array: currentArray,
        width: dataWidth,
        height: dataHeight
      } = await this.zarrStore!.getArrayForCesiumLevel(level, this.maximumLevel);

      const { u0, u1, v0, v1 } = this.computeTileUVs(tileRect);

      const bounds = this.computePixelBounds(u0, u1, v0, v1, dataWidth, dataHeight);
      if (!bounds) return this.emptyCanvas();

      const sliceArgs = await calculateSliceArgsRequestImage(
        currentArray.shape,
        bounds,
        this.dimIndices,
        this.normalizedSelector
      );
      // Mapbox-like multi-value dims -> channel combinations
      const multiValueDims = this.extractMultiValueDims(this.normalizedSelector);
      // Fetch (throttled)
      const fetched = await ZarrLayerProvider.throttle(() =>
        this.fetchTileSubset(currentArray, sliceArgs, multiValueDims, controller.signal, version)
      );

      if (version !== this.selectorVersion) return this.emptyCanvas();
      console.log('Fetched tile data:', { level, x, y, fetched });
      // const flatData = new Float32Array((data.data as Float32Array).buffer);
      return this.renderWithWebGL(
        fetched.data,
        fetched.width,
        fetched.height,
        frac,
        fetched.channels
      );
    } catch (error) {
      return this.emptyCanvas();
    } finally {
      this.abortControllers.delete(key);
    }
  }

  private buildChannelCombinations(
    multiValueDims: Array<{ dimIndex: number; values: number[]; labels: (number | string)[] }>
  ): { combinations: number[][]; labelCombinations: (number | string)[][] } {
    let combinations: number[][] = [[]];
    let labelCombinations: (number | string)[][] = [[]];

    for (const { values, labels } of multiValueDims) {
      const nextCombos: number[][] = [];
      const nextLabels: (number | string)[][] = [];
      for (let i = 0; i < values.length; i++) {
        for (let c = 0; c < combinations.length; c++) {
          nextCombos.push([...combinations[c], values[i]]);
          nextLabels.push([...labelCombinations[c], labels[i]]);
        }
      }
      combinations = nextCombos;
      labelCombinations = nextLabels;
    }

    return { combinations, labelCombinations };
  }

  private extractMultiValueDims(selector: NormalizedSelectors) {
    const out: Array<{ dimIndex: number; values: number[]; labels: (number | string)[] }> = [];

    for (const [dimName, spec] of Object.entries(selector)) {
      if (dimName === 'lat' || dimName === 'lon') continue;
      const dimInfo = this.dimIndices[dimName];
      if (!dimInfo) continue;

      const selected = spec?.selected as any;
      if (Array.isArray(selected) && selected.length > 1) {
        // Treat as indices. If you want value->index resolution, wire in dimensionValues here.
        const values = selected.map(v => (typeof v === 'number' ? v : 0));
        out.push({ dimIndex: dimInfo.index, values, labels: selected });
      }
    }

    return out;
  }

  private async fetchTileSubset(
    currentArray: zarr.Array<any>,
    sliceArgs: (number | zarr.Slice)[],
    multiValueDims: Array<{ dimIndex: number; values: number[]; labels: (number | string)[] }>,
    signal: AbortSignal,
    requestVersion: number
  ): Promise<{ data: Float32Array; width: number; height: number; channels: number }> {
    const latIdx = this.dimIndices.lat.index;
    const lonIdx = this.dimIndices.lon.index;

    const ySlice = sliceArgs[latIdx] as zarr.Slice;
    const xSlice = sliceArgs[lonIdx] as zarr.Slice;

    const height = (ySlice.stop as number) - (ySlice.start as number);
    const width = (xSlice.stop as number) - (xSlice.start as number);

    const { combinations } = this.buildChannelCombinations(multiValueDims);
    const channels = combinations.length || 1;
    const pixelCount = width * height;

    // Single-channel
    if (channels === 1) {
      const result = (await zarr.get(currentArray, sliceArgs, { opts: { signal } })) as {
        data: ArrayLike<number>;
      };

      // If selector changed while fetching, treat as stale
      if (requestVersion !== this.selectorVersion) throw new DOMException('Stale', 'AbortError');

      const src = result.data;
      const arr = src instanceof Float32Array ? src : new Float32Array(src as any);
      return { data: arr, width, height, channels: 1 };
    }

    // Multi-channel: fetch each combo, pack interleaved
    const packed = new Float32Array(pixelCount * channels);
    const fill = this.fillValue ?? 0;
    packed.fill(fill);

    for (let c = 0; c < channels; c++) {
      const args = [...sliceArgs];
      const combo = combinations[c];

      for (let i = 0; i < multiValueDims.length; i++) {
        args[multiValueDims[i].dimIndex] = combo[i];
      }

      const result = (await zarr.get(currentArray, args, { opts: { signal } })) as {
        data: ArrayLike<number>;
      };

      if (requestVersion !== this.selectorVersion) throw new DOMException('Stale', 'AbortError');

      const band =
        result.data instanceof Float32Array ? result.data : new Float32Array(result.data as any);

      for (let i = 0; i < pixelCount; i++) {
        packed[i * channels + c] = band[i];
      }
    }

    return { data: packed, width, height, channels };
  }

  private packToRGBA(packed: Float32Array, channels: number): Float32Array {
    const pix = packed.length / channels;
    const rgba = new Float32Array(pix * 4);

    for (let i = 0; i < pix; i++) {
      rgba[i * 4 + 0] = packed[i * channels + 0];
      rgba[i * 4 + 1] = channels > 1 ? packed[i * channels + 1] : packed[i * channels + 0];
      rgba[i * 4 + 2] = channels > 2 ? packed[i * channels + 2] : packed[i * channels + 0];
      rgba[i * 4 + 3] = channels > 3 ? packed[i * channels + 3] : packed[i * channels + 0];
    }
    return rgba;
  }

  private async renderWithWebGL(
    data: Float32Array,
    width: number,
    height: number,
    frac: { fracWest: number; fracEast: number; fracSouth: number; fracNorth: number },
    channels: number = 1
  ): Promise<any> {
    const gl = this.gl as WebGL2RenderingContext;
    if (!gl || !this.program) throw new Error('WebGL2 not initialized');
    if (!this.dataTexture || !this.quadBuffer || !this.attribs)
      throw new Error('WebGL resources missing');

    // ===== DEBUG: Check incoming data =====
    console.log('=== RENDER DEBUG ===');
    console.log('Data stats:', {
      length: data.length,
      width,
      height,
      channels,
      expectedLength: width * height * channels,
      min: Math.min(...data),
      max: Math.max(...data),
      mean: data.reduce((a, b) => a + b, 0) / data.length,
      hasNaN: Array.from(data).some(v => isNaN(v)),
      hasInf: Array.from(data).some(v => !isFinite(v)),
      first10: Array.from(data.slice(0, 10)),
      fillValue: this.fillValue,
      useFillValue: this.useFillValue
    });

    const { fracWest, fracEast, fracSouth, fracNorth } = frac;
    console.log('Fractions:', { fracWest, fracEast, fracSouth, fracNorth });

    // ===== Upload texture =====
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);

    if (channels === 1) {
      console.log('Uploading R32F texture');
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, height, 0, gl.RED, gl.FLOAT, data);
    } else {
      console.log('Uploading RGBA32F texture');
      const rgba = this.packToRGBA(data, channels);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, rgba);
    }

    let err = gl.getError();
    if (err !== gl.NO_ERROR) {
      console.error('Texture upload error:', err);
    }

    // ===== Setup GL state =====
    gl.useProgram(this.program);
    gl.viewport(0, 0, this._tileWidth, this._tileHeight);

    // Clear to a visible test color first
    gl.clearColor(0, 1, 0, 1); // Green background to verify clearing works
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ===== Setup geometry =====
    const x0 = fracWest * 2.0 - 1.0;
    const x1 = fracEast * 2.0 - 1.0;
    const y0 = fracSouth * 2.0 - 1.0;
    const y1 = fracNorth * 2.0 - 1.0;

    console.log('Quad coords:', { x0, x1, y0, y1 });

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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);

    gl.enableVertexAttribArray(this.attribs.a_position);
    gl.vertexAttribPointer(this.attribs.a_position, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(this.attribs.a_texCoord);
    gl.vertexAttribPointer(this.attribs.a_texCoord, 2, gl.FLOAT, false, 16, 8);

    // ===== Bind textures and uniforms =====
    gl.uniform1i(this.uniforms.u_dataTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.uniform1i(this.uniforms.u_colorRamp, 1);

    console.log('Uniforms:', {
      min: this.colorScale.min,
      max: this.colorScale.max,
      fillValue: this.fillValue,
      useFillValue: this.useFillValue,
      scaleFactor: this.scaleFactor,
      offset: this.offset
    });

    gl.uniform1f(this.uniforms.u_min, this.colorScale.min);
    gl.uniform1f(this.uniforms.u_max, this.colorScale.max);
    gl.uniform1f(this.uniforms.u_fillValue, this.fillValue ?? 0);
    gl.uniform1i(this.uniforms.u_useFillValue, this.useFillValue ? 1 : 0);
    gl.uniform1f(this.uniforms.u_scaleFactor, this.scaleFactor);
    gl.uniform1f(this.uniforms.u_addOffset, this.offset);
    gl.uniform2f(this.uniforms.u_texScale, 1.0, 1.0);
    gl.uniform2f(this.uniforms.u_texOffset, 0.0, 0.0);
    gl.uniform1i(this.uniforms.u_channel, 0);

    err = gl.getError();
    if (err !== gl.NO_ERROR) {
      console.error('Uniform setup error:', err);
    }

    // ===== Draw =====
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    err = gl.getError();
    if (err !== gl.NO_ERROR) {
      console.error('Draw error:', err);
    }

    // ===== Read back pixels for verification =====
    const testPixels = new Uint8Array(16); // 2x2 grid
    gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, testPixels);
    console.log('Corner pixels (2x2):', Array.from(testPixels));

    const centerPixels = new Uint8Array(4);
    gl.readPixels(
      this._tileWidth / 2,
      this._tileHeight / 2,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      centerPixels
    );
    console.log('Center pixel:', Array.from(centerPixels));

    // Read raw float values
    const rawFloats = new Float32Array(4);
    gl.readPixels(this._tileWidth / 2, this._tileHeight / 2, 1, 1, gl.RGBA, gl.FLOAT, rawFloats);
    console.log('Center pixel (float):', Array.from(rawFloats));

    // ===== Return canvas =====
    const fallback = document.createElement('canvas');
    fallback.width = this._tileWidth;
    fallback.height = this._tileHeight;
    const ctx = fallback.getContext('2d')!;
    ctx.drawImage(gl.canvas as HTMLCanvasElement, 0, 0);

    console.log('=== END RENDER DEBUG ===\n');

    return fallback;
  }

  private async renderWithWebGL2(
    data: Float32Array,
    width: number,
    height: number,
    frac: { fracWest: number; fracEast: number; fracSouth: number; fracNorth: number },
    channels: number = 1
  ): Promise<any> {
    const gl = this.gl as WebGL2RenderingContext;
    if (!gl || !this.program) throw new Error('WebGL2 not initialized');
    if (!this.dataTexture || !this.quadBuffer || !this.attribs)
      throw new Error('WebGL resources missing');

    const { fracWest, fracEast, fracSouth, fracNorth } = frac;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
    if (channels === 1) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, height, 0, gl.RED, gl.FLOAT, data);
    } else {
      const rgba = this.packToRGBA(data, channels);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, rgba);
    }
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    // gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STREAM_DRAW);

    gl.enableVertexAttribArray(this.attribs.a_position);
    gl.vertexAttribPointer(this.attribs.a_position, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(this.attribs.a_texCoord);
    gl.vertexAttribPointer(this.attribs.a_texCoord, 2, gl.FLOAT, false, 16, 8);

    // Bind textures/uniforms
    gl.uniform1i(this.uniforms.u_dataTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.uniform1i(this.uniforms.u_colorRamp, 1);

    gl.uniform1f(this.uniforms.u_min, this.colorScale.min);
    gl.uniform1f(this.uniforms.u_max, this.colorScale.max);

    // gl.uniform1f(this.uniforms.u_noDataMin, this.noDataMin as number);
    // gl.uniform1f(this.uniforms.u_noDataMax, this.noDataMax as number);
    gl.uniform1f(this.uniforms.u_fillValue, 0);
    // gl.uniform1f(this.uniforms.u_fillValue, this.fillValue as number);
    gl.uniform1i(this.uniforms.u_useFillValue, this.useFillValue ? 1 : 0);
    gl.uniform1f(this.uniforms.u_scaleFactor, this.scaleFactor);
    gl.uniform1f(this.uniforms.u_addOffset, this.offset);

    gl.uniform2f(this.uniforms.u_texScale, 1.0, 1.0);
    gl.uniform2f(this.uniforms.u_texOffset, 0.0, 0.0);
    gl.uniform1i(this.uniforms.u_channel, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // if (this.browser === 'chrome' && (await ZarrLayerProvider.checkImageBitmapSupport())) {
    //   try {
    //     return await createImageBitmap(gl.canvas as HTMLCanvasElement, {
    //       // imageOrientation: 'none',
    //       imageOrientation: 'flipY',
    //       premultiplyAlpha: 'premultiply'
    //     });
    //   } catch (err) {
    //     console.warn('ImageBitmap fallback:', err);
    //     ZarrLayerProvider.supportsImageBitmap = false;
    //   }
    // }
    const pixels = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log('First pixel:', pixels); // Should NOT be [255, 0, 255, 255] if data rendered

    const fallback = document.createElement('canvas');
    fallback.width = this._tileWidth;
    fallback.height = this._tileHeight;
    fallback.getContext('2d')!.drawImage(gl.canvas as HTMLCanvasElement, 0, 0);

    const ctx = fallback.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.font = '20px sans-serif';
    ctx.fillText('ZARR', 10, 30);

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

  get selectors() {
    return this.normalizedSelector;
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
    if (this.gl) {
      if (this.dataTexture) this.gl.deleteTexture(this.dataTexture);
      if (this.quadBuffer) this.gl.deleteBuffer(this.quadBuffer);
      if (this.colorTexture) this.gl.deleteTexture(this.colorTexture);
    }
    this.dataTexture = null;
    this.quadBuffer = null;
    this.colorTexture = null;
  }
}
