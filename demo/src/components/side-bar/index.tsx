import MapIcon from '@mui/icons-material/Map';
import React, { useEffect, useState } from 'react';
import { DataExplorationSelection } from '../data-exploration';
import { InfoButtonBox } from '../info-button-box';
import { LayerLegendBox } from '../layer-legend-box';
import { SideBarLink } from './side-bar-link';
import { DimensionsToggle } from '../dimensions-toggle';
import { useLayersManagementHandle } from '../../application/use-layers';
import type { InfoButtonBoxType, LayersLegendType } from '../../types';
import GitHubIcon from '@mui/icons-material/GitHub';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { AddCustomZarrData } from '../add-custom-zarr-data';

export function SideBar() {
  const [sideBarOption, setSideBarOption] = useState('');
  const [infoButtonBox, setInfoButtonBox] = useState<InfoButtonBoxType>({});

  const { selectedLayers, layerLegend, setLayerLegend } = useLayersManagementHandle();

  useEffect(() => {
    Object.keys(layerLegend).forEach((legend: string) => {
      if (!Object.keys(selectedLayers).includes(legend)) {
        setLayerLegend((layerLegend: LayersLegendType) => {
          const newLayerLegend = { ...layerLegend };
          delete newLayerLegend[legend];
          return newLayerLegend;
        });
      }
    });
  }, [layerLegend, selectedLayers, setLayerLegend]);

  async function handleShowSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const oldSelectedSidebarOption = sideBarOption;
    if (oldSelectedSidebarOption === e.currentTarget.id) {
      setSideBarOption('');
    } else {
      setSideBarOption(e.currentTarget.id);
    }
  }

  return (
    <div className="flex absolute left-2 top-[2vh] z-10">
      <div className="relative max-h-[80vh] bg-[rgba(17,17,17,0.6)] rounded-2xl text-base p-1.5 z-20 shadow-[0px_4px_4px_rgba(0,0,0,1)]">
        <div className="flex gap-3 md:gap-6 pl-2 pr-2">
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
          <SideBarLink
            title={'Source Code'}
            id={'source_code'}
            href={'https://github.com/noc-oi/zarr-cesium'}
            icon={GitHubIcon}
          />
          <SideBarLink
            title={'Documentation'}
            id={'documentation'}
            href={'https://noc-oi.github.io/zarr-cesium/docs/'}
            icon={DescriptionIcon}
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
