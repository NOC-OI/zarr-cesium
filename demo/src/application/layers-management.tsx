'use client';
import { type ReactNode, useState } from 'react';
import type { LayersLegendType, SelectedLayersType } from '../types';
import { LayersManagementHandleContext } from './use-layers';
import { layersJson } from './data/layers-json';

interface LayersManagementHandleProviderProps {
  children: ReactNode;
}

export const LayersManagementHandleProvider: React.FC<LayersManagementHandleProviderProps> = ({
  children
}) => {
  const [selectedLayers, setSelectedLayers] = useState<SelectedLayersType>({});

  const [actualLayer, setActualLayer] = useState<string>('');

  const [layerAction, setLayerAction] = useState('');
  const [gebcoTerrainEnabled, setGebcoTerrainEnabled] = useState(false);
  const [listLayers, setListLayers] = useState<any>(layersJson);

  const [layerLegend, setLayerLegend] = useState<LayersLegendType>({});

  return (
    <LayersManagementHandleContext.Provider
      value={{
        selectedLayers,
        setSelectedLayers,
        actualLayer,
        setActualLayer,
        layerAction,
        setLayerAction,
        layerLegend,
        setLayerLegend,
        gebcoTerrainEnabled,
        setGebcoTerrainEnabled,
        listLayers,
        setListLayers
      }}
    >
      {children}
    </LayersManagementHandleContext.Provider>
  );
};
