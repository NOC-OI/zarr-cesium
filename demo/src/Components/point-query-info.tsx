import { useCallback, useMemo } from 'react';
import {
  ZarrCubeProvider,
  ZarrCubeVelocityProvider,
  type ZarrLayerProvider,
  type ZarrSelectorsProps
} from 'zarr-cesium';
import { PointQueryInfo as SharedPointQueryInfo, type PointQueryMode } from 'zarr-maps-explorer';

type QueryProvider = ZarrLayerProvider | ZarrCubeProvider | ZarrCubeVelocityProvider;

interface PointQueryInfoProps {
  provider: QueryProvider;
  layerName: string;
  longitude: number;
  latitude: number;
}

function scalarSelector(provider: QueryProvider, dimension: 'time' | 'elevation') {
  const current = provider.selectors[dimension];
  if (
    (provider instanceof ZarrCubeProvider || provider instanceof ZarrCubeVelocityProvider) &&
    dimension === 'elevation'
  ) {
    const offset = Array.isArray(current?.selected) ? Number(current.selected[0]) : 0;
    const localIndex =
      provider instanceof ZarrCubeProvider && provider.elevationSliceIndex >= 0
        ? provider.elevationSliceIndex
        : 0;
    return { selected: offset + localIndex, type: 'index' as const };
  }
  return Array.isArray(current?.selected)
    ? { selected: Number(current.selected[0]), type: 'index' as const }
    : current;
}

export function PointQueryInfo({ provider, layerName, longitude, latitude }: PointQueryInfoProps) {
  const selectors = useMemo(() => {
    const value: Record<string, ZarrSelectorsProps> = {};
    const time = scalarSelector(provider, 'time');
    const elevation = scalarSelector(provider, 'elevation');
    if (time) value.time = time;
    if (elevation) value.elevation = elevation;
    return value;
  }, [provider]);
  const position = useMemo<[number, number]>(() => [longitude, latitude], [longitude, latitude]);
  const query = useCallback(
    (mode: PointQueryMode, signal: AbortSignal) => {
      const options = { level: 'finest' as const, signal };
      if (mode === 'profile') return provider.getVerticalProfile(position, selectors, options);
      if (mode === 'time') return provider.getTimeSeries(position, selectors, options);
      return provider.queryData({ type: 'Point', coordinates: position }, selectors, options);
    },
    [position, provider, selectors]
  );

  return (
    <SharedPointQueryInfo
      layerName={layerName}
      position={position}
      hasProfile={(provider.dimensionValues.elevation?.length ?? 0) > 1}
      hasTimeSeries={(provider.dimensionValues.time?.length ?? 0) > 1}
      query={query}
    />
  );
}
