import { DEFAULT_COLORMAP, DEFAULT_SCALE } from 'zarr-cesium';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import { EditColors as SharedEditColors } from 'zarr-maps-explorer';

export function EditColors({ layerLegendName }: { layerLegendName: string }) {
  const { layerLegend, selectedLayer } = useAppSelector(state => ({
    layerLegend: state.layers.layerLegend,
    selectedLayer: state.layers.selectedLayers[layerLegendName]
  }));
  const dispatch = useAppDispatch();

  const handleSubmit = ({ colormap, scale }: { colormap: string; scale: [number, number] }) => {
    dispatch(layersActions.setLayerAction('update-colors'));
    dispatch(layersActions.setActualLayer(layerLegendName));
    dispatch(
      layersActions.upsertLayerLegend({
        name: layerLegendName,
        legend: {
          ...layerLegend[layerLegendName],
          scale,
          colormap
        }
      })
    );
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: {
          ...selectedLayer,
          params: {
            ...selectedLayer.params,
            colormap,
            scale
          }
        }
      })
    );
  };

  return (
    <SharedEditColors
      id={layerLegendName}
      initialColormap={(layerLegend[layerLegendName]?.colormap || DEFAULT_COLORMAP) as never}
      initialScale={layerLegend[layerLegendName]?.scale || DEFAULT_SCALE}
      onApply={handleSubmit}
    />
  );
}
