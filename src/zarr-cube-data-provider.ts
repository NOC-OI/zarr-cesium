import ndarray from 'ndarray';
import * as zarr from 'zarrita';
import {
  calculateElevationSlice,
  calculateSliceArgs,
  getZarrData,
  sourceBoundsToGeographic
} from 'zarr-maps-tiling';
import type {
  BoundsProps,
  DimensionValues,
  DimIndicesProps,
  ResolvedCRS,
  ZarrSelectorsProps
} from './types';
import {
  type CubeCoordinates,
  loadAllDimensionValues,
  reorderCubeLongitude,
  selectCubeCoordinates,
  withDimensionAliases
} from './cube-coordinates';

export interface ZarrCubeDataOptions {
  array: zarr.Array<any>;
  root: zarr.Location<zarr.Readable>;
  dimensions: DimIndicesProps;
  level: string | null;
  zarrVersion: 2 | 3 | null;
  selectors: { [key: string]: ZarrSelectorsProps };
  bounds?: BoundsProps;
  projection: ResolvedCRS;
  latIsAscending?: boolean;
}

export interface ZarrCubeData {
  data: ndarray.NdArray<Float64Array>;
  dimensionValues: DimensionValues;
  cubeDimensionValues: DimensionValues;
  selectors: { [key: string]: ZarrSelectorsProps };
  coordinates: CubeCoordinates;
  dimensions: [number, number, number];
  origin: { x: number; y: number; elevation: number };
  bounds: BoundsProps;
}

/** Loads and spatially subsets a three-dimensional Zarr variable without rendering it. */
export class ZarrCubeDataProvider {
  constructor(private readonly options: ZarrCubeDataOptions) {}

  async load(): Promise<ZarrCubeData> {
    const {
      array,
      root,
      dimensions,
      level,
      zarrVersion,
      selectors,
      bounds,
      projection,
      latIsAscending
    } = this.options;
    if (!dimensions.elevation) {
      throw new Error('Zarr cube requires an elevation dimension');
    }

    const dimensionValues = await loadAllDimensionValues(root, dimensions, level, zarrVersion);
    const { dimensionValuesWithElevation, elevationSlice } = await calculateElevationSlice(
      array.shape[dimensions.elevation.index],
      dimensions.elevation,
      selectors.elevation,
      withDimensionAliases(dimensionValues, dimensions),
      root,
      // The level-specific values are already cached above.
      null,
      zarrVersion
    );
    const longitude = Array.from(dimensionValues.lon, Number);
    const latitude = Array.from(dimensionValues.lat, Number);
    const effectiveBounds = bounds ?? sourceBoundsToGeographic(
      {
        xMin: Math.min(...longitude),
        xMax: Math.max(...longitude),
        yMin: Math.min(...latitude),
        yMax: Math.max(...latitude)
      },
      projection
    );
    const coordinates = selectCubeCoordinates(
      longitude,
      latitude,
      effectiveBounds,
      projection,
      latIsAscending
    );
    const startX = coordinates.x.reduce((a, b) => Math.min(a, b), Infinity);
    const endX = coordinates.x.reduce((a, b) => Math.max(a, b), -Infinity) + 1;
    const [startY, endY] = coordinates.y;
    const sliceResult = await calculateSliceArgs(
      array.shape,
      {
        startX,
        endX,
        startY,
        endY,
        startElevation: elevationSlice[0],
        endElevation: elevationSlice[1]
      },
      dimensions,
      selectors,
      dimensionValuesWithElevation,
      root,
      // Reuse the level-specific coordinate cache populated above.
      null,
      zarrVersion,
      true
    );
    sliceResult.dimensionValues.lon = coordinates.longitude;
    sliceResult.dimensionValues.lat = coordinates.latitude;

    const rawData = await getZarrData(array as any, sliceResult.sliceArgs);
    const data = reorderCubeLongitude(
      ndarray(rawData.data, rawData.shape, rawData.stride),
      coordinates,
      dimensions,
      sliceResult.sliceArgs
    );

    return {
      data,
      dimensionValues,
      cubeDimensionValues: sliceResult.dimensionValues,
      selectors: sliceResult.selectors,
      coordinates,
      dimensions: [coordinates.x.length, endY - startY, elevationSlice[1] - elevationSlice[0]],
      origin: { x: startX, y: startY, elevation: elevationSlice[0] },
      bounds: effectiveBounds
    };
  }
}
