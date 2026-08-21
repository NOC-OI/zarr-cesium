import { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import {
  ZarrCubeProvider,
  ZarrCubeVelocityProvider,
  type QueryResult,
  type ZarrLayerProvider,
  type ZarrSelectorsProps
} from 'zarr-cesium';
import { Button } from './ui/button';

type QueryProvider = ZarrLayerProvider | ZarrCubeProvider | ZarrCubeVelocityProvider;
type QueryMode = 'point' | 'profile' | 'time';

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
    const localIndex = provider instanceof ZarrCubeProvider && provider.elevationSliceIndex >= 0
      ? provider.elevationSliceIndex
      : 0;
    return { selected: offset + localIndex, type: 'index' as const };
  }
  if (Array.isArray(current?.selected)) {
    return { selected: Number(current.selected[0]), type: 'index' as const };
  }
  return current;
}

function scalarSelectors(provider: QueryProvider): Record<string, ZarrSelectorsProps> {
  const selectors: Record<string, ZarrSelectorsProps> = {};
  const time = scalarSelector(provider, 'time');
  const elevation = scalarSelector(provider, 'elevation');
  if (time) selectors.time = time;
  if (elevation) selectors.elevation = elevation;

  return selectors;
}

function chartCoordinates(result: QueryResult, mode: QueryMode): number[] {
  const dimension = mode === 'time' ? 'time' : 'elevation';
  const key = Object.keys(result.coordinates).find(name =>
    dimension === 'time'
      ? name.toLowerCase().includes('time')
      : ['elevation', 'depth', 'level', 'lev', 'z'].includes(name.toLowerCase())
  );
  const coordinates = key ? result.coordinates[key] : [];
  return result.values.map((_, index) => {
    const coordinate = coordinates[index];
    if (typeof coordinate === 'number') return coordinate;
    if (typeof coordinate === 'string') {
      const timestamp = Date.parse(coordinate);
      if (Number.isFinite(timestamp)) return timestamp / 1000;
      const numeric = Number(coordinate);
      if (Number.isFinite(numeric)) return numeric;
    }
    return index;
  });
}

function QueryChart({ result, mode }: { result: QueryResult; mode: Exclude<QueryMode, 'point'> }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || result.values.length === 0) return;
    const commonAxis = { stroke: '#e5e7eb', grid: { stroke: '#4b5563' } };
    const coordinates = chartCoordinates(result, mode);
    const chart =
      mode === 'profile'
        ? new uPlot(
            {
              mode: 2,
              width: 380,
              height: 220,
              scales: {
                x: { time: false },
                y: { time: false, dir: -1 }
              },
              series: [
                {},
                {
                  label: result.variable,
                  stroke: '#facc15',
                  width: 2,
                  points: { show: true, size: 4 },
                  facets: [
                    { scale: 'x', sorted: 0 },
                    { scale: 'y', sorted: 1 }
                  ]
                }
              ],
              axes: [
                { ...commonAxis, scale: 'x', label: result.variable },
                { ...commonAxis, scale: 'y', label: 'Elevation / depth' }
              ],
            },
            [[], [result.values, coordinates]] as unknown as uPlot.AlignedData,
            chartRef.current
          )
        : new uPlot(
            {
              width: 380,
              height: 220,
              scales: { x: { time: true } },
              series: [
                { label: 'Time' },
                {
                  label: result.variable,
                  stroke: '#facc15',
                  width: 2,
                  points: { show: true, size: 4 }
                }
              ],
              axes: [commonAxis, commonAxis],
            },
            [coordinates, result.values],
            chartRef.current
          );
    return () => chart.destroy();
  }, [mode, result]);

  return <div className="clickable mt-3 overflow-x-auto" ref={chartRef} />;
}

export function PointQueryInfo({ provider, layerName, longitude, latitude }: PointQueryInfoProps) {
  const [mode, setMode] = useState<QueryMode>('point');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasProfile = (provider.dimensionValues.elevation?.length ?? 0) > 1;
  const hasTimeSeries = (provider.dimensionValues.time?.length ?? 0) > 1;
  const selectors = useMemo(() => scalarSelectors(provider), [provider]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const position: [number, number] = [longitude, latitude];
    const options = { level: 'finest' as const, signal: controller.signal };
    const query =
      mode === 'profile'
        ? provider.getVerticalProfile(position, selectors, options)
        : mode === 'time'
          ? provider.getTimeSeries(position, selectors, options)
          : provider.queryData({ type: 'Point', coordinates: position }, selectors, options);
    void query
      .then(setResult)
      .catch(queryError => {
        if (!controller.signal.aborted) {
          setError(queryError instanceof Error ? queryError.message : 'Query failed');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [latitude, longitude, mode, provider, selectors]);

  return (
    <div className="text-sm">
      <div className="truncate" title={layerName}>
        Layer: {layerName}
      </div>
      <div>
        Position: {longitude.toFixed(4)}, {latitude.toFixed(4)}
      </div>
      <div className="clickable mt-3 flex gap-1">
        <Button
          className={`w-full text-white bg-black rounded-lg opacity-50 hover:opacity-80 flex justify-center items-center py-2! gap-2 clickable ${mode === 'point' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
          onClick={() => setMode('point')}
        >
            Point
        </Button>
          {hasProfile ? (
        <Button
          className={`w-full text-white bg-black rounded-lg opacity-50 hover:opacity-80 flex justify-center items-center py-2! gap-2 clickable ${mode === 'profile' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
              onClick={() => setMode('profile')}
        >
            Profile
        </Button>

          ) : null}
          {hasTimeSeries ? (
        <Button
          className={`w-full text-white bg-black rounded-lg opacity-50 hover:opacity-80 flex justify-center items-center py-2! gap-2 clickable ${mode === 'time' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
          onClick={() => setMode('time')}
        >
            Time series
        </Button>
          ) : null}
      </div>
      {loading ? <div className="mt-3 text-yellow-300">Querying…</div> : null}
      {error ? <div className="mt-3 text-red-300">{error}</div> : null}
      {!loading && !error && result ? (
        result.values.length ? (
          <>
            <div className="mt-3">
              {mode === 'point'
                ? `${result.variable}: ${result.values[0]}`
                : `${result.values.length} ${mode === 'time' ? 'time samples' : 'profile samples'}`}
            </div>
            {mode === 'point' && 'components' in result ? (
              <div className="mt-1 text-gray-300">
                U: {(result as { components: { u: number[]; v: number[] } }).components.u[0]},{' '}
                V: {(result as { components: { u: number[]; v: number[] } }).components.v[0]}
              </div>
            ) : null}
            {mode !== 'point' ? <QueryChart result={result} mode={mode} /> : null}
          </>
        ) : (
          <div className="mt-3 text-gray-300">No data at this position.</div>
        )
      ) : null}
    </div>
  );
}
