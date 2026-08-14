import type React from 'react';
import { DEFAULT_COLORMAP, DEFAULT_OPACITY } from 'zarr-cesium';
import { layersActions, type AppDispatch } from '../../../application/store';
import { ZARR_TILE_SERVER_URL } from '../../../lib/map-layers/utils';
import type {
  DataInfoType,
  LayerNamesType,
  LayersLegendType,
  SelectedLayersType,
  TitilerOptions
} from '../../../types';

export function handleChangeOpacity(
  e: React.ChangeEvent<HTMLInputElement>,
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

export function handleClickSlider(
  setOpacityIsClicked: React.Dispatch<React.SetStateAction<boolean>>
) {
  setOpacityIsClicked(value => !value);
}

export function handleClickLayerInfo(
  content: string,
  subLayer: string,
  setInfoButtonBox: any,
  selectedLayers: SelectedLayersType
) {
  setInfoButtonBox({
    title: `${content} - ${subLayer}`,
    content: selectedLayers[`${content}_${subLayer}`].content
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
  if (['zarr-titiler', 'zarr-cesium'].includes(layer.dataType)) {
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
  setOpacityIsClicked?: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (checked && layerInfo.dataInfo.dataType === 'zarr-titiler') {
    const params = layerInfo.dataInfo.params as TitilerOptions;
    const response = await fetch(
      `${ZARR_TILE_SERVER_URL}time_values?url=${encodeURIComponent(params.url)}`
    );
    Object.assign(layerInfo.dataInfo, {
      dimensions: {
        time: { values: await response.json(), selected: 0 }
      }
    });
    layerInfo.dataInfo.params.colormap ||= DEFAULT_COLORMAP;
  } else if (!checked) {
    const name = `${content}_${subLayer}`;
    if (layerLegend[name]) dispatch(layersActions.removeLayerLegend(name));
  }
  handleChangeMapLayer(checked, layerInfo, dispatch, setOpacityIsClicked);
}

export function handleChangeMapLayer(
  checked: boolean,
  layerInfo: { subLayer: string; dataInfo: DataInfoType },
  dispatch: AppDispatch,
  setOpacityIsClicked?: React.Dispatch<React.SetStateAction<boolean>>
) {
  dispatch(layersActions.setActualLayer(layerInfo.subLayer));
  if (checked) {
    addMapLayer(layerInfo, dispatch);
  } else {
    setOpacityIsClicked?.(false);
    removeMapLayer(layerInfo, dispatch);
  }
}
