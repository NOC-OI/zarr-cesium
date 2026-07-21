'use client';
import { type ReactNode, useEffect, useState } from 'react';
import type { DataInfoType, LayersJsonType, LayersLegendType, SelectedLayersType } from '../types';
import { LayersManagementHandleContext } from './use-layers';
import { layersJson } from './data/layers-json';

const STAC_API_URL = 'https://stac-api-dev.atlantisvis.xyz/';
const STAC_SECTION_KEY = 'stac';
const STAC_COLLECTION_ID = 'eORCA1-NPD-v1';
const STAC_DEFAULT_SCALE: [number, number] = [0, 100];

const STAC_SCALE_BY_SUFFIX: Array<{ suffix: string; scale: [number, number] }> = [
  { suffix: 'vo', scale: [-1, 1] },
  { suffix: 'uo', scale: [-1, 1] },
  { suffix: 'zos', scale: [-1, 1] },
  { suffix: 'tos_con', scale: [0, 30] },
  { suffix: 'thetao_con', scale: [0, 30] },
  { suffix: 'sowindsp', scale: [0, 40] },
  { suffix: 'sos_abs', scale: [30, 37] },
  { suffix: 'so_abs', scale: [30, 37] }
];

interface StacLink {
  rel?: string;
  href?: string;
}

interface StacAsset {
  href?: string;
  title?: string;
  type?: string;
  roles?: string[];
  'xarray:variable_name'?: string;
  standard_name?: string;
}

interface StacItem {
  id?: string;
  collection?: string;
  properties?: Record<string, any>;
  assets?: Record<string, StacAsset>;
}

interface StacFeatureCollection {
  features?: StacItem[];
  links?: StacLink[];
}

function toAbsoluteUrl(baseUrl: string, href: string) {
  return new URL(href, baseUrl).toString();
}

function normaliseLayerName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getStringFromProperties(properties: Record<string, any> | undefined, keys: string[]) {
  if (!properties) return undefined;
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function getPreferredAsset(item: StacItem): [string, StacAsset] | null {
  const assets = Object.entries(item.assets || {});
  if (assets.length === 0) return null;

  const scoredAssets = assets
    .filter(([, asset]) => typeof asset?.href === 'string' && asset.href.length > 0)
    .map(([key, asset]) => {
      const type = asset.type?.toLowerCase() || '';
      const href = asset.href?.toLowerCase() || '';
      const keyLower = key.toLowerCase();
      const roles = (asset.roles || []).map(role => role.toLowerCase());

      let score = 0;
      if (type.includes('zarr') || href.includes('.zarr') || href.includes('/zarr')) score += 5;
      if (roles.includes('data')) score += 2;
      if (keyLower.includes('data') || keyLower.includes('zarr')) score += 1;

      return { key, asset, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scoredAssets.length === 0) return null;
  return [scoredAssets[0].key, scoredAssets[0].asset];
}

function getVariableName(item: StacItem, assetKey: string, asset: StacAsset) {
  const fromProperties = getStringFromProperties(item.properties, [
    'variable',
    'variable_name',
    'stac:variable',
    'atlantis:variable'
  ]);
  return (
    fromProperties || asset['xarray:variable_name'] || assetKey || item.id || 'unknown_variable'
  );
}

function getStandardName(item: StacItem, asset: StacAsset) {
  const fromProperties = getStringFromProperties(item.properties, [
    'standard_name',
    'stac:standard_name',
    'atlantis:standard_name',
    'long_name'
  ]);
  return fromProperties || asset.standard_name || asset.title || item.id || 'Unknown';
}

function getScaleForStacItem(itemId: string | undefined, variable: string): [number, number] {
  const candidates = [itemId, variable]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map(value => value.toLowerCase());

  for (const candidate of candidates) {
    console.log(`Checking candidate for scale: ${candidate}`);
    const matchedRule = STAC_SCALE_BY_SUFFIX.find(rule => candidate.endsWith(rule.suffix));
    if (matchedRule) return matchedRule.scale;
  }

  return STAC_DEFAULT_SCALE;
}

function itemToLayerConfig(item: StacItem, baseUrl: string): [string, DataInfoType] | null {
  const preferredAsset = getPreferredAsset(item);
  if (!preferredAsset) return null;

  const [assetKey, asset] = preferredAsset;
  if (!asset.href) return null;

  const variable = getVariableName(item, assetKey, asset);
  const standardName = getStandardName(item, asset);
  const scale = getScaleForStacItem(item.id, variable);
  const baseLayerName = normaliseLayerName(item.id || variable || assetKey);
  const layerName = baseLayerName || `stac_item_${Math.random().toString(36).slice(2, 8)}`;

  return [
    layerName,
    {
      dataType: 'zarr-cesium',
      dataDescription: [standardName, ''],
      content: '',
      params: {
        url: toAbsoluteUrl(baseUrl, asset.href),
        variable,
        scale,
        crs: 'EPSG:4326',
        zarrVersion: 3,
        colormap: 'inferno',
        multiscaleFormat: 'geozarr',
        latIsAscending: true
      }
    }
  ];
}

async function fetchStacItems(apiUrl: string): Promise<StacItem[]> {
  const items: StacItem[] = [];
  let nextUrl: string | null = toAbsoluteUrl(
    apiUrl,
    `./search?limit=100&collections=${encodeURIComponent(STAC_COLLECTION_ID)}`
  );
  const maxPages = 20;
  let page = 0;

  while (nextUrl && page < maxPages) {
    page += 1;
    const response = await fetch(nextUrl);
    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as StacFeatureCollection;
    const features = (data.features || []).filter(item => item.collection === STAC_COLLECTION_ID);
    items.push(...features);

    const nextLink = (data.links || []).find(link => link.rel === 'next' && !!link.href);
    nextUrl = nextLink?.href ? toAbsoluteUrl(apiUrl, nextLink.href) : null;
  }

  if (items.length > 0) return items;

  const fallbackResponse = await fetch(
    toAbsoluteUrl(
      apiUrl,
      `./collections/${encodeURIComponent(STAC_COLLECTION_ID)}/items?limit=100`
    )
  );
  if (!fallbackResponse.ok) return [];

  const fallbackData = (await fallbackResponse.json()) as StacFeatureCollection;
  return (fallbackData.features || []).filter(item => item.collection === STAC_COLLECTION_ID);
}

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
  const [listLayers, setListLayers] = useState<LayersJsonType>(layersJson);

  const [layerLegend, setLayerLegend] = useState<LayersLegendType>({});

  useEffect(() => {
    let mounted = true;

    const loadStacLayers = async () => {
      try {
        const stacItems = await fetchStacItems(STAC_API_URL);
        const stacLayerNames: Record<string, DataInfoType> = {};

        for (const item of stacItems) {
          const mappedLayer = itemToLayerConfig(item, STAC_API_URL);
          if (!mappedLayer) continue;

          const [baseLayerName, layerData] = mappedLayer;
          let layerName = baseLayerName;
          let suffix = 1;

          while (stacLayerNames[layerName]) {
            suffix += 1;
            layerName = `${baseLayerName}_${suffix}`;
          }

          stacLayerNames[layerName] = layerData;
        }

        if (!mounted) return;
        setListLayers(previousLayers => ({
          ...previousLayers,
          [STAC_SECTION_KEY]: {
            layerNames: {
              ...(previousLayers[STAC_SECTION_KEY]?.layerNames || {}),
              ...stacLayerNames
            }
          }
        }));
      } catch {
        if (!mounted) return;
        setListLayers(previousLayers => ({
          ...previousLayers,
          [STAC_SECTION_KEY]: previousLayers[STAC_SECTION_KEY] || { layerNames: {} }
        }));
      }
    };

    void loadStacLayers();

    return () => {
      mounted = false;
    };
  }, []);

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
