import type React from 'react';
import { DEFAULT_BOUNDS } from '../../../lib/map-layers/utils';
import type { LayersJsonType, SelectedLayersType, ZarrCesiumRefs } from '../../../types';
import { generateSelectedLayer, updateSelectedLayersWithDimensions, viewerMap } from './get-layers';
import { type Viewer } from 'cesium';
import {
  DEFAULT_OPACITY,
  type VelocityOptions,
  type CubeOptions,
  ZarrCubeProvider,
  ZarrCubeVelocityProvider
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
    zarrCesiumRefs.cubeRef.current?.destroy();
    zarrCesiumRefs.cubeRef.current = null;
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRef.current?.destroy();
    zarrCesiumRefs.velocityCubeRef.current = null;
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

export async function changeMapOpacity(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layers = viewerMap(viewerRef, selectedLayers[actualLayer].dataType) || null;

  const layerInfo = selectedLayers[actualLayer];
  if (!layerInfo) return;
  if (typeof layerInfo.params.opacity !== 'number') {
    layerInfo.params.opacity = layerInfo.params.opacity
      ? parseFloat(layerInfo.params.opacity)
      : DEFAULT_OPACITY;
  }
  const opacity = layerInfo.params.opacity;
  if (layerInfo.dataType === 'zarr-cube') {
    zarrCesiumRefs.cubeRef.current?.updateStyle({ opacity: opacity });
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRef.current?.updateStyle({ opacity: opacity });
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
    zarrCesiumRefs.cubeRef.current?.updateStyle({
      scale: layerInfo.params.scale,
      colormap: layerInfo.params.colormap
    });
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    zarrCesiumRefs.velocityCubeRef.current?.updateStyle({
      scale: layerInfo.params.scale,
      colormap: layerInfo.params.colormap
    });
  } else {
    const layers = viewerMap(viewerRef, layerInfo.dataType) || null;
    layers?._layers.forEach(function (layer: any) {
      if (actualLayer === layer.id) {
        layers.remove(layer);
      }
    });
    await generateSelectedLayer(actualLayer, selectedLayers, viewerRef, layers, zarrCesiumRefs);
  }
}

export async function changeMapPyramidLevels(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  setSelectedLayers: React.Dispatch<React.SetStateAction<SelectedLayersType>>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const params = layerInfo.params as CubeOptions | VelocityOptions;
  const ref =
    layerInfo.dataType === 'zarr-cube'
      ? zarrCesiumRefs.cubeRef.current
      : zarrCesiumRefs.velocityCubeRef.current;
  ref?.updateSelectors({ multiscaleLevel: params.multiscaleLevel });
  updateSelectedLayersWithDimensions(ref, actualLayer, selectedLayers, setSelectedLayers, true);
}

export async function changeMapBounds(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  setSelectedLayers: React.Dispatch<React.SetStateAction<SelectedLayersType>>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const params = layerInfo.params as CubeOptions | VelocityOptions;
  const ref =
    layerInfo.dataType === 'zarr-cube'
      ? zarrCesiumRefs.cubeRef.current
      : zarrCesiumRefs.velocityCubeRef.current;
  ref?.updateSelectors({ bounds: params.bounds });
  updateSelectedLayersWithDimensions(ref, actualLayer, selectedLayers, setSelectedLayers, true);
}

export function updateSeaLevelLayerReference(
  cubeRef: React.RefObject<ZarrCubeProvider | null>,
  velocityCubeRef: React.RefObject<ZarrCubeVelocityProvider | null>,
  gebcoTerrainEnabled: boolean,
  selectedLayers: SelectedLayersType,
  setSelectedLayers?: React.Dispatch<React.SetStateAction<SelectedLayersType>>
) {
  if (cubeRef.current) {
    cubeRef.current.updateSlices({ belowSeaLevel: gebcoTerrainEnabled });
    updateSelectedLayersWithDimensions(
      cubeRef.current,
      cubeRef.current.id,
      selectedLayers,
      setSelectedLayers,
      true
    );
  }
  if (velocityCubeRef.current) {
    velocityCubeRef.current.updateSlices({ belowSeaLevel: gebcoTerrainEnabled });
    updateSelectedLayersWithDimensions(
      velocityCubeRef.current,
      velocityCubeRef.current.id,
      selectedLayers,
      setSelectedLayers,
      true
    );
  }
}

export async function changeMapDimensions(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  setSelectedLayers: React.Dispatch<React.SetStateAction<SelectedLayersType>>,
  viewerRef: React.RefObject<Viewer>,
  zarrCesiumRefs: ZarrCesiumRefs
) {
  const layerInfo = selectedLayers[actualLayer];
  const layers = viewerMap(viewerRef, layerInfo.dataType) || null;
  if (layerInfo.dataType === 'zarr-cube') {
    zarrCesiumRefs.cubeRef.current?.updateSelectors({ selectors: layerInfo.params.selectors });
    updateSelectedLayersWithDimensions(
      zarrCesiumRefs.cubeRef.current,
      actualLayer,
      selectedLayers,
      setSelectedLayers,
      true
    );
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    await zarrCesiumRefs.velocityCubeRef.current?.updateSelectors({
      selectors: layerInfo.params.selectors
    });
    updateSelectedLayersWithDimensions(
      zarrCesiumRefs.velocityCubeRef.current,
      actualLayer,
      selectedLayers,
      setSelectedLayers,
      true
    );
  } else if (layerInfo.dataType === 'zarr-cesium') {
    layers?._layers.forEach(function (layer: any) {
      if (actualLayer === layer.id) {
        layer.updateSelectors(layerInfo.params.selectors);
        updateSelectedLayersWithDimensions(
          layer.imageryProvider,
          actualLayer,
          selectedLayers,
          setSelectedLayers
        );
      }
    });
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
  setSelectedLayers: React.Dispatch<React.SetStateAction<SelectedLayersType>>,
  cubeRef: React.RefObject<ZarrCubeProvider>
) {
  const layerInfo = selectedLayers[actualLayer];
  if (layerInfo.dataType === 'zarr-cube') {
    cubeRef.current?.updateSlices(layerInfo.slices!);
    updateSelectedLayersWithDimensions(
      cubeRef.current,
      actualLayer,
      selectedLayers,
      setSelectedLayers,
      true
    );
  }
}
export async function changeMapVelocitySlices(
  actualLayer: string,
  selectedLayers: SelectedLayersType,
  velocityCubeRef: React.RefObject<ZarrCubeVelocityProvider>
) {
  const layerInfo = selectedLayers[actualLayer];
  const params = layerInfo.params as VelocityOptions;
  if (layerInfo.dataType === 'zarr-cube-velocity') {
    velocityCubeRef.current?.updateSlices({
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
    zarrCesiumRefs.cubeRef.current?.updateStyle({
      scale: params.scale,
      colormap: params.colormap,
      verticalExaggeration: params.verticalExaggeration
    });
  } else if (layerInfo.dataType === 'zarr-cube-velocity') {
    const params = layerInfo.params as VelocityOptions;
    zarrCesiumRefs.velocityCubeRef.current?.updateStyle({
      scale: params.scale,
      colormap: params.colormap,
      windOptions: params.windOptions
    });
  }
}
