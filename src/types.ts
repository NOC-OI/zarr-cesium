/**
 * @module types
 *
 * Type and interface definitions for Zarr-based Cesium visualization components.
 *
 * @remarks
 * This module defines the core data structures used throughout the package,
 * including dataset selectors, cube and layer configuration options,
 * CRS types, and color scale specifications.
 *
 * These types are shared between:
 * - Zarr cube and velocity providers
 * - WebGL colormap utilities
 * - Cesium integration layers
 */

import { allColorScales } from './jsColormaps';
import { type WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';
import ndarray from 'ndarray';

/* -------------------------------------------------------------------------- */
/*                             BASIC DATA STRUCTURES                          */
/* -------------------------------------------------------------------------- */

// Selector value can be a single number/string or an array of numbers/strings.
export type SelectorValue = number | number[] | string | string[];

// Selector specification with optional type ('index' or 'value').
export interface SelectorSpec {
  selected: SelectorValue;
  type?: 'index' | 'value';
}

// Public shape for callers: full selector object (per-dimension value or spec).
export type Selectors = Record<string, SelectorValue | SelectorSpec>;

// Internal normalized form (object per dimension).
export type NormalizedSelectors = Record<string, SelectorSpec>;

/**
 * Describes the XY coordinate boundaries of a dataset.
 */
export interface XYLimits {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * Metadata for a single multiscale level in a Zarr dataset.
 */
export interface ZarrLevelMetadata {
  width: number;
  height: number;
}

/* -------------------------------------------------------------------------- */
/*                            DIMENSION DEFINITIONS                           */
/* -------------------------------------------------------------------------- */

/**
 * Mapping of dimension names to their corresponding coordinate arrays.
 */
export interface DimensionValues {
  [key: string]: Float64Array | number[] | string[];
}

/**
 * Describes the mapping between dataset dimensions and their standardized names.
 */
export interface DimensionNamesProps {
  time?: string;
  elevation?: string;
  lat?: string;
  lon?: string;
  others?: string[];
}

/**
 * Maps dimension keys to their indices and associated coordinate arrays.
 */
export interface DimIndicesProps {
  [key: string]: { name: string; index: number; array: zarr.Array<any> | null };
}

/**
 * Metadata for an untiled Zarr multiscale level.
 */
export interface UntiledLevel {
  asset: string;
  scale: [number, number];
  translation: [number, number];
  shape?: number[];
  chunks?: number[];
  scaleFactor?: number;
  addOffset?: number;
  fillValue?: number | null;
  dtype?: string | null;
}

export interface CustomShaderConfig {
  bands: string[];
  customFrag?: string;
  customUniforms?: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/*                            VISUALIZATION OPTIONS                           */
/* -------------------------------------------------------------------------- */

/**
 * Configuration for a 3D cube visualization (volumetric rendering).
 */
export interface CubeOptions {
  id?: string;
  source: string;
  variable: string;
  bounds: { west: number; south: number; east: number; north: number };
  crs?: CRS | null;
  verticalExaggeration?: number;
  opacity?: number;
  showHorizontalSlices?: boolean;
  showVerticalSlices?: boolean;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: Selectors;
  colorScale?: [number, number, number][];
  multiscaleLevel?: number;
  zarrVersion?: 2 | 3;
  flipElevation?: boolean;
  clim?: [number, number];
  colormap?: ColorMapName;
}

/**
 * Configuration for a 2D raster (image) layer visualization.
 */
export interface LayerOptions {
  id?: string;
  source: string;
  variable: string;
  selectors?: Selectors;
  colorScale?: [number, number, number][];
  colormap?: ColorMapName;
  clim?: [number, number];
  opacity?: number;
  tileWidth?: number;
  tileHeight?: number;
  minimumLevel?: number;
  maximumLevel?: number;
  zarrVersion?: 2 | 3;
  dimensionNames?: DimensionNamesProps;
  bounds?: BoundsProps;
  latIsAscending?: boolean | null;
  noDataMin?: number;
  noDataMax?: number;
  customFrag?: string;
  uniforms?: Record<string, number>;
  onLoadingStateChange?: LoadingStateCallback;
  throttleMs?: number;
  proj4?: string;
  crs?: CRS | null;
}

/**
 * Represents the loading state of a dataset or layer.
 */
export interface LoadingState {
  loading: boolean;
  metadata: boolean;
  chunks: boolean;
  error?: Error | null;
}

/**
 * Loading State Callback type definition.
 */
export type LoadingStateCallback = (state: LoadingState) => void;

/**
 * Configuration for a vector (velocity) visualization layer.
 */
export interface VelocityOptions {
  id?: string;
  sources: { u: string; v: string };
  variables: { u: string; v: string };
  bounds: BoundsProps;
  verticalExaggeration?: number;
  flipElevation?: boolean;
  sliceSpacing?: number;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: Selectors;
  multiscaleLevel?: number;
  opacity?: number;
  crs?: CRS | null;
  clim?: [number, number];
  colormap?: ColorMapName;
  zarrVersion?: 2 | 3;
  windOptions?: Partial<WindLayerOptions>;
}

/**
 * Geographic bounding box definition (degrees).
 */
export interface BoundsProps {
  west: number;
  south: number;
  east: number;
  north: number;
}

/**
 * Supported Coordinate Reference Systems.
 */
export type CRS = 'EPSG:4326' | 'EPSG:3857';

/**
 * Describes a slice of a multidimensional array.
 */
export interface DataSliceProps {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  startElevation?: number;
  endElevation?: number;
}

/**
 * Represents a multidimensional slice argument for Zarr array indexing.
 */
export type SliceArgs = (number | zarr.Slice)[];

/**
 * Describes a numerical-to-color mapping for visualizing scalar fields.
 */
export interface ColorScaleProps {
  min: number;
  max: number;
  colors: number[][] | string[];
}

/**
 * Type representing valid color map names. The values are derived from the
 * `allColorScales` array imported from the `jsColormaps` module and are based on matplotlib colormap (https://matplotlib.org/stable/users/explain/colors/colormaps.html).
 *
 * The jsColormaps module was adapted from the jsColormaps project (https://github.com/timothygebhard/js-colormaps) which provides JavaScript implementations of various colormaps.
 *
 * This is the list of supported colormaps for visualizations: 'Accent','Accent_r',
 * 'Blues','Blues_r','BrBG','BrBG_r','BuGn','BuGn_r','BuPu','BuPu_r','CMRmap',
 * 'CMRmap_r','Dark2','Dark2_r','GnBu','GnBu_r','Greens','Greens_r','Greys',
 * 'Greys_r','OrRd','OrRd_r','Oranges','Oranges_r','PRGn','PRGn_r','Paired',
 * 'Paired_r','Pastel1','Pastel1_r','Pastel2','Pastel2_r','PiYG','PiYG_r','PuBu',
 * 'PuBuGn','PuBuGn_r','PuBu_r','PuOr','PuOr_r','PuRd','PuRd_r','Purples','Purples_r',
 * 'RdBu','RdBu_r','RdGy','RdGy_r','RdPu','RdPu_r','RdYlBu','RdYlBu_r','RdYlGn',
 * 'RdYlGn_r','Reds','Reds_r','Set1','Set1_r','Set2','Set2_r','Set3','Set3_r',
 * 'Spectral','Spectral_r','Wistia','Wistia_r','YlGn','YlGnBu','YlGnBu_r','YlGn_r',
 * 'YlOrBr','YlOrBr_r','YlOrRd','YlOrRd_r','afmhot','afmhot_r','autumn','autumn_r',
 * 'binary','binary_r','bone','bone_r','brg','brg_r','bwr','bwr_r','cividis','cividis_r',
 * 'cool','cool_r','coolwarm','coolwarm_r','copper','copper_r','cubehelix','cubehelix_r',
 * 'flag','flag_r','gist_earth','gist_earth_r','gist_gray','gist_gray_r','gist_heat',
 * 'gist_heat_r','gist_ncar','gist_ncar_r','gist_rainbow','gist_rainbow_r','gist_stern',
 * 'gist_stern_r','gist_yarg','gist_yarg_r','gnuplot','gnuplot2','gnuplot2_r','gnuplot_r',
 * 'gray','gray_r','hot','hot_r','hsv','hsv_r','inferno','inferno_r','jet','jet_r','magma',
 * 'magma_r','nipy_spectral','nipy_spectral_r','ocean','ocean_r','pink','pink_r','plasma',
 * 'plasma_r','prism','prism_r','rainbow','rainbow_r','seismic','seismic_r','spring',
 * 'spring_r','summer','summer_r','tab10','tab10_r','tab20','tab20_r','tab20b','tab20b_r',
 * 'tab20c','tab20c_r','terrain','terrain_r','twilight','twilight_r','viridis','viridis_r',
 * 'winter','winter_r'
 */
export type ColorMapName = (typeof allColorScales)[number];

/**
 * Structure of the global color map registry.
 */
export interface ColorMapInfo {
  [key: string]: { interpolate: boolean; colors: number[][] };
}

/**
 * Represents the in-memory structure of a velocity field slice.
 */
export interface CubeVelocityProps {
  array: ndarray.NdArray<any>;
  width: number;
  height: number;
  elevation: number;
  dimensionValues: DimensionValues;
}

/**
 * Supported browser names for compatibility checks.
 */
export type BrowserName = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

/**
 * Represents a date in a calendar system.
 */
export type CalendarDate = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  microsecond: number;
};

/**
 * Supported CF calendar types.
 */
export type CFCalendar =
  | 'standard'
  | 'gregorian'
  | 'proleptic_gregorian'
  | 'julian'
  | 'noleap'
  | '365_day'
  | 'all_leap'
  | '366_day'
  | '360_day';
