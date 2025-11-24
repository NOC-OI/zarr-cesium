/**
 * @module cesium-utils
 *
 * Utility functions for geographic coordinate conversion and
 * Cesium tiling scheme setup, used by layer and cube providers.
 *
 * Provides:
 * - Conversion between degrees and Web Mercator coordinates
 * - Automatic derivation of Cesium `Rectangle` and `TilingScheme`
 *   from Zarr dataset bounds and metadata
 */

import {
  Cartographic,
  WebMercatorProjection,
  Math,
  Rectangle,
  TilingScheme,
  Cartesian3,
  WebMercatorTilingScheme,
  GeographicTilingScheme
} from 'cesium';
import {
  BoundsProps,
  CRS,
  type DimIndicesProps,
  type XYLimitsProps,
  type ZarrLevelMetadata
} from './types';
import * as zarr from 'zarrita';
import { WindLayerOptions } from 'cesium-wind-layer';

/**
 * Global Web Mercator projection instance used for coordinate conversions.
 */
export const mercProj = new WebMercatorProjection();

/**
 * Converts a longitude in degrees into a Web Mercator X coordinate (meters).
 *
 * @remarks
 * Unlike geographic imagery providers, this function does not clamp
 * the longitude range — values outside [-180, 180] are permitted,
 * which is useful for wrapped global grids (e.g. 0…360).
 *
 * Cesium's `Cartographic` stores angles in radians, so the input is
 * internally converted using `Math.toRadians`.
 *
 * @param lonDeg - Longitude in degrees.
 * @returns Web Mercator X in meters.
 */
export function lonDegToMercX(lonDeg: number) {
  return mercProj.project(new Cartographic(Math.toRadians(lonDeg), 0)).x;
}

/**
 * Validates whether geographic bounds are logically consistent.
 *
 * @remarks
 * This check is strict and only accepts WGS84-style longitude ranges
 * in [-180, 180] and latitude ranges in [-90, 90].
 *
 * Bounds used in Zarr datasets may legitimately exceed these ranges
 * (e.g., wrapped 0–360 grids), in which case this function will return `false`.
 *
 * @param bounds - Geographic bounding box. See {@link BoundsProps}.
 * @returns Whether the bounds satisfy a strict WGS84 interpretation.
 */
export function validateBounds(bounds: BoundsProps): boolean {
  return (
    bounds.west < bounds.east &&
    bounds.south < bounds.north &&
    bounds.west >= -180 &&
    bounds.east <= 180 &&
    bounds.south >= -90 &&
    bounds.north <= 90
  );
}

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
export const DEFAULT_SCALE: [number, number] = [0, 1];

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

/**
 * Converts a latitude value (in degrees) to Web Mercator Y coordinate (in meters).
 *
 * @remarks
 * Latitude is clamped to the valid Web Mercator range of ±85.05112878°.
 *
 * @param latDeg - Latitude in degrees (range -90 → 90).
 * @returns The corresponding Y coordinate in Web Mercator projection.
 *
 * @example
 * ```ts
 * const y = latDegToMercY(51.5);
 * ```
 */
export function latDegToMercY(latDeg: number) {
  const clamped = Math.clamp(latDeg, -85.05112878, 85.05112878);
  return mercProj.project(new Cartographic(0, Math.toRadians(clamped))).y;
}

/**
 * Computes a Cesium {@link Rectangle} and {@link TilingScheme} for a Zarr dataset.
 *
 * @remarks
 * Behavior notes:
 * - The rectangle is expanded by half a pixel in all directions to avoid edge clipping.
 * - Pixel resolution is estimated from either `levelMetadata.get(0)` or the Zarr array shape.
 * - For EPSG:3857, the function interprets `xyLimits` as Web Mercator meters and uses
 *   `WebMercatorProjection.unproject` to obtain geographic radians.
 * - If any computation fails, the function falls back to a full-world tiling scheme
 *   (WebMercator or Geographic).
 * - If latitude limits are reversed, they are swapped automatically.
 *
 * @param crs - CRS code (`EPSG:4326` or `EPSG:3857`). See {@link CRS}.
 * @param xyLimits - Min/max X/Y values in the dataset's CRS. See {@link XYLimitsProps}.
 * @param levelMetadata - Per-resolution metadata (width/height).
 * @param zarrArray - The Zarr array containing the data.
 * @param dimIndices - Mapping of dimension keys to their array indices. See {@link DimIndicesProps}.
 *
 * @returns `{ rectangle, tilingScheme }`
 */
export function deriveRectangleAndScheme(
  crs: CRS,
  xyLimits: XYLimitsProps,
  levelMetadata: Map<number, ZarrLevelMetadata>,
  zarrArray: zarr.Array<any>,
  dimIndices: DimIndicesProps
): {
  rectangle: Rectangle;
  tilingScheme: TilingScheme;
} {
  let { xMin, xMax, yMin, yMax } = xyLimits;
  let rectangle: Rectangle;
  let tilingScheme: TilingScheme;
  try {
    if (yMin > yMax) {
      [yMin, yMax] = [yMax, yMin];
    }
    const dx =
      (xMax - xMin) / (levelMetadata.get(0)?.width ?? zarrArray.shape[dimIndices.lon.index] - 1);
    const dy =
      (yMax - yMin) / (levelMetadata.get(0)?.height ?? zarrArray.shape[dimIndices.lat.index] - 1);

    if (crs === 'EPSG:4326') {
      if (xMin > 180 || xMax > 180) {
        xMin = ((xMin + 180) % 360) - 180;
        xMax = ((xMax + 180) % 360) - 180;
        if (xMin > xMax) {
          const temp = xMin;
          xMin = xMax;
          xMax = temp;
        }
      }
    }

    const epsilon = crs === 'EPSG:3857' ? 1 : 1e-6;
    xMin = xMin - dx / 2 - epsilon;
    xMax = xMax + dx / 2 + epsilon;
    yMin = yMin - dy / 2 - epsilon;
    yMax = yMax + dy / 2 + epsilon;

    if (crs === 'EPSG:3857') {
      const proj = new WebMercatorProjection();
      const sw = proj.unproject(new Cartesian3(xMin, yMin, 0));
      const ne = proj.unproject(new Cartesian3(xMax, yMax, 0));
      rectangle = Rectangle.fromRadians(sw.longitude, sw.latitude, ne.longitude, ne.latitude);
      tilingScheme = new WebMercatorTilingScheme();
    } else {
      rectangle = Rectangle.fromDegrees(xMin, yMin, xMax, yMax);
      tilingScheme = new GeographicTilingScheme();
    }
  } catch (e) {
    console.warn('Rectangle derivation failed — falling back to default.', e);
    tilingScheme =
      crs === 'EPSG:3857' ? new WebMercatorTilingScheme() : new GeographicTilingScheme();
    rectangle = tilingScheme.rectangle;
  }
  return { rectangle, tilingScheme };
}
