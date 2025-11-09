import * as Cesium from 'cesium';
import { DimIndicesProps, XYLimitsProps, ZarrLevelMetadata } from './types';
import * as zarr from 'zarrita';

export const mercProj = new Cesium.WebMercatorProjection();

export function lonDegToMercX(lonDeg: number) {
  return mercProj.project(new Cesium.Cartographic(Cesium.Math.toRadians(lonDeg), 0)).x;
}

export function latDegToMercY(latDeg: number) {
  const clamped = Cesium.Math.clamp(latDeg, -85.05112878, 85.05112878);
  return mercProj.project(new Cesium.Cartographic(0, Cesium.Math.toRadians(clamped))).y;
}

export function deriveRectangleAndScheme(
  crs: string,
  xyLimits: XYLimitsProps,
  levelMetadata: Map<number, ZarrLevelMetadata>,
  zarrArray: zarr.Array<any>,
  dimIndices: DimIndicesProps
): {
  rectangle: Cesium.Rectangle;
  tilingScheme: Cesium.TilingScheme;
} {
  let rectangle: Cesium.Rectangle;
  let tilingScheme: Cesium.TilingScheme;
  try {
    if (!xyLimits) throw new Error('xyLimits missing');
    let { xMin, xMax, yMin, yMax } = xyLimits;
    if (yMin > yMax) {
      [yMin, yMax] = [yMax, yMin];
    }
    const dx =
      (xMax - xMin) / (levelMetadata.get(0)?.width ?? zarrArray.shape[dimIndices.lon.index] - 1);
    const dy =
      (yMax - yMin) / (levelMetadata.get(0)?.height ?? zarrArray.shape[dimIndices.lat.index] - 1);

    const epsilon = crs === 'EPSG:3857' ? 1 : 1e-6;
    xMin = xMin - dx / 2 - epsilon;
    xMax = xMax + dx / 2 + epsilon;
    yMin = yMin - dy / 2 - epsilon;
    yMax = yMax + dy / 2 + epsilon;
    if (crs === 'EPSG:3857') {
      const proj = new Cesium.WebMercatorProjection();
      const sw = proj.unproject(new Cesium.Cartesian3(xMin, yMin, 0));
      const ne = proj.unproject(new Cesium.Cartesian3(xMax, yMax, 0));
      rectangle = Cesium.Rectangle.fromRadians(
        sw.longitude,
        sw.latitude,
        ne.longitude,
        ne.latitude
      );
      tilingScheme = new Cesium.WebMercatorTilingScheme();
    } else {
      rectangle = Cesium.Rectangle.fromDegrees(xMin, yMin, xMax, yMax);
      tilingScheme = new Cesium.GeographicTilingScheme();
    }
  } catch {
    tilingScheme =
      crs === 'EPSG:3857'
        ? new Cesium.WebMercatorTilingScheme()
        : new Cesium.GeographicTilingScheme();
    rectangle = tilingScheme.rectangle;
  }
  return { rectangle, tilingScheme };
}
