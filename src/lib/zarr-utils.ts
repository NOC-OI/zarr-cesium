import * as zarr from 'zarrita';
import {
  ZarrSelectorsProps,
  ZarrLevelMetadata,
  DimensionNamesProps,
  XYLimitsProps,
  CRS,
  DataSliceProps,
  DimIndicesProps,
  SliceArgs
} from './types';

const DIMENSION_ALIASES_DEFAULT: { [key in keyof DimensionNamesProps]: string[] } = {
  lat: ['lat', 'latitude', 'y', 'Latitude', 'Y'],
  lon: ['lon', 'longitude', 'x', 'Longitude', 'X', 'lng'],
  time: ['time', 't', 'Time', 'time_counter'],
  elevation: ['depth', 'z', 'Depth', 'level', 'lev', 'deptht', 'elevation']
};

const CF_MAPPINGS: { [key in keyof DimensionNamesProps]: string[] } = {
  lat: ['latitude'],
  lon: ['longitude'],
  time: ['time'],
  elevation: ['height', 'depth', 'altitude', 'air_pressure', 'pressure', 'geopotential_height']
};

export function identifyDimensionIndices(
  dimNames: string[],
  dimensionNames?: DimensionNamesProps,
  coordinates?: Record<string, any>
): DimIndicesProps {
  let DIMENSION_ALIASES = { ...DIMENSION_ALIASES_DEFAULT };
  const names = ['lat', 'lon', 'time', 'elevation'];
  if (coordinates) {
    Object.keys(coordinates).forEach(coordName => {
      const coordArr = coordinates[coordName];
      const coordAttrs = coordArr.attrs as Record<string, any>;
      const standardName = coordAttrs?.standard_name;
      if (standardName) {
        for (const [dimKey, cfNames] of Object.entries(CF_MAPPINGS)) {
          if (cfNames.includes(standardName)) {
            DIMENSION_ALIASES[dimKey as keyof DimensionNamesProps] = [coordName];
          }
        }
      }
    });
  }
  if (dimensionNames) {
    names.forEach(name => {
      const dimName = name as keyof DimensionNamesProps;
      if (dimensionNames[dimName]) {
        DIMENSION_ALIASES[dimName] = [dimensionNames[dimName]] as string[];
      }
    });
    if (dimensionNames.others) {
      dimensionNames.others.forEach(otherName => {
        DIMENSION_ALIASES[otherName as keyof DimensionNamesProps] = [otherName];
      });
    }
  }
  const indices: DimIndicesProps = {};
  for (const [key, aliases] of Object.entries(DIMENSION_ALIASES)) {
    for (let i = 0; i < dimNames.length; i++) {
      const name = dimNames[i].toLowerCase();
      if (aliases.map(a => a.toLowerCase()).includes(name)) {
        indices[key] = { name, index: i, array: coordinates ? coordinates[dimNames[i]] : null };
        break;
      }
    }
  }
  return indices;
}

export async function calculateSliceArgs(
  shape: number[],
  dataSlice: DataSliceProps,
  dimIndices: DimIndicesProps,
  selectors: { [key: string]: ZarrSelectorsProps },
  dimensionValues: { [key: string]: Float64Array | number[] },
  root: zarr.Location<zarr.FetchStore>,
  levelInfo: string | null,
  updateDimensionValues: boolean = false
): Promise<{ sliceArgs: SliceArgs; dimensionValues: { [key: string]: Float64Array | number[] } }> {
  const sliceArgs: SliceArgs = new Array(shape.length).fill(0);

  for (const dimName of Object.keys(dimIndices)) {
    const dimInfo = dimIndices[dimName];

    if (dimName === 'lon') {
      sliceArgs[dimInfo.index] = zarr.slice(dataSlice.startX, dataSlice.endX);
      if (updateDimensionValues) {
        dimensionValues[dimName] = await loadDimensionValues(
          dimensionValues,
          levelInfo,
          dimInfo,
          root,
          [dataSlice.startX, dataSlice.endX]
        );
      }
    } else if (dimName === 'lat') {
      sliceArgs[dimInfo.index] = zarr.slice(dataSlice.startY, dataSlice.endY);
      if (updateDimensionValues) {
        dimensionValues[dimName] = await loadDimensionValues(
          dimensionValues,
          levelInfo,
          dimInfo,
          root,
          [dataSlice.startY, dataSlice.endY]
        );
      }
    } else if (
      dimName === 'elevation' &&
      dataSlice.startElevation !== undefined &&
      dataSlice.endElevation !== undefined
    ) {
      sliceArgs[dimInfo.index] = zarr.slice(dataSlice.startElevation, dataSlice.endElevation);
      if (updateDimensionValues) {
        dimensionValues[dimName] = await loadDimensionValues(
          dimensionValues,
          levelInfo,
          dimInfo,
          root,
          [dataSlice.startElevation, dataSlice.endElevation]
        );
      }
    } else {
      const dimSelection = selectors[dimName];
      if (!dimSelection) {
        sliceArgs[dimInfo.index] = 0;
      } else if (dimSelection.type === 'index') {
        sliceArgs[dimInfo.index] = dimSelection.selected as number;
      } else if (dimSelection.type === 'value') {
        try {
          dimensionValues[dimName] = await loadDimensionValues(
            dimensionValues,
            levelInfo,
            dimInfo,
            root
          );
          const selectedValue = dimSelection.selected as number;
          let nearestIdx = 0;
          let minDiff = Infinity;
          dimensionValues[dimName].forEach((val, i) => {
            const diff = Math.abs(val - selectedValue);
            if (diff < minDiff) {
              minDiff = diff;
              nearestIdx = i;
            }
          });
          sliceArgs[dimInfo.index] = nearestIdx;
        } catch (err) {
          sliceArgs[dimInfo.index] = 0;
        }
      }

      dimensionValues[dimName] = await loadDimensionValues(
        dimensionValues,
        levelInfo,
        dimInfo,
        root
      );
    }
  }
  return { sliceArgs, dimensionValues };
}

async function loadDimensionValues(
  dimensionValues: Record<string, Float64Array | number[]>,
  levelInfo: string | null,
  dimIndices: DimIndicesProps[string],
  root: zarr.Location<zarr.FetchStore>,
  slice?: [number, number]
): Promise<Float64Array | number[]> {
  if (dimensionValues[dimIndices.name]) return dimensionValues[dimIndices.name];
  let targetRoot;
  if (levelInfo) {
    targetRoot = await root.resolve(levelInfo);
  } else {
    targetRoot = root;
  }
  let coordArr;
  if (dimIndices.array) {
    coordArr = dimIndices.array;
  } else {
    const coordVar = await targetRoot.resolve(dimIndices.name);
    coordArr = await zarr.open(coordVar, { kind: 'array' });
  }
  const coordData = await zarr.get(coordArr);
  const coordArray = Array.from(coordData.data) as number[];
  if (slice) {
    return coordArray.slice(slice[0], slice[1]);
  }
  return coordArray;
}
export async function initZarrDataset(
  root: zarr.Location<zarr.FetchStore>,
  variable: string,
  dimensions: DimensionNamesProps,
  levelMetadata: Map<number, ZarrLevelMetadata>,
  levelCache: Map<number, any>
): Promise<{
  zarrArray: zarr.Array<any>;
  levelInfos: string[];
  dimIndices: DimIndicesProps;
  attrs: Record<string, any>;
}> {
  const zarrGroup = await zarr.open(root, { kind: 'group' });
  const attrs = (zarrGroup.attrs ?? {}) as Record<string, any>;
  let zarrArray: zarr.Array<any> | null = null;
  let levelInfos: string[] = [];
  let coordinates: Record<string, any> = {};

  if (attrs.multiscales && attrs.multiscales[0]?.datasets?.length) {
    const datasets = attrs.multiscales[0].datasets;

    for (let i = 0; i < datasets.length; i++) {
      const levelPath = datasets[i].path;
      levelInfos.push(levelPath);
      const levelArr = await openLevelArray(root, levelPath, variable, levelCache);

      const levelRoot = await root.resolve(levelPath);

      coordinates = await calculateCoordinatesFromAttrs(
        levelArr,
        levelRoot,
        coordinates,
        levelPath
      );

      const dims = identifyDimensionIndices(
        levelArr.attrs['_ARRAY_DIMENSIONS'] as string[],
        dimensions,
        coordinates
      );

      const width = levelArr.shape[dims.lon.index];
      const height = levelArr.shape[dims.lat.index];

      levelMetadata.set(i, { width, height });
    }

    zarrArray = await openLevelArray(root, levelInfos[0], variable, levelCache);
  } else {
    const arrayLocation = await root.resolve(variable);
    zarrArray = await zarr.open(arrayLocation, { kind: 'array' });
  }
  if (!zarrArray) {
    throw new Error('Failed to initialize Zarr array');
  }
  coordinates = await calculateCoordinatesFromAttrs(zarrArray, root, coordinates);
  const dimIndices = identifyDimensionIndices(
    zarrArray.attrs['_ARRAY_DIMENSIONS'] as string[],
    dimensions,
    coordinates
  );
  return { zarrArray, levelInfos, dimIndices, attrs };
}

async function calculateCoordinatesFromAttrs(
  arr: zarr.Array<any>,
  root: zarr.Location<zarr.FetchStore>,
  existingCoordinates: Record<string, any>,
  levelPath?: string
): Promise<Record<string, any>> {
  if (Object.keys(existingCoordinates).length > 0) return existingCoordinates;
  const arrayAttrs = arr.attrs as Record<string, any>;
  for (let i = 0; i < arrayAttrs['_ARRAY_DIMENSIONS'].length; i++) {
    const dimName = arrayAttrs['_ARRAY_DIMENSIONS'][i];
    const coordVar = await root.resolve(dimName);
    existingCoordinates[dimName] = await zarr.open(coordVar, { kind: 'array' });
  }
  return existingCoordinates;
}

/**
 * Retrieve coordinate limits from lat/lon coordinate variables.
 */
export async function getXYLimits(
  root: zarr.Location<zarr.FetchStore>,
  dimIndices: DimIndicesProps,
  levelInfos: string[],
  multiscale: boolean
): Promise<XYLimitsProps> {
  const levelRoot = multiscale ? await root.resolve(levelInfos[0]) : root;

  const xarr =
    dimIndices.lon.array ||
    (await zarr.open(await levelRoot.resolve(dimIndices.lon.name), { kind: 'array' }));
  const yarr =
    dimIndices.lat.array ||
    (await zarr.open(await levelRoot.resolve(dimIndices.lat.name), { kind: 'array' }));

  const xdata = (await zarr.get(xarr)) as any;
  const ydata = (await zarr.get(yarr)) as any;

  return {
    xMin: xdata.data[0],
    xMax: xdata.data.at(-1),
    yMin: ydata.data[0],
    yMax: ydata.data.at(-1)
  };
}

/**
 * Cached multiscale level loader with LRU-like eviction.
 */
export async function openLevelArray(
  root: zarr.Location<zarr.FetchStore>,
  levelPath: string,
  variable: string,
  levelCache: Map<number, any>
): Promise<zarr.Array<any>> {
  const existing = Array.from(levelCache.entries()).find(([_, val]) => val.path === levelPath);
  if (existing) return existing[1];

  const levelRoot = await root.resolve(levelPath);
  const arrayLoc = variable ? await levelRoot.resolve(variable) : levelRoot;
  const arr = await zarr.open(arrayLoc, { kind: 'array' });

  const levelIndex = levelCache.size;
  levelCache.set(levelIndex, arr);
  if (levelCache.size > 3) {
    const firstKey = levelCache.keys().next().value as number;
    levelCache.delete(firstKey);
  }

  return arr;
}

export async function detectCRS(
  attrs: Record<string, any>,
  arr: zarr.Array<any> | null,
  xyLimits?: XYLimitsProps
): Promise<CRS> {
  const attrCRS = attrs?.multiscales?.[0]?.datasets?.[0]?.crs ?? arr?.attrs?.crs;
  if (attrCRS) {
    return attrCRS;
  }
  if (!xyLimits) {
    return 'EPSG:4326';
  }
  const xMax = xyLimits.xMax;
  return xMax && Math.abs(xMax) > 180 ? 'EPSG:3857' : 'EPSG:4326';
}

export function getCubeDimensions(
  cubeDimensions: [number, number, number],
  dimIndices: DimIndicesProps
): { nx: number; ny: number; nz: number } {
  const names = ['lat', 'lon', 'elevation'];
  const orderedNames = names.slice().sort((a, b) => dimIndices[b].index - dimIndices[a].index);
  const nz = cubeDimensions[orderedNames.indexOf('elevation')];
  const ny = cubeDimensions[orderedNames.indexOf('lat')];
  const nx = cubeDimensions[orderedNames.indexOf('lon')];
  return { nx, ny, nz };
}
