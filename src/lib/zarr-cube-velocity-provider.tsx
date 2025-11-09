import { Viewer } from 'cesium';
import { WindLayer, WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';
import { calculateSliceArgs, detectCRS, initZarrDataset } from './zarr-utils';
import {
  BoundsProps,
  ColorMapName,
  ColorScaleProps,
  CRS,
  CubeVelocityProps,
  DimensionNamesProps,
  VelocityOptions,
  ZarrSelectorsProps
} from './types';
import { colormapBuilder } from './jsColormaps';

const defaultWindOptions: Partial<WindLayerOptions> = {
  speedFactor: 12,
  lineWidth: { min: 1, max: 3 },
  lineLength: { min: 0, max: 400 },
  particlesTextureSize: 50,
  useViewerBounds: true,
  dynamic: true,
  flipY: true
};

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
  private belowSeaLevel: boolean;
  private volumeData: { uCube: CubeVelocityProps; vCube: CubeVelocityProps } | null = null;
  private levelInfos: string[] = [];
  private levelCache = new Map();
  private levelMetadata: Map<number, { width: number; height: number }> = new Map();
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
    this.sliceSpacing = options.sliceSpacing ?? 1;
    this.belowSeaLevel = options.belowSeaLevel ?? false;
    const [min, max] = options.scale ?? [-3, 3];
    const colors = options.colormap
      ? colormapBuilder(options.colormap, 'css', 255, this.opacity)
      : options.colorScale
        ? options.colorScale
        : colormapBuilder('viridis', 'css', 255, this.opacity);
    this.colorScale = { min, max, colors };
    this.flipElevation = options.flipElevation ?? false;
    this.windOptions = {
      ...defaultWindOptions,
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

  private async loadZarrVariable(
    url: string,
    variable: string,
    maxElevation: number
  ): Promise<CubeVelocityProps | null> {
    const store = new zarr.FetchStore(url);
    const root = zarr.root(store);

    const { zarrArray, dimIndices, levelInfos, attrs } = await initZarrDataset(
      root,
      variable,
      this.dimensionNames,
      this.levelMetadata,
      this.levelCache
    );

    this.levelInfos = levelInfos;

    this.crs = this.crs || (await detectCRS(attrs, zarrArray));

    const shape = zarrArray.shape;

    if (!dimIndices.elevation) {
      console.warn('No elevation dimension found in Zarr array.');
      return null;
    }

    const height = shape[dimIndices.lat.index];
    const width = shape[dimIndices.lon.index];

    const elevation =
      maxElevation === -1
        ? shape[dimIndices.elevation.index]
        : Math.min(this.maxElevation, shape[dimIndices.elevation.index]);
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
      dimIndices,
      this.selectors,
      this.dimensionValues,
      root,
      this.levelInfos.length > 0 ? this.levelInfos[this.multiscaleLevel] : null,
      true
    );

    this.dimensionValues = dimensionValues;

    const data = await zarr.get(zarrArray, sliceArgs);
    const arr = this.sanitizeArray(new Float32Array(data.data as ArrayLike<number>));

    return {
      array: arr,
      width: x[1] - x[0],
      height: y[1] - y[0],
      elevation: elevation,
      dimensionValues: dimensionValues
    };
  }

  async load(): Promise<void> {
    const [uCube, vCube] = await Promise.all([
      this.loadZarrVariable(this.uUrl, 'uo', this.maxElevation),
      this.loadZarrVariable(this.vUrl, 'vo', this.maxElevation)
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
    const { width, height, elevation, dimensionValues } = uCube;

    for (let d = 0; d < elevation; d += this.sliceSpacing) {
      const offset = d * width * height;
      const uoSlice = uCube.array.subarray(offset, offset + width * height);
      const voSlice = vCube.array.subarray(offset, offset + width * height);

      const windData = {
        u: { array: uoSlice, min: -0.5, max: 0.5 },
        v: { array: voSlice, min: -0.5, max: 0.5 },
        width,
        height,
        unit: 'm s-1',
        bounds: this.bounds
      };

      const elevationValues =
        dimensionValues.elevation ?? Array.from({ length: elevation }, (_, i) => i);
      const maxElevationValue = Math.max(...(elevationValues as number[]));
      let currentElevationValue: number;
      if (this.flipElevation) {
        currentElevationValue = elevationValues[elevation - 1 - d];
      } else {
        currentElevationValue = elevationValues[d];
      }

      let altitude: number;
      if (this.belowSeaLevel) {
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

      const layerOptions = {
        ...this.windOptions,
        particleHeight: altitude
      };

      const layer = new WindLayer(this.viewer, windData, layerOptions);
      this.layers.push(layer);
    }
  }
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
    }
    if (scale !== undefined) {
      const [min, max] = scale;
      this.colorScale.min = min;
      this.colorScale.max = max;
    }
    if (colormap !== undefined) {
      const colors = colormapBuilder(colormap, 'css', 255, this.opacity);
      this.colorScale.colors = colors;
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

  destroy(): void {
    for (const layer of this.layers) {
      layer.remove();
    }
    this.layers = [];
  }
}
