import { ColorBar } from 'zarr-maps-explorer';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import type { LayerLegendBoxProps } from '../../types';
import { EditSelectors } from './edit-selectors';
import { EditStyle } from './edit-style';
import { LegendPanel } from 'zarr-maps-explorer';

export function LayerLegendBox({ layerLegendName }: LayerLegendBoxProps) {
  const layerLegend = useAppSelector(state => state.layers.layerLegend);
  const dispatch = useAppDispatch();

  function handleClose() {
    dispatch(layersActions.removeLayerLegend(layerLegendName));
  }

  return (
    <LegendPanel
      title={layerLegendName}
      legend={<ColorBar layerLegend={layerLegend[layerLegendName]} />}
      onClose={handleClose}
    >
      <EditSelectors layerLegendName={layerLegendName} />
      <EditStyle layerLegendName={layerLegendName} />
    </LegendPanel>
  );
}
