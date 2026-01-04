import { WindLayerOptions } from 'cesium-wind-layer';
import { DimensionNamesProps } from './types';

/**
 * Default vertical exaggeration factor for Zarr cube visualization.
 */
export const DEFAULT_VERTICAL_EXAGGERATION = 5000;

/**
 * Default colormap for data visualization.
 */
export const DEFAULT_COLORMAP = 'viridis';

/**
 * Default data scale range for visualization.
 */
export const DEFAULT_COLORMAP_LIMITS: [number, number] = [0, 1];

/**
 * Default opacity for layer visualization.
 */
export const DEFAULT_OPACITY = 1;

/**
 * Default configuration for `WindLayer` rendering.
 *
 * These values are chosen to provide responsive and visually clear
 * particle animations for typical 1 km – 5 km atmospheric grid spacing.
 *
 * Users may override any property when constructing a `WindLayer`.
 *
 * @see WindLayerOptions
 */
export const DEFAULT_WIND_OPTIONS: Partial<WindLayerOptions> = {
  speedFactor: 12,
  lineWidth: { min: 1, max: 3 },
  lineLength: { min: 0, max: 400 },
  particlesTextureSize: 50,
  useViewerBounds: true,
  dynamic: true,
  flipY: true
};

export const DIMENSION_ALIASES_DEFAULT: { [key in keyof DimensionNamesProps]: string[] } = {
  lat: ['lat', 'latitude', 'y', 'Latitude', 'Y'],
  lon: ['lon', 'longitude', 'x', 'Longitude', 'X', 'lng'],
  time: ['time', 't', 'Time', 'time_counter'],
  elevation: ['depth', 'z', 'Depth', 'level', 'lev', 'deptht', 'elevation', 'depthu', 'depthv']
};

export const CF_MAPPINGS: { [key in keyof DimensionNamesProps]: string[] } = {
  lat: ['latitude'],
  lon: ['longitude'],
  time: ['time'],
  elevation: ['height', 'depth', 'altitude', 'air_pressure', 'pressure', 'geopotential_height']
};
