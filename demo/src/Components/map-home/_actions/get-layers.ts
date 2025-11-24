import type { Viewer } from 'cesium';
import { ZarrCubeProvider, ZarrCubeVelocityProvider, ZarrLayerProvider } from 'zarr-cesium';
import { GetZarrLayer } from '../../../lib/map-layers/addZarrLayer';
import type { DataInfoType, keyable, SelectedLayersType, ZarrCesiumRefs } from '../../../types';
import type { CubeOptions, LayerOptions, VelocityOptions } from 'zarr-cesium';
import type React from 'react';
// import { updateOpacity } from './layers-handle';

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
  gebcoTerrainEnabled?: boolean,
  setSelectedLayers?: React.Dispatch<React.SetStateAction<SelectedLayersType>>
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
      updateSelectedLayersWithDimensions(
        layer.imageryProvider,
        actualLayer,
        selectedLayers,
        setSelectedLayers
      );
      layers.add(layer);
    } else if (layerName.dataType === 'zarr-cube') {
      const layer = await getZarrCube(
        layerName,
        actualLayer,
        viewerRef,
        zarrCesiumRefs.cubeRef,
        gebcoTerrainEnabled
      );
      updateSelectedLayersWithDimensions(
        layer,
        actualLayer,
        selectedLayers,
        setSelectedLayers,
        true
      );
    } else if (layerName.dataType === 'zarr-cube-velocity') {
      const layer = await getZarrCubeVelocity(
        layerName,
        actualLayer,
        viewerRef,
        zarrCesiumRefs.velocityCubeRef,
        gebcoTerrainEnabled
      );
      updateSelectedLayersWithDimensions(
        layer,
        actualLayer,
        selectedLayers,
        setSelectedLayers,
        true
      );
    } else if (layerName.dataType === 'zarr-titiler') {
      const layer = await getZarrLayer(layerName, actualLayer);
      layers.add(layer);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error adding layer' };
  }
  // if (map.current) {
  //   map.current.fitBounds(bounds, { padding: 20, animate: true });
  // }
}

export function updateSelectedLayersWithDimensions(
  layer: any,
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  setSelectedLayers?: React.Dispatch<React.SetStateAction<SelectedLayersType>>,
  cube?: boolean
) {
  if (!setSelectedLayers) return;
  const selected = selectedLayers[actualLayer];
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
  setSelectedLayers(prev => ({
    ...prev,
    [actualLayer]: selected
  }));
}

export async function getZarrCesiumLayer(
  layerName: DataInfoType,
  actualLayer: string,
  viewerRef: React.RefObject<Viewer>
) {
  const options = layerName.params as LayerOptions;
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
  const options = layerName.params as CubeOptions;
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
  const options = layerName.params as VelocityOptions;
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
