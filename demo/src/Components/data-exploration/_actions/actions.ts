import { createElement, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { DEFAULT_COLORMAP, DEFAULT_OPACITY } from 'zarr-cesium';
import { layersActions, type AppDispatch } from '../../../application/store';
import type {
  DataInfoType,
  LayerNamesType,
  LayersLegendType,
  SelectedLayersType
} from '../../../types';
import { LayerInfoPanel } from '../../layer-info-panel';

export function handleChangeOpacity(
  e: ChangeEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  content: string,
  subLayer: string,
  subLayers: LayerNamesType,
  selectedLayers: SelectedLayersType
) {
  const name = `${content}_${subLayer}`;
  const selectedLayer = selectedLayers[name];
  if (!selectedLayer) return;
  dispatch(layersActions.setActualLayer(name));
  dispatch(layersActions.setLayerAction('opacity'));
  dispatch(
    layersActions.updateSelectedLayer({
      name,
      moveToFront: true,
      layer: {
        ...selectedLayer,
        params: {
          ...subLayers[subLayer].params,
          ...selectedLayer.params,
          opacity: Number(e.target.value)
        }
      }
    })
  );
}

export function getPreviousOpacityValue(content: string, selectedLayers: SelectedLayersType) {
  return selectedLayers[content].params.opacity;
}

export function handleClickLegend(
  layerInfo: DataInfoType,
  subLayer: string,
  dispatch: AppDispatch,
  content: string,
  selectedLayers?: SelectedLayersType
) {
  const name = `${content}_${subLayer}`;
  const params = selectedLayers?.[name]?.params ?? layerInfo.params;
  dispatch(
    layersActions.upsertLayerLegend({
      name,
      legend: {
        colormap: params.colormap || DEFAULT_COLORMAP,
        scale: params.scale || [0, 1],
        dataDescription: layerInfo.dataDescription || ['', '']
      }
    })
  );
}

export function verifyIfWasSelectedBefore(
  content: string,
  subLayer: string,
  selectedLayers: SelectedLayersType
) {
  return !!selectedLayers[`${content}_${subLayer}`];
}

export function handleClickSlider(setOpacityIsClicked: Dispatch<SetStateAction<boolean>>) {
  setOpacityIsClicked(value => !value);
}

export function handleClickLayerInfo(
  content: string,
  subLayer: string,
  setInfoButtonBox: any,
  layer: DataInfoType
) {
  setInfoButtonBox({
    title: 'Layer details',
    content: createElement(LayerInfoPanel, { group: content, layerId: subLayer, layer })
  });
}

export function changeMapZoom(
  layerInfo: { subLayer: string; dataInfo: DataInfoType },
  dispatch: AppDispatch,
  selectedLayers: SelectedLayersType
) {
  const layer = selectedLayers[layerInfo.subLayer];
  if (!layer) return;
  dispatch(layersActions.setLayerAction('zoom'));
  dispatch(
    layersActions.updateSelectedLayer({ name: layerInfo.subLayer, layer, moveToFront: true })
  );
}

export function addMapLayer(
  layerInfo: { subLayer: string; dataInfo: DataInfoType },
  dispatch: AppDispatch
) {
  const layer = structuredClone(layerInfo.dataInfo);
  if (layer.dataType === 'zarr-cesium') {
    layer.params.scale ||= [0, 1];
    layer.params.colormap ||= DEFAULT_COLORMAP;
  }
  layer.params.opacity = DEFAULT_OPACITY;
  dispatch(layersActions.setLayerAction('add'));
  dispatch(layersActions.addSelectedLayer({ name: layerInfo.subLayer, layer }));
}

export function removeMapLayer(
  layerInfo: { subLayer: string; dataInfo: DataInfoType },
  dispatch: AppDispatch
) {
  dispatch(layersActions.setLayerAction('remove'));
  dispatch(layersActions.removeSelectedLayer(layerInfo.subLayer));
}

export async function handleChangeMapLayerAndAddLegend(
  checked: boolean,
  layerInfo: { subLayer: string; dataInfo: DataInfoType },
  dispatch: AppDispatch,
  subLayer: string,
  layerLegend: LayersLegendType,
  content: string,
  setOpacityIsClicked?: Dispatch<SetStateAction<boolean>>
) {
  if (!checked) {
    const name = `${content}_${subLayer}`;
    if (layerLegend[name]) dispatch(layersActions.removeLayerLegend(name));
  }
  handleChangeMapLayer(checked, layerInfo, dispatch, setOpacityIsClicked);
}

export function handleChangeMapLayer(
  checked: boolean,
  layerInfo: { subLayer: string; dataInfo: DataInfoType },
  dispatch: AppDispatch,
  setOpacityIsClicked?: Dispatch<SetStateAction<boolean>>
) {
  dispatch(layersActions.setActualLayer(layerInfo.subLayer));
  if (checked) {
    addMapLayer(layerInfo, dispatch);
  } else {
    setOpacityIsClicked?.(false);
    removeMapLayer(layerInfo, dispatch);
  }
}
