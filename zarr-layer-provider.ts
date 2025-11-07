import * as zarr from 'zarrita';
import { deriveRectangleAndScheme, latDegToMercY, lonDegToMercX } from './cesium-utils';
import * as Cesium from 'cesium';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { colormapBuilder } from './jsColormaps';
import { calculateSliceArgs, detectCRS, getXYLimits, initZarrDataset } from './zarr-utils';
import { createColorRampTexture, createProgram, createShader } from './webgl-utils';
import { CRS, DimensionNamesProps, LayerOptions, XYLimits, ZarrSelectorsProps } from './types';

export class ZarrImageryLayer extends Cesium.ImageryLayer {
  declare imageryProvider: ZarrLayerProvider;

  updateStyle(opts: Parameters<ZarrLayerProvider['updateStyle']>[0]) {
    this.imageryProvider.updateStyle(opts);
    const layerCollection = (this as any)._layerCollection;
    const scene = layerCollection?._scene;
    const surface = scene?.globe?._surface;

    // Invalidate all tiles for this layer
    const layerIndex = layerCollection?.indexOf(this);
    const layerState = surface?._tileProvider?._imageryLayerCollection?.get(layerIndex);
    if (layerState && layerState._imageryCache) {
      for (const key in layerState._imageryCache) delete layerState._imageryCache[key];
    }

    // Then mark the quadtree dirty
    surface?._tileProvider?._quadtree?.invalidateAllTiles?.();

    scene?.requestRender();
  }
}

export class ZarrLayerProvider implements Cesium.ImageryProvider {
  errorEvent = new Cesium.Event();
  tileDiscardPolicy = new Cesium.NeverTileDiscardPolicy();
  proxy: any = undefined;
  private url: string;
  private variable: string;
  private crs: CRS | null = null;
  private dimensionNames: DimensionNamesProps;
  private dimensionValues: { [key: string]: Float64Array | number[] } = {};
  private selectors: { [key: string]: ZarrSelectorsProps } = {
    time: { selected: 0, type: 'index' },
    elevation: { selected: 0, type: 'index' }
  };
  private _tilingScheme!: Cesium.TilingScheme;
  private _coverageRectangle!: Cesium.Rectangle;
  private readonly _tileWidth: number;
  private readonly _tileHeight: number;
  private readonly _minimumLevel: number;
  private readonly _maximumLevel: number;
  private readonly _credit: Cesium.Credit;
  private _ready = false;
  private _readyPromise!: Promise<boolean>;

  private colorScale: { min: number; max: number; colors: number[][] };
  private zarrArray: any = null;
  private dimIndices: any = {};
  private store!: zarr.FetchStore;
  private root: any;
  private multiscaleLevels: number[] = [];
  private levelInfos: string[] = [];
  private levelCache = new Map();
  private levelMetadata: Map<number, { width: number; height: number }> = new Map();
  private xyLimits: XYLimits | null = null;
  private opacity: number = 1.0;
  private colormap: string;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private colorTexture: WebGLTexture | null = null;
  private static readonly concurrencyLimit = 4;
  private static activeRequests = 0;
  private static readonly queue: (() => void)[] = [];
  private abortControllers = new Map<string, AbortController>();
  private static supportsImageBitmap: boolean | null = null;

  constructor(options: LayerOptions) {
    this.url = options.url;
    this.variable = options.variable;
    this._tilingScheme = new Cesium.WebMercatorTilingScheme();
    this._coverageRectangle = this._tilingScheme.rectangle;
    this.crs = options.crs || null;
    this._tileWidth = options.tileWidth ?? 256;
    this._tileHeight = options.tileHeight ?? 256;
    this._minimumLevel = options.minimumLevel ?? 0;
    this._maximumLevel = options.maximumLevel ?? 8;
    this._credit = new Cesium.Credit('Zarr Data');
    this.dimensionNames = options.dimensionNames ?? {};
    this.dimensionValues = {};
    const [min, max] = options.scale ?? [-3, 3];
    this.colormap = options.colormap ?? 'viridis';
    const colors = options.colorScale ? options.colorScale : colormapBuilder(this.colormap);
    this.colorScale = { min, max, colors: colors as number[][] };
    this.selectors = options.selectors || {};

    this.initWebGL();
    this._readyPromise = this.initialize().then(ok => ((this._ready = ok), ok));
  }

  private async initialize(): Promise<boolean> {
    try {
      this.store = new zarr.FetchStore(this.url);
      this.root = zarr.root(this.store);

      const { zarrArray, multiscaleLevels, dimIndices, attrs } = await initZarrDataset(
        this.root,
        this.variable,
        this.dimensionNames,
        this.levelMetadata,
        this.levelInfos,
        this.levelCache
      );

      this.zarrArray = zarrArray;
      this.multiscaleLevels = multiscaleLevels;
      this.dimIndices = dimIndices;
      this.xyLimits = await getXYLimits(
        this.root,
        this.dimIndices,
        this.levelInfos,
        multiscaleLevels.length > 0
      );

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
      this._ready = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize Zarr provider:', err);
      return false;
    }
  }

  static async createLayer(options: LayerOptions & { alpha?: number }): Promise<ZarrImageryLayer> {
    const provider = new ZarrLayerProvider(options);
    const ready = await provider.readyPromise;
    if (!ready) throw new Error('Failed to initialize ZarrLayerProvider');

    const imageryLayer = new ZarrImageryLayer(provider);
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

  public updateColorScale(newScale: { min: number; max: number; colors: number[][] }) {
    this.colorScale = newScale;
    this.rebuildColorRamp();
  }

  public updateStyle({
    opacity,
    scale,
    colormap
  }: {
    opacity?: number;
    scale?: [number, number];
    colormap?: string;
  }): void {
    console.log('Updating style:', { opacity, scale, colormap });

    // If opacity or colormap changes, rebuild colors
    if (colormap || opacity !== undefined || scale !== undefined) {
      console.log('AAAAAAAAAAAA', this.colorScale);
      const [min, max] = scale ?? [this.colorScale.min, this.colorScale.max];
      this.opacity = opacity ?? this.opacity;
      this.colormap = colormap ?? this.colormap;
      const colors = colormapBuilder(this.colormap) as number[][];
      this.colorScale = { min, max, colors };
      console.log('BBBBBBBBB', this.colorScale);
      this.rebuildColorRamp();
    }
  }

  private rebuildColorRamp(): void {
    if (!this.gl) return;
    this.colorTexture = createColorRampTexture(this.gl, this.colorScale.colors, this.opacity);
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
    console.log('Updated color scale:', this.colorScale);

    this.rebuildColorRamp();

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
  }

  private async openLevelArray(levelIdx: number) {
    if (this.levelCache.has(levelIdx)) return this.levelCache.get(levelIdx);
    const levelPath = this.levelInfos[levelIdx];
    const levelRoot = await this.root.resolve(levelPath);
    const arrayLoc = this.variable ? await levelRoot.resolve(this.variable) : levelRoot;
    const arr = await zarr.open(arrayLoc, { kind: 'array' });
    this.levelCache.set(levelIdx, arr);
    if (this.levelCache.size > 3) {
      const firstKey = this.levelCache.keys().next().value;
      this.levelCache.delete(firstKey);
    }
    return arr;
  }

  private choosePyramidLevel(cesiumLevel: number): number {
    if (!this.multiscaleLevels || this.multiscaleLevels.length === 0) return 0;
    const maxCesium = this.maximumLevel;
    const normalized = cesiumLevel / maxCesium;
    const index = Math.floor(normalized * (this.multiscaleLevels.length - 1));
    return this.multiscaleLevels[index];
  }

  private prepareAbortController(key: string): AbortController {
    const prev = this.abortControllers.get(key);
    if (prev) prev.abort();
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  private async getArrayForLevel(level: number) {
    const multiscaleLevel = this.choosePyramidLevel(level);
    const currentArray = this.levelInfos.length
      ? await this.openLevelArray(multiscaleLevel)
      : this.zarrArray;

    const metadata = this.levelMetadata.get(multiscaleLevel);
    const dataHeight = metadata ? metadata.height : currentArray.shape[this.dimIndices.lat.index];
    const dataWidth = metadata ? metadata.width : currentArray.shape[this.dimIndices.lon.index];

    return { dataWidth, dataHeight, currentArray };
  }

  private computeTileUVs(tileRect: Cesium.Rectangle) {
    const rect = this._coverageRectangle;
    const toDeg = Cesium.Math.toDegrees;
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
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = this._tileWidth;
    emptyCanvas.height = this._tileHeight;
    return emptyCanvas;
  }

  async requestImage(
    x: number,
    y: number,
    level: number
  ): Promise<HTMLCanvasElement | ImageBitmap> {
    // console.log(`Loading tile: x=${x}, y=${y}, level=${level}`);
    const key = `${level}/${x}/${y}`;
    const controller = this.prepareAbortController(key);

    if (!this.ready || !this.zarrArray || !this.gl || !this.program) {
      await this.readyPromise;
      if (!this.gl || !this.program) return this.emptyCanvas();
    }

    try {
      const { dataWidth, dataHeight, currentArray } = await this.getArrayForLevel(level);
      const tileRect = this._tilingScheme.tileXYToRectangle(x, y, level);

      const { u0, u1, v0, v1 } = this.computeTileUVs(tileRect);

      const bounds = this.computePixelBounds(u0, u1, v0, v1, dataWidth, dataHeight);
      if (!bounds) return this.emptyCanvas();

      const { sliceArgs, dimensionValues } = await calculateSliceArgs(
        currentArray.shape,
        bounds,
        this.dimIndices,
        this.selectors,
        this.dimensionValues,
        this.root,
        this.levelInfos.length > 0 ? this.levelInfos[0] : null
      );
      this.dimensionValues = dimensionValues;
      const data = (await ZarrLayerProvider.throttle(() =>
        zarr.get(currentArray, sliceArgs)
      )) as any;

      if (controller.signal.aborted) return this.emptyCanvas();
      const flatData = new Float32Array(data.data.buffer);

      return this.renderWithWebGL(flatData, bounds.width, bounds.height);
    } catch (error) {
      console.error('Tile load error:', error, ' tile:', key);
      return this.emptyCanvas();
    } finally {
      this.abortControllers.delete(key);
    }
  }

  private async renderWithWebGL(
    data: Float32Array,
    width: number,
    height: number
  ): Promise<HTMLCanvasElement | ImageBitmap> {
    const gl = this.gl as WebGL2RenderingContext;
    if (!gl || !this.program) throw new Error('WebGL2 not initialized');

    const canvas = gl.canvas as HTMLCanvasElement;
    const dataTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, height, 0, gl.RED, gl.FLOAT, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.useProgram(this.program);
    gl.viewport(0, 0, this._tileWidth, this._tileHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_dataTexture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_colorRamp'), 1);

    gl.uniform1f(gl.getUniformLocation(this.program, 'u_min'), this.colorScale.min);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_max'), this.colorScale.max);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.deleteTexture(dataTexture);

    // const t0 = performance.now();

    if (await ZarrLayerProvider.checkImageBitmapSupport()) {
      try {
        const bitmap = await createImageBitmap(gl.canvas as HTMLCanvasElement, {
          imageOrientation: 'flipY',
          premultiplyAlpha: 'premultiply'
        });
        // console.log("Bitmap creation:", (performance.now() - t0).toFixed(2), "ms");
        return bitmap;
      } catch (err) {
        console.warn('ImageBitmap failed, falling back to canvas:', err);
        ZarrLayerProvider.supportsImageBitmap = false;
      }
    }
    const fallback = document.createElement('canvas');
    fallback.width = this._tileWidth;
    fallback.height = this._tileHeight;
    fallback.getContext('2d')!.drawImage(gl.canvas as HTMLCanvasElement, 0, 0);
    // console.log("Fallback creation:", (performance.now() - t0).toFixed(2), "ms");
    return fallback;
  }

  get hasAlphaChannel() {
    return true;
  }

  pickFeatures() {
    return undefined;
  }
  get tilingScheme() {
    return this._tilingScheme;
  }
  get rectangle() {
    return this._coverageRectangle;
  }
  get tileWidth() {
    return this._tileWidth;
  }
  get tileHeight() {
    return this._tileHeight;
  }
  get minimumLevel() {
    return this._minimumLevel;
  }
  get maximumLevel() {
    return this._maximumLevel;
  }
  get credit() {
    return this._credit;
  }
  get ready() {
    return this._ready;
  }
  get readyPromise() {
    return this._readyPromise;
  }
  getTileCredits(x: number, y: number, level: number): Cesium.Credit[] {
    return this._credit ? [this._credit] : [];
  }
}
