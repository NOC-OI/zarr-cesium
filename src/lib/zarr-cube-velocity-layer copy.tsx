'use client';

import { useEffect, useRef, useState } from 'react';
import { Viewer } from 'cesium';
import { WindLayer, WindLayerOptions } from 'cesium-wind-layer';
import * as zarr from 'zarrita';
import { DimensionValues } from './zarr-cube-provider';
import { colorSchemes } from './color-table-input';
import { identifyDimensionIndices } from './zarr-utils';

interface ZarrCesiumCubeVelocityLayerProps {
  viewerRef: React.MutableRefObject<Viewer | null>;
  uUrl: string;
  vUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  maxElevation?: number;
  verticalExaggeration?: number;
  flipY?: boolean;
  sliceSpacing?: number;
  terrainActive?: boolean;
}
function sanitizeArray(arr: Float32Array): Float32Array {
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (!Number.isFinite(val)) arr[i] = 0;
  }
  return arr;
}
const defaultOptions: Partial<WindLayerOptions> = {
  ...WindLayer.defaultOptions
};

export const ZarrCesiumCubeVelocityLayer: React.FC<ZarrCesiumCubeVelocityLayerProps> = ({
  viewerRef,
  uUrl,
  vUrl,
  bounds,
  maxElevation = 50,
  sliceSpacing = 5,
  verticalExaggeration = 10000,
  flipY = false,
  terrainActive = false
}) => {
  const layersRef = useRef<WindLayer[]>([]);

  async function loadZarrVariable(
    url: string,
    variable: string,
    maxElevation: number,
    bounds: any
  ) {
    const dimValues: DimensionValues = {
      latValues: [],
      lonValues: [],
      elevationValues: null,
      timeValues: null
    };
    const store = new zarr.FetchStore(url);
    const zarrGroup = await zarr.open.v2(store, { kind: 'group' });
    const arrayLocation = await zarrGroup.resolve(variable);
    const array = await zarr.open(arrayLocation, { kind: 'array' });
    const shape = array.shape;
    const metadata = array.attrs;
    const dimNames: any = metadata['_ARRAY_DIMENSIONS'];
    const dimIndices = identifyDimensionIndices(dimNames);

    const height = shape[dimIndices.lat.index];
    const width = shape[dimIndices.lon.index];
    const elevation = shape[dimIndices.elevation.index];
    const totalElevationSlices =
      maxElevation === -1 ? elevation : Math.min(maxElevation, elevation);

    const x = [
      Math.floor(((bounds.west + 180) / 360) * width),
      Math.floor(((bounds.east + 180) / 360) * width)
    ];
    const y = [
      Math.floor(((90 - bounds.north) / 180) * height),
      Math.floor(((90 - bounds.south) / 180) * height)
    ];
    // slice first time step and first elevation layer (or up to maxElevation)
    const sliceArgs: any[] = new Array(shape.length).fill(0);
    if (dimIndices.time) {
      sliceArgs[dimIndices.time.index] = 0;
      const timeValues = await zarr.open(await zarrGroup.resolve(dimIndices.time.name), {
        kind: 'array'
      });
      const timeData = await zarr.get(timeValues);
      dimValues.timeValues = Array.from(timeData.data) as number[];
    }
    if (dimIndices.elevation) {
      const elevationArray = await zarr.open(await zarrGroup.resolve(dimIndices.elevation.name), {
        kind: 'array'
      });
      const elevationData = await zarr.get(elevationArray);
      const elevationLevels = Array.from(elevationData.data) as number[];
      dimValues.elevationValues = elevationLevels.slice(0, totalElevationSlices);
      sliceArgs[dimIndices.elevation.index] = zarr.slice(0, totalElevationSlices);
    }
    sliceArgs[dimIndices.lat.index] = zarr.slice(y[0], y[1]);
    sliceArgs[dimIndices.lon.index] = zarr.slice(x[0], x[1]);
    const latArray = await zarr.open(await zarrGroup.resolve(dimIndices.lat.name), {
      kind: 'array'
    });
    const latData = await zarr.get(latArray);
    const latValues = Array.from(latData.data) as number[];
    dimValues.latValues = latValues.slice(y[0], y[1]);

    const lonArray = await zarr.open(await zarrGroup.resolve(dimIndices.lon.name), {
      kind: 'array'
    });
    const lonData = await zarr.get(lonArray);
    const lonValues = Array.from(lonData.data) as number[];
    dimValues.lonValues = lonValues.slice(x[0], x[1]);
    const data: any = await zarr.get(array, sliceArgs);

    const arr = new Float32Array(data.data);
    sanitizeArray(arr);

    return {
      array: arr,
      width: x[1] - x[0],
      height: y[1] - y[0],
      elevation: totalElevationSlices,
      dimValues,
      dimNames
    };
  }

  useEffect(() => {
    if (!viewerRef.current) return;

    async function createLayers() {
      for (const layer of layersRef.current) {
        layer.remove();
      }
      layersRef.current = [];

      const [uoCube, voCube] = await Promise.all([
        loadZarrVariable(uUrl, 'uo', maxElevation, bounds),
        loadZarrVariable(vUrl, 'vo', maxElevation, bounds)
      ]);

      const { width, height, elevation, dimValues } = uoCube;

      for (let d = 0; d < elevation; d += sliceSpacing) {
        const offset = d * width * height;
        const uoSlice = uoCube.array.subarray(offset, offset + width * height);
        const voSlice = voCube.array.subarray(offset, offset + width * height);

        const windData = {
          u: { array: uoSlice, min: -0.5, max: 0.5 },
          v: { array: voSlice, min: -0.5, max: 0.5 },
          width,
          height,
          unit: 'm s-1',
          bounds
        };

        // const altitude = baseAltitude + (elevation - 1 - d) * verticalExaggeration;
        const elevationValues =
          dimValues.elevationValues ?? Array.from({ length: elevation }, (_, i) => i);
        const maxElevationValue = Math.max(...elevationValues);
        const currentElevationValue = elevationValues[d];

        let altitude: number;
        if (terrainActive) {
          // Realistic underwater placement — below sea level
          altitude = -currentElevationValue * verticalExaggeration;
        } else {
          // Map: deepest → sea surface, shallowest → above surface
          altitude = (maxElevationValue - currentElevationValue) * verticalExaggeration;
        }

        const options: Partial<WindLayerOptions> = {
          ...defaultOptions,
          domain: { min: 0, max: 1 },
          speedFactor: 12,
          lineWidth: { min: 1, max: 3 },
          lineLength: { min: 0, max: 400 },
          particleHeight: altitude,
          particlesTextureSize: 50,
          colors: colorSchemes.find(item => item.value === 'warm')?.colors.reverse(),
          useViewerBounds: true,
          dynamic: true,
          flipY
        };

        const layer = new WindLayer(viewerRef.current!, windData, options);
        layersRef.current.push(layer);

        console.log(`Added WindLayer for elevation ${d} (alt=${altitude} m)`);
      }

      console.log(`🎨 Created ${layersRef.current.length} layers from cube`);
    }

    createLayers().catch(console.error);

    return () => {
      for (const layer of layersRef.current) {
        layer.remove();
      }
      layersRef.current = [];
    };
  }, [
    uUrl,
    vUrl,
    bounds,
    maxElevation,
    verticalExaggeration,
    flipY,
    viewerRef,
    sliceSpacing,
    terrainActive
  ]);

  return null;
};
