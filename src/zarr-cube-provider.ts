import * as zarr from 'zarrita';
import * as zarrNdarray from '@zarrita/ndarray';
import {
  calculateElevationSlice,
  calculateHeightMeters,
  calculateSliceArgs,
  calculateXYFromBounds,
  detectCRS,
  getCubeDimensions,
  initZarrDataset
} from './zarr-utils';
import {
  type BoundsProps,
  type ColorMapName,
  type ColorScaleProps,
  type CRS,
  type CubeOptions,
  type DimensionNamesProps,
  type DimIndicesProps,
  type ZarrLevelMetadata,
  type ZarrSelectorsProps
} from './types';
import { colormapBuilder } from './jsColormaps';
import { updateImgData } from './webgl-utils';
import {
  Viewer,
  Rectangle,
  Primitive,
  GeometryInstance,
  Material,
  MaterialAppearance,
  EllipsoidSurfaceAppearance,
  RectangleGeometry,
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
import {
  DEFAULT_COLORMAP,
  DEFAULT_OPACITY,
  DEFAULT_SCALE,
  DEFAULT_VERTICAL_EXAGGERATION,
  validateBounds
} from './cesium-utils';

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
  public dimensionValues: { [key: string]: Float64Array | number[] } = {};
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
  public bounds: BoundsProps;
  private viewer: Viewer;
  private zarrVersion: 2 | 3 | null = null;
  private flipElevation: boolean = false;
  private url: string;
  private variable: string;
  private crs: CRS | null = null;
  private dimensionNames: DimensionNamesProps;
  private verticalExaggeration: number;
  private opacity: number;
  private showHorizontalSlices: boolean;
  private showVerticalSlices: boolean;
  private belowSeaLevel: boolean;
  private volumeData: ndarray.NdArray<any> | null = null;
  private static readonly concurrencyLimit = 4;
  private static activeRequests = 0;
  private static readonly queue: (() => void)[] = [];

  private levelCache = new Map();
  private levelMetadata: Map<number, ZarrLevelMetadata> = new Map();
  private zarrArray: zarr.Array<any> | null = null;
  private dimIndices: DimIndicesProps = {};
  private store!: zarr.FetchStore;
  private root: zarr.Location<zarr.FetchStore> | null = null;
  private colorScale: ColorScaleProps;
  private colormap: ColorMapName;
  private horizontalPrimitives: Primitive | null = null;
  private verticalLonPrimitives: Primitive | null = null;
  private verticalLatPrimitives: Primitive | null = null;
  /**
   * Creates a new instance of {@link ZarrCubeProvider}.
   *
   * @param viewer - Cesium viewer instance to which primitives will be added.
   * @param options - Configuration for the cube visualization (see {@link CubeOptions}).
   */
  constructor(viewer: Viewer, options: CubeOptions) {
    this.viewer = viewer;
    this.url = options.url;
    this.variable = options.variable;
    this.bounds = options.bounds;
    this.dimensionNames = options.dimensionNames ?? {};
    this.crs = options.crs || null;
    this.multiscaleLevel = options.multiscaleLevel ?? 0;
    this.selectors = options.selectors ?? {};
    this.verticalExaggeration = options.verticalExaggeration ?? DEFAULT_VERTICAL_EXAGGERATION;
    this.opacity = options.opacity ?? DEFAULT_OPACITY;
    this.showHorizontalSlices = options.showHorizontalSlices ?? true;
    this.showVerticalSlices = options.showVerticalSlices ?? true;
    this.belowSeaLevel = options.belowSeaLevel ?? false;
    this.zarrVersion = options.zarrVersion ?? null;
    this.flipElevation = options.flipElevation ?? false;
    const [min, max] = options.scale ?? DEFAULT_SCALE;
    this.colormap = options.colormap ?? DEFAULT_COLORMAP;
    const colors = colormapBuilder(this.colormap);
    this.colorScale = { min, max, colors };
  }

  /**
   * Loads the Zarr dataset and initializes the cube data and metadata.
   *
   * @param force - If true, forces reloading of the dataset even if already loaded.
   * @returns A promise that resolves when the cube data is fully loaded.
   */
  async load(force: boolean = false): Promise<void> {
    this.store = new zarr.FetchStore(this.url);
    this.root = zarr.root(this.store);
    const { zarrArray, dimIndices, levelInfos, attrs, multiscaleLevel } = await initZarrDataset(
      this.store,
      this.root,
      this.variable,
      this.dimensionNames,
      this.levelMetadata,
      this.levelCache,
      this.zarrVersion,
      this.multiscaleLevel
    );
    if (multiscaleLevel !== undefined) {
      this.multiscaleLevel = multiscaleLevel;
    }
    this.zarrArray = zarrArray as zarr.Array<any>;
    this.dimIndices = dimIndices;
    this.levelInfos = levelInfos;

    this.crs = this.crs || (await detectCRS(attrs, zarrArray));

    const shape = this.zarrArray.shape;
    if (!this.dimIndices.elevation) {
      console.warn('No elevation dimension found in Zarr array.');
      return;
    }
    const height = shape[this.dimIndices.lat.index];
    const width = shape[this.dimIndices.lon.index];
    const { dimensionValuesWithElevation, elevationSlice } = await calculateElevationSlice(
      shape[this.dimIndices.elevation.index],
      dimIndices.elevation,
      this.selectors.elevation,
      this.dimensionValues,
      this.root,
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
      this.dimIndices,
      this.selectors,
      dimensionValuesWithElevation,
      this.root,
      this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
      this.zarrVersion,
      true
    );
    this.selectors = selectors;
    this.dimensionValues = dimensionValues;
    this.elevationShape = this.zarrArray.shape[this.dimIndices.elevation.index];

    const data = (await zarr.get(this.zarrArray, sliceArgs)) as ndarray.NdArray<any>;

    // const data = (await ZarrCubeProvider.throttle(() =>
    //   zarrNdarray.get(this.zarrArray!, sliceArgs)
    // )) as ndarray.NdArray<any>;

    this.volumeData = ndarray(data.data, data.shape, data.stride);

    this.cubeDimensions = [x[1] - x[0], y[1] - y[0], elevationSlice[1] - elevationSlice[0]];
    this.updateSlices({
      latIndex: 0,
      lonIndex: 0,
      elevationIndex: 0,
      force
    });
  }

  /**
   * Updates the rendered slices based on the provided indices.
   * @param options:
   * - latIndex: Latitude slice index.
   * - lonIndex: Longitude slice index.
   * - elevationIndex: Elevation slice index.
   * - force: Force re-render.
   * - belowSeaLevel: Toggle below-sea-level height model.
   */
  updateSlices({
    latIndex,
    lonIndex,
    elevationIndex,
    force = false,
    belowSeaLevel
  }: {
    latIndex?: number;
    lonIndex?: number;
    elevationIndex?: number;
    force?: boolean;
    belowSeaLevel?: boolean;
  }): void {
    if (belowSeaLevel !== undefined) {
      this.belowSeaLevel = belowSeaLevel;
      force = true;
    }
    if (!this.volumeData || !this.cubeDimensions) return;
    if (latIndex === undefined) latIndex = this.latSliceIndex;
    if (lonIndex === undefined) lonIndex = this.lonSliceIndex;
    if (elevationIndex === undefined) elevationIndex = this.elevationSliceIndex;
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
   * Updates the dimension selectors, multiscale level, and bounds.
   * @param options:
   *  - selectors - New selectors mapping. See {@link ZarrSelectorsProps}.
   *  - multiscaleLevel - Multiscale level to switch to.
   *  - bounds - Updated geographic bounds. See {@link BoundsProps}.
   */
  updateSelectors({
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
      this.load(true);
    }
  }

  /**
   * Updates style parameters.
   * @param options:
   *  - verticalExaggeration - Vertical exaggeration factor.
   *  - opacity - Opacity.
   *  - scale - [min,max] data scaling range.
   *  - colormap - Colormap name. See {@link ColorMapName}.
   */
  updateStyle({
    verticalExaggeration,
    opacity,
    scale,
    colormap
  }: {
    verticalExaggeration?: number;
    opacity?: number;
    scale?: [number, number];
    colormap?: ColorMapName;
  }): void {
    if (verticalExaggeration !== undefined) {
      this.verticalExaggeration = verticalExaggeration;
    }
    if (opacity !== undefined) {
      this.opacity = opacity;
    }
    if (scale !== undefined) {
      const [min, max] = scale;
      this.colorScale.min = min;
      this.colorScale.max = max;
    }
    if (colormap !== undefined) {
      const colors = colormapBuilder(colormap);
      this.colorScale.colors = colors;
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

    const rect = Rectangle.fromDegrees(
      this.bounds.west,
      this.bounds.south,
      this.bounds.east,
      this.bounds.north
    );
    return { viewer, nx, ny, nz, indicesOrder, strides, rect };
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
    const { viewer, nx, ny, nz, indicesOrder, strides, rect } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(nx, ny);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    const elevationSliceIndex = this.flipElevation
      ? nz - 1 - this.elevationSliceIndex
      : this.elevationSliceIndex;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const coord: Record<string, number> = {
          lon: x,
          lat: y,
          elevation: elevationSliceIndex
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
    const elevationValue = this.dimensionValues.elevation[elevationSliceIndex];
    const heightMeters = calculateHeightMeters(
      elevationValue,
      this.dimensionValues.elevation,
      this.verticalExaggeration,
      this.belowSeaLevel,
      this.flipElevation
    );

    const primitive = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new RectangleGeometry({
          rectangle: rect,
          height: heightMeters,
          vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT
        })
      }),
      appearance: new EllipsoidSurfaceAppearance({
        material: new Material({
          fabric: {
            type: 'Image',
            uniforms: {
              image: canvas
            }
          }
        }),
        aboveGround: false
      }),
      asynchronous: false
    });

    viewer.scene.primitives.add(primitive);

    this.horizontalPrimitives = primitive;
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

    const bounds = this.bounds;

    const slice =
      sliceType === 'lon'
        ? bounds.north - fraction * (bounds.north - bounds.south)
        : bounds.west + fraction * (bounds.east - bounds.west);

    const positions = [];
    const sts = [];
    const indices = [];

    const segments = sliceType === 'lon' ? nx - 1 : ny - 1;
    const segmentsZ = nz - 1;

    for (let iz = 0; iz <= segmentsZ; iz++) {
      const heightFraction = this.flipElevation ? (segmentsZ - iz) / segmentsZ : iz / segmentsZ;
      const elevationValue = this.dimensionValues.elevation[iz];
      const height = calculateHeightMeters(
        elevationValue,
        this.dimensionValues.elevation,
        this.verticalExaggeration,
        this.belowSeaLevel,
        this.flipElevation
      );

      for (let iN = 0; iN <= segments; iN++) {
        const otherFraction = iN / segments;
        const latOrlon =
          sliceType === 'lon'
            ? bounds.west + otherFraction * (bounds.east - bounds.west)
            : bounds.south + otherFraction * (bounds.north - bounds.south);

        const cart =
          sliceType === 'lon'
            ? Cartesian3.fromDegrees(latOrlon, slice, height)
            : Cartesian3.fromDegrees(slice, latOrlon, height);
        positions.push(cart.x, cart.y, cart.z);
        if (sliceType === 'lon') {
          sts.push(otherFraction, heightFraction);
        } else {
          sts.push(1 - otherFraction, heightFraction);
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
          lat: y,
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
   */
  clear(): void {
    this.viewer.scene.primitives.remove(this.verticalLonPrimitives);
    this.verticalLonPrimitives = null;
    this.viewer.scene.primitives.remove(this.verticalLatPrimitives);
    this.verticalLatPrimitives = null;
    this.viewer.scene.primitives.remove(this.horizontalPrimitives);
    this.horizontalPrimitives = null;
  }

  /**
   * Destroys all allocated Cesium primitives and clears resources.
   */
  destroy(): void {
    this.clear();
  }
}
