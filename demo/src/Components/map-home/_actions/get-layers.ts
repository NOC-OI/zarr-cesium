import type { Viewer } from 'cesium';
import { ZarrCubeProvider, ZarrCubeVelocityProvider, ZarrLayerProvider } from 'zarr-cesium';
import { GetZarrLayer } from '../../../lib/map-layers/addZarrLayer';
import type { DataInfoType, keyable, SelectedLayersType, ZarrCesiumRefs } from '../../../types';
import type { CubeOptions, LayerOptions, VelocityOptions } from 'zarr-cesium';
import type React from 'react';

export function viewerMap(viewerRef: React.RefObject<Viewer | null>, dataType: string) {
  const relationship: keyable = {
    'zarr-cesium': viewerRef.current?.imageryLayers,
    'zarr-titiler': viewerRef.current?.imageryLayers
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
        zarrCesiumRefs.cubeRef,
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
        zarrCesiumRefs.velocityCubeRef,
        gebcoTerrainEnabled
      );
      return {
        selectedLayer: getSelectedLayerWithDimensions(layer, actualLayer, selectedLayers, true)
      };
    } else if (layerName.dataType === 'zarr-titiler') {
      const layer = await getZarrLayer(layerName, actualLayer);
      layers.add(layer);
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
        values: layer.dimensionValues[dimKey],
        selected: dimKey === 'lat' ? layer.latSliceIndex : layer.lonSliceIndex
      };
    } else {
      dimensions[dimKey] = {
        values: layer.dimensionValues[dimKey],
        selected: layer.selectors[dimKey].selected
      };
      if (cube && dimKey === 'elevation') {
        const elevationShape = layer.elevationShape;
        dimensions[dimKey].indices = Array.from({ length: elevationShape }, (_, i) => i);
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
  const imageryLayer = (await ZarrLayerProvider.createLayer(viewerRef.current, options)) as any;
  imageryLayer.id = actualLayer;
  return imageryLayer;
}

export async function getZarrCube(
  layerName: DataInfoType,
  actualLayer: string,
  viewerRef: React.RefObject<Viewer>,
  cubeRef: React.RefObject<ZarrCubeProvider | null>,
  gebcoTerrainEnabled?: boolean
) {
  const options = structuredClone(layerName.params) as CubeOptions;
  if (gebcoTerrainEnabled !== undefined && options.flipElevation !== true) {
    options.belowSeaLevel = gebcoTerrainEnabled;
  }
  const layer = new ZarrCubeProvider(viewerRef.current, options);
  layer.id = actualLayer;
  cubeRef.current = layer;
  await layer.load();
  return layer;
}

export async function getZarrCubeVelocity(
  layerName: DataInfoType,
  actualLayer: string,
  viewerRef: React.RefObject<Viewer>,
  velocityCubeRef: React.RefObject<ZarrCubeVelocityProvider | null>,
  gebcoTerrainEnabled?: boolean
) {
  const options = structuredClone(layerName.params) as VelocityOptions;
  if (gebcoTerrainEnabled !== undefined && options.flipElevation !== true) {
    options.belowSeaLevel = gebcoTerrainEnabled;
  }
  const layer = new ZarrCubeVelocityProvider(viewerRef.current, options);
  layer.id = actualLayer;
  velocityCubeRef.current = layer;

  await layer.load();
  return layer;
}

export async function getZarrLayer(layerName: DataInfoType, actualLayer: string) {
  const zarrLayerClass = new GetZarrLayer(layerName, actualLayer);
  const layer = await zarrLayerClass.getTile();
  return layer;
}
