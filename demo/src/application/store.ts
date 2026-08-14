import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type {
  DataInfoType,
  LayerLegendType,
  LayersJsonType,
  LayersLegendType,
  SelectedLayer,
  SelectedLayersType
} from '../types';
import { layersJson } from './data/layers-json';

const URL_LAYERS_PARAM = 'layers';
const URL_STATE_VERSION = 1;

type JsonObject = Record<string, unknown>;

interface ShareableLayer {
  r: string;
  o?: JsonObject;
  c?: SelectedLayer;
}

interface ShareableState {
  v: typeof URL_STATE_VERSION;
  l: ShareableLayer[];
}

export interface LayersState {
  selectedLayers: SelectedLayersType;
  actualLayer: string;
  layerAction: string;
  layerLegend: LayersLegendType;
  gebcoTerrainEnabled: boolean;
  listLayers: LayersJsonType;
}

function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function findCatalogLayer(reference: string): SelectedLayer | undefined {
  for (const [group, entry] of Object.entries(layersJson)) {
    for (const [name, layer] of Object.entries(entry.layerNames)) {
      if (`${group}_${name}` === reference) return structuredClone(layer);
    }
  }
}

function getOverrides(value: unknown, base: unknown): unknown {
  if (Array.isArray(value)) {
    return JSON.stringify(value) === JSON.stringify(base) ? undefined : value;
  }
  if (isPlainObject(value) && isPlainObject(base)) {
    const overrides = Object.fromEntries(
      Object.entries(value)
        .map(([key, child]) => [key, getOverrides(child, base[key])])
        .filter(([, child]) => child !== undefined)
    );
    return Object.keys(overrides).length ? overrides : undefined;
  }
  return Object.is(value, base) ? undefined : value;
}

function mergeOverrides<T>(base: T, overrides: unknown): T {
  if (overrides === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(overrides)) return overrides as T;
  const merged: JsonObject = { ...base };
  Object.entries(overrides).forEach(([key, value]) => {
    merged[key] =
      isPlainObject(value) && isPlainObject(merged[key])
        ? mergeOverrides(merged[key], value)
        : value;
  });
  return merged as T;
}

function removeRuntimeMetadata(layer: SelectedLayer): SelectedLayer {
  const shareable = structuredClone(layer);
  delete shareable.dimensions;
  delete shareable.pyramidLevels;
  return shareable;
}

function createShareableState(selectedLayers: SelectedLayersType): ShareableState {
  return {
    v: URL_STATE_VERSION,
    l: Object.entries(selectedLayers).map(([reference, selectedLayer]) => {
      const layer = removeRuntimeMetadata(selectedLayer);
      const catalogLayer = findCatalogLayer(reference);
      if (!catalogLayer) return { r: reference, c: layer };
      const overrides = getOverrides(layer, catalogLayer);
      return overrides ? { r: reference, o: overrides as JsonObject } : { r: reference };
    })
  };
}

function restoreShareableState(state: unknown): SelectedLayersType {
  if (!isPlainObject(state) || state.v !== URL_STATE_VERSION || !Array.isArray(state.l)) return {};
  return Object.fromEntries(
    state.l.flatMap(item => {
      if (!isPlainObject(item) || typeof item.r !== 'string') return [];
      const catalogLayer = findCatalogLayer(item.r);
      const layer = catalogLayer
        ? mergeOverrides(catalogLayer, item.o)
        : isPlainObject(item.c)
          ? (item.c as unknown as SelectedLayer)
          : undefined;
      return layer ? [[item.r, layer] as const] : [];
    })
  );
}

function readLayersFromUrl(): SelectedLayersType {
  if (typeof window === 'undefined') return {};
  const value = new URL(window.location.href).searchParams.get(URL_LAYERS_PARAM);
  if (!value) return {};

  try {
    if (value.startsWith('{')) {
      const legacy = JSON.parse(value);
      return isPlainObject(legacy) ? (legacy as SelectedLayersType) : {};
    }
    const decompressed = decompressFromEncodedURIComponent(value);
    return decompressed ? restoreShareableState(JSON.parse(decompressed)) : {};
  } catch {
    // A malformed shared URL should not prevent the demo from loading.
    return {};
  }
}

function createLayerList(selectedLayers: SelectedLayersType): LayersJsonType {
  const list = structuredClone(layersJson);
  Object.entries(selectedLayers).forEach(([name, layer]) => {
    const separator = name.indexOf('_');
    if (separator === -1) return;
    const group = name.slice(0, separator);
    const layerName = name.slice(separator + 1);
    if (!list[group]) list[group] = { layerNames: {} };
    if (!list[group].layerNames[layerName]) list[group].layerNames[layerName] = layer;
  });
  return list;
}

const initialSelectedLayers = readLayersFromUrl();

const initialState: LayersState = {
  selectedLayers: initialSelectedLayers,
  actualLayer: '',
  layerAction: '',
  layerLegend: {},
  gebcoTerrainEnabled: false,
  listLayers: createLayerList(initialSelectedLayers)
};

const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    addSelectedLayer(state, action: PayloadAction<{ name: string; layer: SelectedLayer }>) {
      state.selectedLayers = {
        [action.payload.name]: action.payload.layer,
        ...state.selectedLayers
      };
    },
    updateSelectedLayer(
      state,
      action: PayloadAction<{ name: string; layer: SelectedLayer; moveToFront?: boolean }>
    ) {
      if (action.payload.moveToFront) {
        delete state.selectedLayers[action.payload.name];
        state.selectedLayers = {
          [action.payload.name]: action.payload.layer,
          ...state.selectedLayers
        };
      } else {
        state.selectedLayers[action.payload.name] = action.payload.layer;
      }
    },
    removeSelectedLayer(state, action: PayloadAction<string>) {
      delete state.selectedLayers[action.payload];
    },
    setActualLayer(state, action: PayloadAction<string>) {
      state.actualLayer = action.payload;
    },
    setLayerAction(state, action: PayloadAction<string>) {
      state.layerAction = action.payload;
    },
    upsertLayerLegend(state, action: PayloadAction<{ name: string; legend: LayerLegendType }>) {
      state.layerLegend[action.payload.name] = action.payload.legend;
    },
    removeLayerLegend(state, action: PayloadAction<string>) {
      delete state.layerLegend[action.payload];
    },
    setGebcoTerrainEnabled(state, action: PayloadAction<boolean>) {
      state.gebcoTerrainEnabled = action.payload;
    },
    addListLayer(
      state,
      action: PayloadAction<{ group: string; name: string; layer: DataInfoType }>
    ) {
      if (!state.listLayers[action.payload.group]) {
        state.listLayers[action.payload.group] = { layerNames: {} };
      }
      state.listLayers[action.payload.group].layerNames[action.payload.name] = action.payload.layer;
    }
  }
});

export const layersActions = layersSlice.actions;

export const store = configureStore({
  reducer: { layers: layersSlice.reducer }
});

let previousUrlLayers = store.getState().layers.selectedLayers;
store.subscribe(() => {
  const selectedLayers = store.getState().layers.selectedLayers;
  if (selectedLayers === previousUrlLayers || typeof window === 'undefined') return;
  previousUrlLayers = selectedLayers;

  const url = new URL(window.location.href);
  if (Object.keys(selectedLayers).length) {
    const state = createShareableState(selectedLayers);
    url.searchParams.set(URL_LAYERS_PARAM, compressToEncodedURIComponent(JSON.stringify(state)));
  } else {
    url.searchParams.delete(URL_LAYERS_PARAM);
  }
  window.history.replaceState(window.history.state, '', url);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
