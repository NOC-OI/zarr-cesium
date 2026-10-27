import { useEffect } from 'react';
import { DataExplorationSelection } from '../data-exploration';
import { LayerLegendBox } from '../layer-legend-box';
import { ExplorerSidebar, InfoButtonBox } from 'zarr-maps-explorer';
import { DimensionsToggle } from '../dimensions-toggle';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import { useContextHandle } from '../../application/use-context';

export function SideBar() {
  const { infoButtonBox, setInfoButtonBox } = useContextHandle();

  const { selectedLayers, layerLegend } = useAppSelector(state => state.layers);
  const dispatch = useAppDispatch();

  useEffect(() => {
    Object.keys(layerLegend).forEach((legend: string) => {
      if (!Object.keys(selectedLayers).includes(legend)) {
        dispatch(layersActions.removeLayerLegend(legend));
      }
    });
  }, [dispatch, layerLegend, selectedLayers]);

  useEffect(() => {
    if (infoButtonBox.layerName && !selectedLayers[infoButtonBox.layerName]) {
      setInfoButtonBox({});
    }
  }, [infoButtonBox.layerName, selectedLayers, setInfoButtonBox]);

  function handleRemoveAllLayers() {
    if (!Object.keys(selectedLayers).length) return;
    setInfoButtonBox({});
    dispatch(layersActions.removeAllLayers());
  }

  return (
    <ExplorerSidebar
      brand="Zarr-Cesium"
      sourceUrl="https://github.com/noc-oi/zarr-cesium"
      documentationUrl="https://noc-oi.github.io/zarr-cesium/docs/"
      onRemoveAll={handleRemoveAllLayers}
      renderCatalog={visible => (
        <DataExplorationSelection display={visible} setInfoButtonBox={setInfoButtonBox} />
      )}
      adjacentControl={<DimensionsToggle />}
    >
      {Object.keys(layerLegend).map(legend => (
        <LayerLegendBox key={legend} layerLegendName={legend} />
      ))}
      {Object.keys(infoButtonBox).length !== 0 ? (
        <InfoButtonBox
          infoButtonBox={infoButtonBox}
          setInfoButtonBox={setInfoButtonBox}
          emptyValue={{}}
        />
      ) : null}
    </ExplorerSidebar>
  );
}
