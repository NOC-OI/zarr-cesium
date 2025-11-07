import { Viewer } from 'cesium';
import { WindLayer, WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';
import {
  calculateSliceArgs,
  detectCRS,
  identifyDimensionIndices,
  initZarrDataset
} from './zarr-utils';
import { colorSchemes } from './color-table-input';
import {
  BoundsProps,
  ColorScaleProps,
  CRS,
  DimensionNamesProps,
  VelocityOptions,
  ZarrSelectorsProps
} from './types';
import { colormapBuilder } from './jsColormaps';

export class ZarrCubeVelocityProvider {
  public dimensionValues: { [key: string]: Float64Array | number[] } = {};
  public cubeDimensions: [number, number, number] | null = null;
  private viewer: Viewer;
  private layers: WindLayer[] = [];
  private flipElevation: boolean = false;
  private uUrl: string;
  private vUrl: string;
  private bounds: BoundsProps;
  private crs: CRS | null = null;
  private dimensionNames: DimensionNamesProps;
  private multiscaleLevel: number = 0;
  private selectors: { [key: string]: ZarrSelectorsProps };
  private maxElevation: number;
  private verticalExaggeration: number;
  private opacity: number;
  private sliceSpacing: number;
  private terrainActive: boolean;
  private levelInfos: string[] = [];
  private levelCache = new Map();
  private levelMetadata: Map<number, { width: number; height: number }> = new Map();
  private dimIndices: any = {};
  private colorScale: ColorScaleProps;
  private windOptions: Partial<WindLayerOptions>;

  constructor(viewer: Viewer, options: VelocityOptions) {
    this.viewer = viewer;
    this.uUrl = options.uUrl;
    this.vUrl = options.vUrl;
    this.bounds = options.bounds;
    this.crs = options.crs ?? null;
    this.dimensionNames = options.dimensionNames ?? {};
    this.multiscaleLevel = options.multiscaleLevel ?? 0;
    this.selectors = options.selectors ?? {};
    this.maxElevation = options.maxElevation ?? 50;
    this.verticalExaggeration = options.verticalExaggeration ?? 10000;
    this.opacity = options.opacity ?? 1;
    this.sliceSpacing = options.sliceSpacing ?? 5;
    this.terrainActive = options.terrainActive ?? false;
    const [min, max] = options.scale ?? [-3, 3];
    const colors = options.colormap
      ? colormapBuilder(options.colormap)
      : options.colorScale
        ? options.colorScale
        : colormapBuilder('viridis');
    this.colorScale = { min, max, colors };
    this.flipElevation = options.flipElevation ?? false;
    this.windOptions = options.windOptions ?? {};
  }

  private sanitizeArray(arr: Float32Array): Float32Array {
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) arr[i] = 0;
    }
    return arr;
  }

  private async loadZarrVariable(url: string, variable: string, maxElevation: number, bounds: any) {
    const store = new zarr.FetchStore(url);
    const root = zarr.root(store);

    const { zarrArray, dimIndices, attrs } = await initZarrDataset(
      root,
      variable,
      this.dimensionNames,
      this.levelMetadata,
      this.levelInfos,
      this.levelCache
    );

    this.crs = this.crs || (await detectCRS(attrs, zarrArray));

    const shape = zarrArray.shape;

    if (!dimIndices.elevation) {
      console.warn('No elevation dimension found in Zarr array.');
      return;
    }

    const height = shape[this.dimIndices.lat.index];
    const width = shape[this.dimIndices.lon.index];

    const elevation =
      maxElevation === -1
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
      root,
      this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
      true
    );

    this.dimensionValues = dimensionValues;

    const data = await zarr.get(zarrArray, sliceArgs);
    const arr = this.sanitizeArray(new Float32Array(data.data as any));

    return {
      array: arr,
      width: x[1] - x[0],
      height: y[1] - y[0],
      elevation: elevation,
      dimensionValues: dimensionValues
    };
  }

  async load(): Promise<void> {
    const [uoCube, voCube] = await Promise.all([
      this.loadZarrVariable(this.uUrl, 'uo', this.maxElevation, this.bounds),
      this.loadZarrVariable(this.vUrl, 'vo', this.maxElevation, this.bounds)
    ]);
    if (!uoCube || !voCube) {
      console.error('Failed to load U or V component data.');
      return;
    }

    const { width, height, elevation, dimensionValues } = uoCube;

    for (let d = 0; d < elevation; d += this.sliceSpacing) {
      const offset = d * width * height;
      const uoSlice = uoCube.array.subarray(offset, offset + width * height);
      const voSlice = voCube.array.subarray(offset, offset + width * height);

      const windData = {
        u: { array: uoSlice, min: -0.5, max: 0.5 },
        v: { array: voSlice, min: -0.5, max: 0.5 },
        width,
        height,
        unit: 'm s-1',
        bounds: this.bounds
      };

      const elevationValues =
        dimensionValues.elevationValues ?? Array.from({ length: elevation }, (_, i) => i);
      const maxElevationValue = Math.max(...(elevationValues as number[]));
      let currentElevationValue: number;
      if (this.flipElevation) {
        currentElevationValue = elevationValues[elevation - 1 - d];
      } else {
        currentElevationValue = elevationValues[d];
      }

      let altitude: number;
      if (this.terrainActive) {
        if (this.flipElevation) {
          altitude = -currentElevationValue * this.verticalExaggeration;
        } else {
          altitude = (maxElevationValue - currentElevationValue) * this.verticalExaggeration;
        }
      } else {
        if (this.flipElevation) {
          altitude = -currentElevationValue * this.verticalExaggeration;
        } else {
          altitude = (maxElevationValue - currentElevationValue) * this.verticalExaggeration;
        }
      }

      const options: Partial<WindLayerOptions> = {
        domain: { min: this.colorScale.min, max: this.colorScale.max },
        speedFactor: 12,
        lineWidth: { min: 1, max: 3 },
        lineLength: { min: 0, max: 400 },
        particleHeight: altitude,
        particlesTextureSize: 50,
        colors: colorSchemes.find(item => item.value === 'warm')?.colors.reverse(),
        useViewerBounds: true,
        dynamic: true,
        flipY: true
      };

      const layer = new WindLayer(this.viewer, windData, options);
      this.layers.push(layer);
    }

    console.log(`🌬️ Created ${this.layers.length} wind layers`);
  }

  destroy(): void {
    for (const layer of this.layers) {
      layer.remove();
    }
    this.layers = [];
    console.log('🧹 Destroyed all wind layers');
  }
}
