import MapIcon from '@mui/icons-material/Map';
import React, { useEffect, useState } from 'react';
import { DataExplorationSelection } from '../data-exploration';
import { InfoButtonBox } from '../info-button-box';
import { LayerLegendBox } from '../layer-legend-box';
import { SideBarLink } from './side-bar-link';
import { DimensionsToggle } from '../dimensions-toggle';
import { useLayersManagementHandle } from '../../application/use-layers';
import type { InfoButtonBoxType, LayersJsonType, LayersLegendType } from '../../types';

interface SideBarProps {
  listLayers: LayersJsonType;
}

export function SideBar({ listLayers }: SideBarProps) {
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
      <div className="relative max-h-[80vh] bg-gray-900 rounded-2xl text-base p-1.5 z-20 shadow-[0px_4px_4px_rgba(0,0,0,1)]">
        <div className="flex gap-3 md:gap-6 pl-2 pr-2">
          <SideBarLink
            title={'Data Exploration'}
            id={'data_exploration'}
            onClick={handleShowSelection}
            active={sideBarOption === 'data_exploration'}
            icon={MapIcon}
          />
        </div>
        <div>
          <DataExplorationSelection
            listLayers={listLayers}
            display={sideBarOption === 'data_exploration'}
            setInfoButtonBox={setInfoButtonBox}
          />
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
