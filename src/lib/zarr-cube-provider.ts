import * as Cesium from 'cesium';
import * as zarr from 'zarrita';
import { calculateSliceArgs, detectCRS, initZarrDataset } from './zarr-utils';
import {
  BoundsProps,
  ColorMapName,
  ColorScaleProps,
  CRS,
  CubeOptions,
  DimensionNamesProps,
  ZarrSelectorsProps
} from './types';
import { colormapBuilder } from './jsColormaps';
import { updateImgData } from './webgl-utils';

export class ZarrCubeProvider {
  public dimensionValues: { [key: string]: Float64Array | number[] } = {};
  public cubeDimensions: [number, number, number] | null = null;
  private viewer: Cesium.Viewer;
  private flipElevation: boolean = false;
  private url: string;
  private variable: string;
  private bounds: BoundsProps;
  private crs: CRS | null = null;
  private dimensionNames: DimensionNamesProps;
  private multiscaleLevel: number = 0;
  private selectors: { [key: string]: ZarrSelectorsProps };
  private maxElevation: number;
  private verticalExaggeration: number;
  private opacity: number;
  private sliceSpacing: number;
  private showHorizontalSlices: boolean;
  private showVerticalSlices: boolean;
  private belowSeaLevel: boolean;
  private volumeData: Float32Array | null = null;
  private latSliceIndex: number = -1;
  private lonSliceIndex: number = -1;
  private elevationSliceIndex: number = -1;
  private levelInfos: string[] = [];
  private levelCache = new Map();
  private levelMetadata: Map<number, { width: number; height: number }> = new Map();
  private zarrArray: any = null;
  private dimIndices: any = {};
  private store!: zarr.FetchStore;
  private root: any;
  private colorScale: ColorScaleProps;
  private horizontalPrimitives: Cesium.Primitive | null = null;
  private verticalLonPrimitives: Cesium.Primitive | null = null;
  private verticalLatPrimitives: Cesium.Primitive | null = null;
  constructor(viewer: Cesium.Viewer, options: CubeOptions) {
    this.viewer = viewer;
    this.url = options.url;
    this.variable = options.variable;
    this.bounds = options.bounds;
    this.dimensionNames = options.dimensionNames ?? {};
    this.crs = options.crs || null;
    this.multiscaleLevel = options.multiscaleLevel ?? 0;
    this.selectors = options.selectors ?? {};
    this.maxElevation = options.maxElevation ?? -1;
    this.verticalExaggeration = options.verticalExaggeration ?? 100;
    this.opacity = options.opacity ?? 1;
    this.sliceSpacing = options.sliceSpacing ?? 1;
    this.showHorizontalSlices = options.showHorizontalSlices ?? true;
    this.showVerticalSlices = options.showVerticalSlices ?? true;
    this.belowSeaLevel = options.belowSeaLevel ?? false;
    this.flipElevation = options.flipElevation ?? false;
    const [min, max] = options.scale ?? [-3, 3];
    const colors = options.colormap
      ? colormapBuilder(options.colormap)
      : options.colorScale
        ? options.colorScale
        : colormapBuilder('viridis');
    this.colorScale = { min, max, colors };
  }

  async load(): Promise<void> {
    this.store = new zarr.FetchStore(this.url);
    this.root = zarr.root(this.store);

    const { zarrArray, dimIndices, levelInfos, attrs } = await initZarrDataset(
      this.root,
      this.variable,
      this.dimensionNames,
      this.levelMetadata,
      this.levelCache
    );
    this.zarrArray = zarrArray;
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
    const elevation =
      this.maxElevation === -1
        ? shape[this.dimIndices.elevation.index]
        : Math.min(this.maxElevation, shape[this.dimIndices.elevation.index]);
    const x = [
      Math.floor(((this.bounds.west + 180) / 360) * width),
      Math.floor(((this.bounds.east + 180) / 360) * width)
    ];
    const y = [
      Math.floor(((90 - this.bounds.north) / 180) * height),
      Math.floor(((90 - this.bounds.south) / 180) * height)
    ];
    const { sliceArgs, dimensionValues } = await calculateSliceArgs(
      shape,
      {
        startX: x[0],
        endX: x[1],
        startY: y[0],
        endY: y[1],
        startElevation: 0,
        endElevation: elevation
      },
      this.dimIndices,
      this.selectors,
      this.dimensionValues,
      this.root,
      this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
      true
    );

    this.dimensionValues = dimensionValues;

    const data = await zarr.get(this.zarrArray, sliceArgs);
    this.volumeData = data.data as Float32Array;
    this.cubeDimensions = [x[1] - x[0], y[1] - y[0], elevation];
  }

  updateSlices({
    latIndex,
    lonIndex,
    elevationIndex,
    force = false
  }: {
    latIndex: number;
    lonIndex: number;
    elevationIndex: number;
    force?: boolean;
  }): void {
    if (!this.volumeData || !this.cubeDimensions) return;
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

  private getSliceParameters() {
    const viewer = this.viewer;
    const [nx, ny, nz] = this.cubeDimensions as [number, number, number];
    const rect = Cesium.Rectangle.fromDegrees(
      this.bounds.west,
      this.bounds.south,
      this.bounds.east,
      this.bounds.north
    );
    return { viewer, nx, ny, nz, rect };
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
      const removed = this.viewer.scene.primitives.remove(this.horizontalPrimitives);
      this.horizontalPrimitives = null;
    }
    this.elevationSliceIndex = elevationIndex;
    const { viewer, nx, ny, nz, rect } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(nx, ny);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    let localElevationSliceIndex;
    if (this.flipElevation) {
      localElevationSliceIndex = nz - 1 - this.elevationSliceIndex;
    } else {
      localElevationSliceIndex = this.elevationSliceIndex;
    }
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const idx = localElevationSliceIndex * nx * ny + y * nx + x;
        const value = this.volumeData[idx];
        const pixelIdx = (y * nx + x) * 4;
        imgData = updateImgData(value, pixelIdx, imgData, this.colorScale, this.opacity);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const elevationValue = this.dimensionValues.elevation
      ? this.dimensionValues.elevation[
          this.dimensionValues.elevation.length - 1 - this.elevationSliceIndex
        ]
      : this.elevationSliceIndex * this.sliceSpacing;

    const maxElevationValue = this.dimensionValues.elevation
      ? Math.max(...(this.dimensionValues.elevation as number[]))
      : 0;

    let heightMeters: number;
    if (this.belowSeaLevel) {
      heightMeters = -elevationValue * this.verticalExaggeration;
    } else {
      heightMeters = (maxElevationValue - elevationValue) * this.verticalExaggeration;
    }

    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rect,
          height: heightMeters,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
        })
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
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
      const heightFraction = iz / segmentsZ;
      const elevationValue = this.dimensionValues.elevation
        ? this.dimensionValues.elevation[this.dimensionValues.elevation.length - 1 - iz]
        : iz * this.sliceSpacing;
      const maxElevation = this.dimensionValues.elevation
        ? Math.max(...(this.dimensionValues.elevation as number[]))
        : 0;
      let height: number;
      if (this.belowSeaLevel) {
        height = -elevationValue * this.verticalExaggeration;
      } else {
        height = (maxElevation - elevationValue) * this.verticalExaggeration;
      }
      for (let iN = 0; iN <= segments; iN++) {
        const otherFraction = iN / segments;
        const latOrlon =
          sliceType === 'lon'
            ? bounds.west + otherFraction * (bounds.east - bounds.west)
            : bounds.south + otherFraction * (bounds.north - bounds.south);

        const cart =
          sliceType === 'lon'
            ? Cesium.Cartesian3.fromDegrees(latOrlon, slice, height)
            : Cesium.Cartesian3.fromDegrees(slice, latOrlon, height);
        positions.push(cart.x, cart.y, cart.z);
        if (sliceType === 'lon') {
          sts.push(otherFraction, 1 - heightFraction);
        } else {
          sts.push(1 - otherFraction, 1 - heightFraction);
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

    const geometry = new Cesium.Geometry({
      attributes: {
        position: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: new Float64Array(positions)
        }),
        st: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(sts)
        })
      } as Cesium.GeometryAttributes,
      indices: new Uint16Array(indices),
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      boundingSphere: Cesium.BoundingSphere.fromVertices(new Float64Array(positions) as any)
    });

    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry
      }),
      appearance: new Cesium.MaterialAppearance({
        material: new Cesium.Material({
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
    const { viewer, nx, ny, nz, rect } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(nx, nz);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    for (let z = 0; z < nz; z++) {
      for (let x = 0; x < nx; x++) {
        const idx = z * (ny * nx) + this.latSliceIndex * nx + x;
        const value = this.volumeData[idx];
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
    const { viewer, nx, ny, nz, rect } = this.getSliceParameters();
    const outputCanvas = this.createCanvas(ny, nz);
    const { canvas, ctx } = outputCanvas;
    let imgData = outputCanvas.imgData;
    for (let z = 0; z < nz; z++) {
      for (let y = 0; y < ny; y++) {
        const idx = z * nx * ny + y * nx + this.lonSliceIndex;
        const value = this.volumeData[idx];
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

  clear(): void {
    this.viewer.scene.primitives.remove(this.verticalLonPrimitives);
    this.verticalLonPrimitives = null;
    this.viewer.scene.primitives.remove(this.verticalLatPrimitives);
    this.verticalLatPrimitives = null;
    this.viewer.scene.primitives.remove(this.horizontalPrimitives);
    this.horizontalPrimitives = null;
  }

  destroy(): void {
    this.clear();
  }
}
