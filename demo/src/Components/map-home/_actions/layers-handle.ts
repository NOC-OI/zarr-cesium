import type React from 'react';
import { DEFAULT_BOUNDS } from '../../../lib/map-layers/utils';
import type { LayersJsonType, SelectedLayersType, ZarrCesiumRefs } from '../../../types';
import { generateSelectedLayer, getSelectedLayerWithDimensions, viewerMap } from './get-layers';
import { type Viewer } from 'cesium';
import {
  DEFAULT_OPACITY,
  type VelocityOptions,
  type CubeOptions,
  ZarrLayerProvider
} from 'zarr-cesium';

export function getBoundsFromBBox(bbox: number[] | null): [[number, number], [number, number]] {
  if (!bbox || bbox.length !== 4) return DEFAULT_BOUNDS;
  const sumValue = 0.1;
  bbox[0] = bbox[0] - sumValue < -180 ? -180 : bbox[0] - sumValue;
  bbox[1] = bbox[1] - sumValue < -90 ? -90 : bbox[1] - sumValue;
  bbox[2] = bbox[2] + sumValue > 180 ? 180 : bbox[2] + sumValue;
  bbox[3] = bbox[3] + sumValue > 90 ? 90 : bbox[3] + sumValue;
  return [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]]
  ];
}

export function removeLayerFromMap(
  actualLayer: string,
  listLayers: LayersJsonType,
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
): void {
  const splitActual = actualLayer.split('_');
  if (splitActual.length > 2) {
    splitActual[1] = splitActual.slice(1).join('_');
  }
  const layerInfo = listLayers[splitActual[0]].layerNames[splitActual[1]];

  const layers = viewerMap(viewerRef, layerInfo.dataType) || null;
  if (layerInfo.dataType === 'zarr-cube') {
    zarrCesiumRefs.cubeRefs.current[actualLayer]?.destroy();
    delete zarrCesiumRefs.cubeRefs.current[actualLayer];
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRefs.current[actualLayer]?.destroy();
    delete zarrCesiumRefs.velocityCubeRefs.current[actualLayer];
  } else {
    layers?._layers.forEach(function (layer: any) {
      if (actualLayer === layer.id) {
        layers.remove(layer);
        if (layerInfo.dataType === 'zarr-cesium') {
          layer.imageryProvider.destroy();
        }
      }
    });
  }
}

export function removeAllLayersFromMap(
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
): void {
  Object.values(zarrCesiumRefs.cubeRefs.current).forEach(provider => provider.destroy());
  zarrCesiumRefs.cubeRefs.current = {};
  Object.values(zarrCesiumRefs.velocityCubeRefs.current).forEach(provider => provider.destroy());
  zarrCesiumRefs.velocityCubeRefs.current = {};

  const imageryLayers = viewerRef.current?.imageryLayers;
  if (!imageryLayers) return;
  for (let index = imageryLayers.length - 1; index >= 0; index--) {
    const layer = imageryLayers.get(index);
    if (!(layer.imageryProvider instanceof ZarrLayerProvider)) continue;
    imageryLayers.remove(layer);
    layer.imageryProvider.destroy();
  }
}

export async function changeMapOpacity(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layers = viewerMap(viewerRef, selectedLayers[actualLayer].dataType) || null;

  const layerInfo = selectedLayers[actualLayer];
  if (!layerInfo) return;
  let opacity = layerInfo.params.opacity;
  if (typeof opacity !== 'number') {
    opacity = opacity ? parseFloat(opacity) : DEFAULT_OPACITY;
  }
  if (layerInfo.dataType === 'zarr-cube') {
    zarrCesiumRefs.cubeRefs.current[actualLayer]?.updateStyle({ opacity: opacity });
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRefs.current[actualLayer]?.updateStyle({ opacity: opacity });
  } else {
    const layer = layers?._layers.find((layer: any) => layer.id === actualLayer);
    if (layer) {
      layer.alpha = opacity;
    }
  }
}

export async function changeMapColors(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  if (layerInfo.dataType === 'zarr-cube') {
    zarrCesiumRefs.cubeRefs.current[actualLayer]?.updateStyle({
      scale: layerInfo.params.scale,
      colormap: layerInfo.params.colormap
    });
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRefs.current[actualLayer]?.updateStyle({
      scale: layerInfo.params.scale,
      colormap: layerInfo.params.colormap
    });
  } else {
    const layers = viewerMap(viewerRef, layerInfo.dataType) || null;
    const layer = layers?._layers.find((candidate: any) => actualLayer === candidate.id);
    layer?.updateStyle({
      scale: layerInfo.params.scale,
      colormap: layerInfo.params.colormap
    });
  }
}

export async function changeMapPyramidLevels(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const params = layerInfo.params as CubeOptions | VelocityOptions;
  const ref =
    layerInfo.dataType === 'zarr-cube'
      ? zarrCesiumRefs.cubeRefs.current[actualLayer]
      : zarrCesiumRefs.velocityCubeRefs.current[actualLayer];
  ref?.updateSelectors({ multiscaleLevel: params.multiscaleLevel });
  return getSelectedLayerWithDimensions(ref, actualLayer, selectedLayers, true);
}

export async function changeMapBounds(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const params = layerInfo.params as CubeOptions | VelocityOptions;
  const ref =
    layerInfo.dataType === 'zarr-cube'
      ? zarrCesiumRefs.cubeRefs.current[actualLayer]
      : zarrCesiumRefs.velocityCubeRefs.current[actualLayer];
  ref?.updateSelectors({ bounds: params.bounds });
  return getSelectedLayerWithDimensions(ref, actualLayer, selectedLayers, true);
}

export function updateSeaLevelLayerReference(
  zarrCesiumRefs: ZarrCesiumRefs,
  gebcoTerrainEnabled: boolean,
  selectedLayers: SelectedLayersType
) {
  const updates = [];
  for (const provider of Object.values(zarrCesiumRefs.cubeRefs.current)) {
    provider.updateSlices({ belowSeaLevel: gebcoTerrainEnabled });
    updates.push({
      name: provider.id,
      layer: getSelectedLayerWithDimensions(provider, provider.id, selectedLayers, true)
    });
  }
  for (const provider of Object.values(zarrCesiumRefs.velocityCubeRefs.current)) {
    provider.updateSlices({ belowSeaLevel: gebcoTerrainEnabled });
    updates.push({
      name: provider.id,
      layer: getSelectedLayerWithDimensions(provider, provider.id, selectedLayers, true)
    });
  }
  return updates.filter(update => update.layer);
}

export async function changeMapDimensions(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const layers = viewerMap(viewerRef, layerInfo.dataType) || null;
  if (layerInfo.dataType === 'zarr-cube') {
    const provider = zarrCesiumRefs.cubeRefs.current[actualLayer];
    provider?.updateSelectors({ selectors: layerInfo.params.selectors });
    return getSelectedLayerWithDimensions(
      provider,
      actualLayer,
      selectedLayers,
      true
    );
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    const provider = zarrCesiumRefs.velocityCubeRefs.current[actualLayer];
    await provider?.updateSelectors({
      selectors: layerInfo.params.selectors
    });
    return getSelectedLayerWithDimensions(
      provider,
      actualLayer,
      selectedLayers,
      true
    );
  } else if (layerInfo.dataType === 'zarr-cesium') {
    const layer = layers?._layers.find((candidate: any) => actualLayer === candidate.id);
    if (layer) {
      layer.updateSelectors(layerInfo.params.selectors);
      return getSelectedLayerWithDimensions(layer.imageryProvider, actualLayer, selectedLayers);
    }
  } else {
    layers?._layers.forEach(function (layer: any) {
      if (actualLayer === layer.id) {
        layers.remove(layer);
      }
    });
    await generateSelectedLayer(actualLayer, selectedLayers, viewerRef, layers, zarrCesiumRefs);
  }
}

export async function changeMapCubeSlices(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  if (layerInfo.dataType === 'zarr-cube') {
    const provider = zarrCesiumRefs.cubeRefs.current[actualLayer];
    provider?.updateSlices(layerInfo.slices!);
    return getSelectedLayerWithDimensions(provider, actualLayer, selectedLayers, true);
  }
}
export async function changeMapVelocitySlices(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const params = layerInfo.params as VelocityOptions;
  if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRefs.current[actualLayer]?.updateSlices({
      verticalExaggeration: params.verticalExaggeration
    });
  }
}

export async function changeMapCubeParams(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  if (layerInfo.dataType === 'zarr-cube') {
    const params = layerInfo.params as CubeOptions;
    zarrCesiumRefs.cubeRefs.current[actualLayer]?.updateStyle({
      scale: params.scale,
      colormap: params.colormap,
      verticalExaggeration: params.verticalExaggeration
    });
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    const params = layerInfo.params as VelocityOptions;
    zarrCesiumRefs.velocityCubeRefs.current[actualLayer]?.updateStyle({
      scale: params.scale,
      colormap: params.colormap,
      windOptions: params.windOptions
    });
  }
}
