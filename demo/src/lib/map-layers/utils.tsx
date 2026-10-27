import proj4 from 'proj4';
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
