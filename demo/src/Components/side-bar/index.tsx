import MapIcon from '@mui/icons-material/Map';
import React, { useEffect, useState } from 'react';
import { DataExplorationSelection } from '../data-exploration';
import { InfoButtonBox } from '../info-button-box';
import { LayerLegendBox } from '../layer-legend-box';
import { SideBarLink } from './side-bar-link';
import { DimensionsToggle } from '../dimensions-toggle';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import GitHubIcon from '@mui/icons-material/GitHub';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { AddCustomZarrData } from '../add-custom-zarr-data';
import { useContextHandle } from '../../application/use-context';

export function SideBar() {
  const [sideBarOption, setSideBarOption] = useState('');
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

  async function handleShowSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const oldSelectedSidebarOption = sideBarOption;
    if (oldSelectedSidebarOption === e.currentTarget.id) {
      setSideBarOption('');
    } else {
      setSideBarOption(e.currentTarget.id);
    }
  }

  return (
    <div className="absolute left-2 top-2 z-10 flex sm:left-4 sm:top-4">
      <div className="sidebar relative z-20 w-[min(390px,calc(100vw-16px))] sm:w-[390px]">
        <div className="sidebar__brand">
          <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-gradient-to-br from-[#efc35f] to-[#d49511] font-black text-[#1a1a1a] shadow-[0_7px_20px_rgba(212,149,17,0.24)]">
            Z
          </div>
          <div className="flex flex-1">
            <strong>Zarr-Cesium</strong>
          </div>
          <div className="flex flex-row! items-center gap-1">
            <SideBarLink
              title="Source Code"
              id="source_code"
              href="https://github.com/noc-oi/zarr-cesium"
              icon={GitHubIcon}
              iconOnly
            />
            <SideBarLink
              title="Documentation"
              id="documentation"
              href="https://noc-oi.github.io/zarr-cesium/docs/"
              icon={DescriptionIcon}
              iconOnly
            />
          </div>
        </div>
        <div className="sidebar__nav">
          <SideBarLink
            title={'Data Exploration'}
            id={'data_exploration'}
            onClick={handleShowSelection}
            active={sideBarOption === 'data_exploration'}
            icon={MapIcon}
          />
          <SideBarLink
            title={'Add Your Own Zarr Data'}
            id={'add_your_own_zarr_data'}
            onClick={handleShowSelection}
            active={sideBarOption === 'add_your_own_zarr_data'}
            icon={AddCircleIcon}
          />
        </div>
        <div>
          <DataExplorationSelection
            display={sideBarOption === 'data_exploration'}
            setInfoButtonBox={setInfoButtonBox}
          />
          <AddCustomZarrData display={sideBarOption === 'add_your_own_zarr_data'} />
        </div>
      </div>
      <DimensionsToggle />
      {Object.keys(layerLegend).map(legend => (
        <LayerLegendBox key={legend} layerLegendName={legend} />
      ))}
      {Object.keys(infoButtonBox).length !== 0 ? (
        <InfoButtonBox infoButtonBox={infoButtonBox} setInfoButtonBox={setInfoButtonBox} />
      ) : null}
    </div>
  );
}
