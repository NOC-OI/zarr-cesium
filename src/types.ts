import type { CesiumWidget, Viewer } from 'cesium';
import type { WindLayerOptions } from 'cesium-wind-layer';
import type ndarray from 'ndarray';
import type {
  BoundsProps,
  CRS,
  DimensionNamesProps,
  DimensionValues,
  MultiscaleFormat,
  ZarrSelectorsProps
} from 'zarr-maps-tiling';
import type { ColorMapName } from 'zarr-maps-colormap';
import type { OnAuthError, RequestOverrides, TransformRequest } from 'zarr-maps-tiling';
import type * as zarr from 'zarrita';

export type {
  BoundsProps,
  BrowserName,
  CalendarDate,
  CFCalendar,
  CRS,
  DataSliceProps,
  DimIndicesProps,
  DimensionNamesProps,
  DimensionValues,
  MultiscaleFormat,
  SliceArgs,
  XYLimits,
  XYLimitsProps,
  ZarrLevelMetadata,
  ZarrSelectors,
  ZarrSelectorsProps
} from 'zarr-maps-tiling';
export type { ColorMapInfo, ColorMapName, ColorScaleProps } from 'zarr-maps-colormap';

export type CesiumHost = Viewer | CesiumWidget;

export interface CubeOptions {
  /** URL to a Zarr store. Required unless `store` is provided. */
  url?: string;
  /** Custom Zarrita-compatible store, including an IcechunkStore. */
  store?: zarr.Readable;
  variable: string;
  bounds: BoundsProps;
  crs?: CRS | null;
  /** Whether latitude coordinate values increase with their array index. */
  latIsAscending?: boolean;
  verticalExaggeration?: number;
  opacity?: number;
  showHorizontalSlices?: boolean;
  showVerticalSlices?: boolean;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: Record<string, ZarrSelectorsProps>;
  colorScale?: [number, number, number][];
  multiscaleLevel?: number;
  zarrVersion?: 2 | 3;
  flipElevation?: boolean;
  scale?: [number, number];
  colormap?: ColorMapName;
  multiscaleFormat?: MultiscaleFormat;
  /** Static fetch options for URL-backed stores. */
  requestOverrides?: RequestOverrides;
  /** Dynamically transform requests for authentication, proxies, or signed URLs. */
  transformRequest?: TransformRequest;
  /** Called once when a transformed request returns HTTP 400 or 401. */
  onAuthError?: OnAuthError;
}

export interface LayerOptions {
  /** URL to a Zarr store. Required unless `store` is provided. */
  url?: string;
  /** Custom Zarrita-compatible store, including an IcechunkStore. */
  store?: zarr.Readable;
  variable: string;
  crs?: CRS | null;
  latIsAscending?: boolean;
  tileWidth?: number;
  tileHeight?: number;
  minimumLevel?: number;
  maximumLevel?: number;
  scale?: [number, number];
  opacity?: number;
  colormap?: ColorMapName;
  colorScale?: [number, number, number][];
  selectors?: Record<string, ZarrSelectorsProps>;
  zarrVersion?: 2 | 3;
  dimensionNames?: DimensionNamesProps;
  noDataMin?: number;
  noDataMax?: number;
  requestOverrides?: RequestOverrides;
  transformRequest?: TransformRequest;
  onAuthError?: OnAuthError;
  multiscaleFormat?: MultiscaleFormat;
}

export interface VelocityOptions {
  /** URLs for the U and V stores. Each may be omitted when its custom store is supplied. */
  urls?: { u?: string; v?: string };
  /** Custom Zarrita-compatible stores for U and V, including IcechunkStore instances. */
  stores?: { u?: zarr.Readable; v?: zarr.Readable };
  variables: { u: string; v: string };
  bounds: BoundsProps;
  /** Whether latitude coordinate values increase with their array index. */
  latIsAscending?: boolean;
  verticalExaggeration?: number;
  flipElevation?: boolean;
  sliceSpacing?: number;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: Record<string, ZarrSelectorsProps>;
  multiscaleLevel?: number;
  opacity?: number;
  crs?: CRS | null;
  scale?: [number, number];
  colormap?: ColorMapName;
  zarrVersion?: 2 | 3;
  /** Particle styling; height is derived from the selected Zarr elevation. */
  windOptions?: VelocityWindOptions;
  multiscaleFormat?: MultiscaleFormat;
  /** Static fetch options shared by URL-backed U and V stores. */
  requestOverrides?: RequestOverrides;
  /** Dynamically transform U and V requests for authentication, proxies, or signed URLs. */
  transformRequest?: TransformRequest;
  /** Called once when a transformed request returns HTTP 400 or 401. */
  onAuthError?: OnAuthError;
}

export type VelocityWindOptions = Omit<Partial<WindLayerOptions>, 'particleHeight'>;

export interface CubeVelocityProps {
  array: ndarray.NdArray<any>;
  width: number;
  height: number;
  elevation: number;
  dimensionValues: DimensionValues;
}
