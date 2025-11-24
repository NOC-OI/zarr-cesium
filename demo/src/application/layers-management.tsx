'use client';
import { type ReactNode, useState } from 'react';
import type { LayersLegendType, SelectedLayersType } from '../types';
import { LayersManagementHandleContext } from './use-layers';

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
        setGebcoTerrainEnabled
      }}
    >
      {children}
    </LayersManagementHandleContext.Provider>
  );
};
