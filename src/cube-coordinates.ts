import * as zarr from 'zarrita';
import ndarray from 'ndarray';
import { loadDimensionValues, latDegToMercY, lonDegToMercX } from 'zarr-maps-tiling';
import type { BoundsProps, CRS, DimIndicesProps, DimensionValues } from './types';

/** Coordinate selection shared by scalar and velocity cubes. */
export interface CubeCoordinates {
  x: number[];
  y: [number, number];
  longitude: number[];
  latitude: number[];
  latIsAscending: boolean;
}

export function validateCubeBounds(bounds: BoundsProps): boolean {
  return Object.values(bounds).every(Number.isFinite) &&
    bounds.west < bounds.east && bounds.east - bounds.west <= 360 &&
    bounds.south < bounds.north && bounds.south >= -90 && bounds.north <= 90;
}

export function longitudeInBounds(longitude: number, bounds: BoundsProps): number {
  return longitude + 360 * Math.round(((bounds.west + bounds.east) / 2 - longitude) / 360);
}

export function cubePointIndices(lon: ArrayLike<number | string>, lat: ArrayLike<number | string>,
  longitude: number, latitude: number, crs: CRS | null): [number, number] {
  const projected = crs === 'EPSG:3857';
  const x = projected ? lonDegToMercX(longitude) : longitude;
  const y = projected ? latDegToMercY(latitude) : latitude;
  const nearest = (values: ArrayLike<number | string>, target: number, cyclic: boolean) => {
    let best = 0, distance = Infinity;
    for (let i = 0; i < values.length; i++) {
      const delta = Number(values[i]) - target;
      const d = Math.abs(cyclic ? delta - 360 * Math.round(delta / 360) : delta);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  };
  return [nearest(lon, x, !projected), nearest(lat, y, false)];
}

export function selectCubeCoordinates(longitude: number[], latitude: number[], bounds: BoundsProps,
  crs: CRS | null, latOverride?: boolean): CubeCoordinates {
  if (!validateCubeBounds(bounds)) throw new RangeError('Invalid cube geographic bounds');
  for (const values of [longitude, latitude]) {
    if (!values.length || !values.every(Number.isFinite)) throw new Error('Cube coordinates must be finite and non-empty');
    const ascending = values.length < 2 || values[1] > values[0];
    if (values.some((v, i) => i > 0 && (ascending ? v <= values[i - 1] : v >= values[i - 1]))) {
      throw new Error('Cube coordinate axes must be strictly monotonic');
    }
  }
  const projected = crs === 'EPSG:3857';
  const west = projected ? lonDegToMercX(bounds.west) : bounds.west;
  const east = projected ? lonDegToMercX(bounds.east) : bounds.east;
  const south = projected ? latDegToMercY(bounds.south) : bounds.south;
  const north = projected ? latDegToMercY(bounds.north) : bounds.north;
  const columns = longitude.map((value, index) => ({ index,
    value: projected ? value : value + 360 * Math.ceil((west - value) / 360) }))
    .filter(({ value }) => value >= west && value <= east)
    .sort((a, b) => a.value - b.value);
  const rows = latitude.map((value, index) => ({ value, index }))
    .filter(({ value }) => value >= south && value <= north);
  if (!columns.length || !rows.length) throw new RangeError('Cube bounds contain no coordinate samples');
  const y: [number, number] = [rows[0].index, rows[rows.length - 1].index + 1];
  return { x: columns.map(c => c.index), y, longitude: columns.map(c => longitude[c.index]),
    latitude: latitude.slice(...y), latIsAscending: latOverride ?? latitude[0] < latitude[latitude.length - 1] };
}

/** Load complete coordinate arrays for every discovered dataset dimension. */
export async function loadAllDimensionValues(
  root: zarr.Location<zarr.Readable>,
  dimensions: DimIndicesProps,
  level: string | null,
  version: 2 | 3 | null
): Promise<DimensionValues> {
  const values: DimensionValues = {};
  await Promise.all(
    Object.entries(dimensions).map(async ([canonicalName, dimension]) => {
      values[canonicalName] = await loadDimensionValues({}, level, dimension, root, version);
    })
  );
  return values;
}

/** Add dataset-specific dimension-name aliases for zarr-maps-tiling's cache lookup. */
export function withDimensionAliases(
  values: DimensionValues,
  dimensions: DimIndicesProps
): DimensionValues {
  const cache = { ...values };
  for (const [canonicalName, dimension] of Object.entries(dimensions)) {
    cache[dimension.name] = values[canonicalName];
  }
  return cache;
}

/** Reorder selected longitude columns, retaining the source dimension order. */
export function reorderCubeLongitude(data: ndarray.NdArray<any>, selection: CubeCoordinates,
  dimensions: DimIndicesProps, sliceArgs: unknown[]): ndarray.NdArray<Float64Array> {
  const axes = sliceArgs.map((arg, index) => typeof arg === 'number' ? -1 : index).filter(i => i >= 0);
  const lonAxis = axes.indexOf(dimensions.lon.index);
  const shape = [...data.shape];
  shape[lonAxis] = selection.x.length;
  const result = ndarray(new Float64Array(shape.reduce((a, b) => a * b, 1)), shape);
  const origin = selection.x.reduce((a, b) => Math.min(a, b), Infinity);
  for (let flat = 0; flat < result.data.length; flat++) {
    let remainder = flat;
    const index = shape.map((_, axis) => {
      const value = Math.floor(remainder / result.stride[axis]);
      remainder %= result.stride[axis];
      return value;
    });
    index[lonAxis] = selection.x[index[lonAxis]] - origin;
    result.data[flat] = Number(data.get(...index));
  }
  return result;
}
