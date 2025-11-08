import * as zarr from 'zarrita';
import {
  ZarrSelectorsProps,
  ZarrLevelMetadata,
  DimensionNamesProps,
  XYLimitsProps,
  CRS,
  DataSliceProps
} from './types';

const DIMENSION_ALIASES_DEFAULT: { [key in keyof DimensionNamesProps]: string[] } = {
  lat: ['lat', 'latitude', 'y', 'Latitude', 'Y'],
  lon: ['lon', 'longitude', 'x', 'Longitude', 'X', 'lng'],
  time: ['time', 't', 'Time', 'time_counter'],
  elevation: ['depth', 'z', 'Depth', 'level', 'lev', 'deptht', 'elevation']
};

export function identifyDimensionIndices(
  dimNames: string[],
  dimensionNames?: DimensionNamesProps
): any {
  let DIMENSION_ALIASES = { ...DIMENSION_ALIASES_DEFAULT };
  const names = ['lat', 'lon', 'time', 'elevation'];
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
  const indices: any = {};
  for (const [key, aliases] of Object.entries(DIMENSION_ALIASES)) {
    for (let i = 0; i < dimNames.length; i++) {
      const name = dimNames[i].toLowerCase();
      if (aliases.map(a => a.toLowerCase()).includes(name)) {
        indices[key] = { name, index: i };
        break;
      }
    }
  }
  return indices;
}

export async function calculateSliceArgs(
  shape: number[],
  dataSlice: DataSliceProps,
  dimIndices: any,
  selectors: { [key: string]: ZarrSelectorsProps },
  dimensionValues: { [key: string]: Float64Array | number[] },
  root: any,
  levelInfo: string | null,
  updateDimensionValues: boolean = false
): Promise<{ sliceArgs: any[]; dimensionValues: { [key: string]: Float64Array | number[] } }> {
  const sliceArgs: any[] = new Array(shape.length).fill(0);

  for (const dimName of Object.keys(dimIndices)) {
    const dimInfo = dimIndices[dimName];

    if (dimName === 'lon') {
      sliceArgs[dimInfo.index] = zarr.slice(dataSlice.startX, dataSlice.endX);
      if (updateDimensionValues) {
        dimensionValues[dimName] = await loadDimensionValues(
          dimensionValues,
          levelInfo,
          dimInfo.name,
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
          dimInfo.name,
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
          dimInfo.name,
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
            dimInfo.name,
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
        dimInfo.name,
        root
      );
    }
  }
  return { sliceArgs, dimensionValues };
}

async function loadDimensionValues(
  dimensionValues: Record<string, Float64Array | number[]>,
  levelInfo: string | null,
  name: string,
  root: any,
  slice?: [number, number]
): Promise<Float64Array | number[]> {
  if (dimensionValues[name]) return dimensionValues[name];
  let targetRoot;
  if (levelInfo) {
    targetRoot = await root.resolve(levelInfo);
  } else {
    targetRoot = root;
  }
  const coordVar = await targetRoot.resolve(name);
  const coordArr = await zarr.open(coordVar, { kind: 'array' });
  const coordData = await zarr.get(coordArr);
  const coordArray = Array.from(coordData.data) as number[];
  if (slice) {
    return coordArray.slice(slice[0], slice[1]);
  }
  return coordArray;
}
export async function initZarrDataset(
  root: any,
  variable: string,
  dimensions: any,
  levelMetadata: Map<number, ZarrLevelMetadata>,
  levelCache: Map<number, any>
): Promise<{ zarrArray: any; levelInfos: string[]; dimIndices: any; attrs: any }> {
  const zarrGroup = await zarr.open(root, { kind: 'group' });
  const attrs = (zarrGroup.attrs ?? {}) as any;
  let zarrArray: any = null;
  let levelInfos: string[] = [];
  let dimIndices: any = {};

  if (attrs.multiscales && attrs.multiscales[0]?.datasets?.length) {
    const datasets = attrs.multiscales[0].datasets;

    for (let i = 0; i < datasets.length; i++) {
      const levelPath = datasets[i].path;
      levelInfos.push(levelPath);
      const levelArr = await openLevelArray(root, levelPath, variable, levelCache);
      const dims = identifyDimensionIndices(levelArr.attrs['_ARRAY_DIMENSIONS'], dimensions);

      const width = levelArr.shape[dims.lon.index];
      const height = levelArr.shape[dims.lat.index];

      levelMetadata.set(i, { width, height });
    }

    zarrArray = await openLevelArray(root, levelInfos[0], variable, levelCache);
  } else {
    const arrayLocation = await root.resolve(variable);
    zarrArray = await zarr.open(arrayLocation, { kind: 'array' });
  }

  dimIndices = identifyDimensionIndices(zarrArray.attrs['_ARRAY_DIMENSIONS'], dimensions);
  return { zarrArray, levelInfos, dimIndices, attrs };
}
/**
 * Retrieve coordinate limits from lat/lon coordinate variables.
 */
export async function getXYLimits(
  root: any,
  dimIndices: any,
  levelInfos: string[],
  multiscale: boolean
): Promise<XYLimitsProps> {
  const levelRoot = multiscale ? await root.resolve(levelInfos[0]) : root;

  const xarr = await zarr.open(await levelRoot.resolve(dimIndices.lon.name), { kind: 'array' });
  const yarr = await zarr.open(await levelRoot.resolve(dimIndices.lat.name), { kind: 'array' });

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
  root: any,
  levelPath: string,
  variable: string,
  levelCache: Map<number, any>
): Promise<any> {
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

export async function detectCRS(attrs: any, arr: any, xyLimits?: XYLimitsProps): Promise<CRS> {
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
