import proj4 from 'proj4';
import { colormapBuilder } from 'zarr-cesium';
import { Rectangle } from 'cesium';

export function parseRangeString(rangeStr: string): number[] | string[] {
  let match = rangeStr.match(/range\((\d+),\s*(\d+),\s*(\d+)\)/);
  let time = false;
  if (!match) {
    match = rangeStr.match(/range\((\d{4}-\d{2}-\d{2}),\s*(\d{4}-\d{2}-\d{2}),\s*day=(\d+)\)/);
    if (!match) {
      throw new Error('Invalid range string format');
    }
    time = true;
  }
  const [, startStr, endStr, stepStr] = match;
  if (time) {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const step = parseInt(stepStr, 10);
    const result: string[] = [];
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + step)) {
      result.push(date.toISOString().split('T')[0]);
    }
    return result;
  }
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  const step = parseInt(stepStr, 10);

  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

export function calculateColorsForLegend(colors: string, scale: [number, number], n: number) {
  const listColors = colormapBuilder(colors, '', n) as number[][];
  const difValues = scale[1] - scale[0];
  const listColorsValues: number[] = [];
  for (let i = 0; i < n; i++) {
    listColorsValues.push(Number(scale[0]) + (difValues / (n - 1)) * i);
  }
  return { listColors, listColorsValues };
}

export const TILE_SERVER_URL: string =
  import.meta.env.NEXT_PUBLIC_TILE_SERVER_URL || 'https://imfe-pilot-tileserver.noc.ac.uk/';

export const ZARR_TILE_SERVER_URL: string =
  import.meta.env.NEXT_PUBLIC_ZARR_TILE_SERVER_URL || 'https://atlantis44.xyz/';

export const defaultView: [number, number] = [54, 0];
export const defaultZoom = 6;

export const DEFAULT_MAX_ZOOM = 30;
export const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [50, -4],
  [58, 4]
];

export const VERTICAL_EXAGGERATION = 50;

export const CESIUM_START_COORDINATES = Rectangle.fromDegrees(-180, -85, 180, 85);
export function convertProjection(source: string, dest: string, point: [number, number]) {
  return proj4(source, dest).forward([point[0], point[1]]);
}
