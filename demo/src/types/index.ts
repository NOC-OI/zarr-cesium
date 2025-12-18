import type { RefObject } from 'react';
import type {
  BoundsProps,
  ZarrCubeProvider,
  ZarrCubeVelocityProvider,
  ZarrSelectorsProps
} from 'zarr-cesium';
import type { CubeOptions, LayerOptions, VelocityOptions } from 'zarr-cesium';

export interface keyable {
  [key: string]: any;
}

export interface LayerLegendBoxProps {
  layerLegendName: string;
}

export interface ZarrCesiumRefs {
  velocityRef: RefObject<ZarrCubeVelocityProvider | null>;
  cubeRef: RefObject<ZarrCubeProvider | null>;
  velocityCubeRef: RefObject<ZarrCubeVelocityProvider | null>;
}

export interface InfoButtonBoxType {
  title?: string;
  content?: string;
}

export interface TitilerOptions {
  url: string;
  variable: string;
  scale?: [number, number];
  colormap?: string;
  opacity?: number;
  selectors?: { [key: string]: ZarrSelectorsProps };
}

export interface FlashMessageType {
  messageType: string;
  content: string;
  duration?: number;
}

export interface DimensionLegendProps {
  values: (string | number)[];
  selected: number | [number, number];
  indices?: number[];
}

export interface LayersJsonType {
  [key: string]: {
    layerNames: LayerNamesType;
  };
}

export interface LayerNamesType {
  [key: string]: DataInfoType;
}

export interface DataInfoType {
  dataType: 'zarr-cesium' | 'zarr-titiler' | 'zarr-cube' | 'zarr-cube-velocity';
  dataDescription: [string, string];
  bbox?: BoundsProps;
  content?: string;
  params: CubeOptions | VelocityOptions | LayerOptions | TitilerOptions;
}

export interface LayersLegendType {
  [key: string]: LayerLegendType;
}

export interface LayerLegendType {
  dataDescription: [string, string];
  colormap: string;
  scale: [number, number];
}

export interface SelectedLayersType {
  [key: string]: SelectedLayer;
}

export interface SelectedLayer extends DataInfoType {
  dimensions?: { [key: string]: DimensionLegendProps };
  slices?: { latIndex: number; lonIndex: number; elevationIndex: number };
  pyramidLevels?: string[];
}

export interface FlashMessagesProps {
  width: 'full' | 'small' | 'medium' | 'large';
  duration: number;
  position: 'bleft' | 'bright' | 'tright' | 'tleft' | 'tcenter' | 'bcenter';
}

export interface DimensionSelectorProps {
  dimension: string;
  values: (string | number)[];
  selectedIndex: number | [number, number];
  totalShape?: number[];
  layerLegendName: string;
}

export interface DataExplorationTypeOptionsProps {
  content: string;
  subLayer: string;
  subLayers: LayerNamesType;
  setInfoButtonBox: React.Dispatch<React.SetStateAction<InfoButtonBoxType>>;
}

export interface DataExplorationTypeProps {
  content: string;
  childs: LayerNamesType;
  setInfoButtonBox: React.Dispatch<React.SetStateAction<InfoButtonBoxType>>;
}

export interface DataExplorationSelectionProps {
  display: boolean;
  setInfoButtonBox: React.Dispatch<React.SetStateAction<InfoButtonBoxType>>;
}

export interface AddCustomZarrDataProps {
  display: boolean;
}
