import type { Viewer } from 'cesium';
import { ZarrCubeProvider, ZarrCubeVelocityProvider, ZarrLayerProvider } from 'zarr-cesium';
import { IcechunkStore } from 'icechunk-js';
import type { DataInfoType, keyable, SelectedLayersType, ZarrCesiumRefs } from '../../../types';
import type { CubeOptions, LayerOptions, VelocityOptions } from 'zarr-cesium';
import type React from 'react';

export function viewerMap(viewerRef: React.RefObject<Viewer | null>, dataType: string) {
  const relationship: keyable = {
    'zarr-cesium': viewerRef.current?.imageryLayers
  };
  return relationship[dataType];
}

export async function generateSelectedLayer(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  viewerRef: React.RefObject<Viewer>,
  layers: any,
  zarrCesiumRefs: ZarrCesiumRefs,
  gebcoTerrainEnabled?: boolean
) {
  const layerName = selectedLayers[actualLayer];
  layers?._layers.forEach(function (layer: any) {
    if (actualLayer.includes(layer.id)) {
      layers.remove(layer);
    }
  });
  try {
    if (layerName.dataType === 'zarr-cesium') {
      const layer = await getZarrCesiumLayer(layerName, actualLayer, viewerRef);
      const selectedLayer = getSelectedLayerWithDimensions(
        layer.imageryProvider,
        actualLayer,
        selectedLayers
      );
      layers.add(layer);
      return { selectedLayer };
    } else if (layerName.dataType === 'zarr-cube') {
      const layer = await getZarrCube(
        layerName,
        actualLayer,
        viewerRef,
        zarrCesiumRefs.cubeRefs,
        gebcoTerrainEnabled
      );
      return {
        selectedLayer: getSelectedLayerWithDimensions(layer, actualLayer, selectedLayers, true)
      };
    } else if (layerName.dataType === 'zarr-cube-velocity') {
      const layer = await getZarrCubeVelocity(
        layerName,
        actualLayer,
        viewerRef,
        zarrCesiumRefs.velocityCubeRefs,
        gebcoTerrainEnabled
      );
      return {
        selectedLayer: getSelectedLayerWithDimensions(layer, actualLayer, selectedLayers, true)
      };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error adding layer' };
  }
}

export function getSelectedLayerWithDimensions(
  layer: any,
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  cube?: boolean
) {
  const selected = structuredClone(selectedLayers[actualLayer]);
  if (!selected || !layer) return;
  const dimensions: Record<string, { values: any; selected: any; indices?: number[] }> = {};
  Object.keys(layer.dimensionValues).forEach((dimKey: string) => {
    if (dimKey === 'lat' || dimKey === 'lon') {
      if (!cube) return;
      dimensions[dimKey] = {
        values: layer.cubeDimensionValues[dimKey],
        selected: dimKey === 'lat' ? layer.latSliceIndex : layer.lonSliceIndex
      };
    } else {
      dimensions[dimKey] = {
        values:
          cube && dimKey === 'elevation'
            ? layer.cubeDimensionValues[dimKey]
            : layer.dimensionValues[dimKey],
        selected: layer.selectors[dimKey].selected
      };
      if (cube && dimKey === 'elevation' && Array.isArray(layer.selectors[dimKey].selected)) {
        dimensions[dimKey].indices = Array.from(layer.dimensionValues[dimKey]);
      }
    }
  });
  if (cube && layer.elevationSliceIndex !== undefined) {
    selected.slices = {
      latIndex: layer.latSliceIndex,
      lonIndex: layer.lonSliceIndex,
      elevationIndex: layer.elevationSliceIndex
    };
  }
  if (cube) {
    const params = selected.params as CubeOptions | VelocityOptions;
    params.multiscaleLevel = layer.multiscaleLevel;
    params.bounds = layer.bounds;
    selected.params = params;
    selected.pyramidLevels = layer.levelInfos || [];
  }
  selected.dimensions = dimensions;
  return selected;
}

export async function getZarrCesiumLayer(
  layerName: DataInfoType,
  actualLayer: string,
  viewerRef: React.RefObject<Viewer>
) {
  const options = structuredClone(layerName.params) as LayerOptions;
  if (options.url?.endsWith('.icechunk')) {
    options.store = await IcechunkStore.open(options.url, { branch: 'main', formatVersion: 'v1' });
  }
  const imageryLayer = (await ZarrLayerProvider.createLayer(viewerRef.current, options)) as any;
  imageryLayer.id = actualLayer;
  return imageryLayer;
}

export async function getZarrCube(
  layerName: DataInfoType,
  actualLayer: string,
  viewerRef: React.RefObject<Viewer>,
  cubeRefs: React.RefObject<Record<string, ZarrCubeProvider>>,
  gebcoTerrainEnabled?: boolean
) {
  const options = structuredClone(layerName.params) as CubeOptions;
  if (gebcoTerrainEnabled !== undefined && options.flipElevation !== true) {
    options.belowSeaLevel = gebcoTerrainEnabled;
  }
  const layer = new ZarrCubeProvider(viewerRef.current, options);
  layer.id = actualLayer;
  await layer.load();
  cubeRefs.current[actualLayer]?.destroy();
  cubeRefs.current[actualLayer] = layer;
  return layer;
}

export async function getZarrCubeVelocity(
  layerName: DataInfoType,
  actualLayer: string,
  viewerRef: React.RefObject<Viewer>,
  velocityCubeRefs: React.RefObject<Record<string, ZarrCubeVelocityProvider>>,
  gebcoTerrainEnabled?: boolean
) {
  const options = structuredClone(layerName.params) as VelocityOptions;
  if (gebcoTerrainEnabled !== undefined && options.flipElevation !== true) {
    options.belowSeaLevel = gebcoTerrainEnabled;
  }
  const layer = new ZarrCubeVelocityProvider(viewerRef.current, options);
  layer.id = actualLayer;
  await layer.load();
  velocityCubeRefs.current[actualLayer]?.destroy();
  velocityCubeRefs.current[actualLayer] = layer;
  return layer;
}
