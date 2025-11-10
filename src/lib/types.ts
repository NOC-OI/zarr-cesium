import { type Viewer, type Rectangle } from 'cesium';
import { allColorScales } from './jsColormaps';
import { WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';

export interface ZarrSelectorsProps {
  selected: number | string;
  type?: 'index' | 'value';
}

export interface XYLimits {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ZarrLevelMetadata {
  width: number;
  height: number;
}

export interface ZarrCesiumLayerProps {
  viewerRef: React.MutableRefObject<Viewer | null>;
  url: string;
  options: {
    variable: string;
    opacity: number;
    scale?: [number, number];
    colormap?: string;
    colorScale?: number[][];
    dimensions?: { [key: string]: ZarrSelectorsProps };
  };
}

export interface ZarrCesiumCubeLayerProviderProps {
  viewerRef: React.MutableRefObject<Viewer | null>;
  url: string;
  variable: string;
  bounds: { west: number; south: number; east: number; north: number };
  maxElevation?: number;
  verticalExaggeration?: number;
  sliceSpacing?: number;
  opacity?: number;
  showHorizontalSlices?: boolean;
  showVerticalSlices?: boolean;
  belowSeaLevel?: boolean;
}

export interface DimensionValues {
  [key: string]: Float64Array | number[];
}

export interface DimensionNamesProps {
  time?: string;
  elevation?: string;
  lat?: string;
  lon?: string;
  others?: string[];
}

export interface CubeOptions {
  url: string;
  variable: string;
  bounds: { west: number; south: number; east: number; north: number };
  maxElevation?: number;
  crs?: CRS | null;
  verticalExaggeration?: number;
  opacity?: number;
  sliceSpacing?: number;
  showHorizontalSlices?: boolean;
  showVerticalSlices?: boolean;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: { [key: string]: ZarrSelectorsProps };
  colorScale?: [number, number, number][];
  multiscaleLevel?: number;
  flipElevation?: boolean;
  scale?: [number, number];
  colormap?: ColorMapName;
}

export interface LayerOptions {
  url: string;
  variable: string;
  crs?: CRS | null;
  tileWidth?: number;
  tileHeight?: number;
  minimumLevel?: number;
  maximumLevel?: number;
  scale?: [number, number];
  opacity?: number;
  colormap?: ColorMapName;
  colorScale?: [number, number, number][];
  selectors?: { [key: string]: ZarrSelectorsProps };
  dimensionNames?: DimensionNamesProps;
}

export interface VelocityOptions {
  urls: { u: string; v: string };
  variables: { u: string; v: string };
  bounds: { west: number; south: number; east: number; north: number };
  maxElevation?: number;
  verticalExaggeration?: number;
  flipElevation?: boolean;
  sliceSpacing?: number;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: { [key: string]: ZarrSelectorsProps };
  colorScale?: [number, number, number][];
  multiscaleLevel?: number;
  opacity?: number;
  crs?: CRS | null;
  scale?: [number, number];
  colormap?: ColorMapName;
  windOptions?: Partial<WindLayerOptions>;
}

export interface BoundsProps {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface XYLimitsProps {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type CRS = 'EPSG:4326' | 'EPSG:3857';

export interface DataSliceProps {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  startElevation?: number;
  endElevation?: number;
}

export type ColorMapName = (typeof allColorScales)[number];

export interface ColorScaleProps {
  min: number;
  max: number;
  colors: number[][] | string[];
}

export interface ColorMapInfo {
  [key: string]: { interpolate: boolean; colors: number[][] };
}

export interface ZarrCubeVelocityComponentProps {
  viewerRef: React.RefObject<Viewer>;
  urls: { u: string; v: string };
  variables: { u: string; v: string };
  bounds: BoundsProps;
  maxElevation?: number;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: { [key: string]: ZarrSelectorsProps };
  flipElevation?: boolean;
}

export interface ZarrCubeComponentProps {
  viewerRef: React.RefObject<Viewer>;
  url: string;
  variable: string;
  bounds: BoundsProps;
  showVerticalSlices?: boolean;
  showHorizontalSlices?: boolean;
  belowSeaLevel?: boolean;
  dimensionNames?: DimensionNamesProps;
  selectors?: { [key: string]: ZarrSelectorsProps };
  flipElevation?: boolean;
  maxElevation?: number;
}

export interface ZarrLayerComponentProps {
  viewerRef: React.RefObject<Viewer>;
  url: string;
  variable: string;
}

export interface CubeVelocityProps {
  array: Float32Array;
  width: number;
  height: number;
  elevation: number;
  dimensionValues: DimensionValues;
}

export interface DimIndicesProps {
  [key: string]: { name: string; index: number; array: zarr.Array<any> | null };
}

export type SliceArgs = (number | zarr.Slice)[];
