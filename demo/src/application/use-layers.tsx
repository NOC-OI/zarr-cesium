'use client';
import { createContext, useContext } from 'react';
import type { LayersLegendType, SelectedLayersType } from '../types';

interface LayersManagementHandleContextType {
  selectedLayers: SelectedLayersType;
  setSelectedLayers: React.Dispatch<React.SetStateAction<SelectedLayersType>>;
  actualLayer: string;
  setActualLayer: React.Dispatch<React.SetStateAction<string>>;
  layerAction: string;
  setLayerAction: React.Dispatch<React.SetStateAction<string>>;
  layerLegend: LayersLegendType;
  setLayerLegend: React.Dispatch<React.SetStateAction<LayersLegendType>>;
  gebcoTerrainEnabled: boolean;
  setGebcoTerrainEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LayersManagementHandleContext = createContext<
  LayersManagementHandleContextType | undefined
>(undefined);

export const useLayersManagementHandle = (): LayersManagementHandleContextType => {
  const context = useContext(LayersManagementHandleContext);
  if (!context) {
    throw new Error(
      'useLayersManagementHandle must be used within a LayersManagementHandleProvider'
    );
  }
  return context;
};
