import { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import type {
  FullTransectResult,
  QueryPosition,
  TransectResult,
  ZarrCubeProvider,
  ZarrLayerProvider
} from 'zarr-cesium';
import { colormapBuilder } from 'zarr-maps-colormap';
import { DEFAULT_COLORMAP, DEFAULT_SCALE } from 'zarr-cesium';
import { CustomSwitch } from './ui/custom-switch';
import { Button } from './ui/button';

type QueryProvider = ZarrLayerProvider | ZarrCubeProvider;
type CaptureHandler = ((position: QueryPosition) => void) | null;

interface TransectQueryInfoProps {
  provider: QueryProvider;
  layerName: string;
  registerCapture: (handler: CaptureHandler) => void;
  clearCapture: () => void;
  colormap?: string;
  scale?: [number, number];
}

function TransectLineChart({ result }: { result: TransectResult }) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = new uPlot(
      {
        width: 420,
        height: 240,
        scales: { x: { time: false }, y: { time: false } },
        series: [
          { label: 'Distance (km)' },
          { label: result.variable, stroke: '#facc15', width: 2, points: { show: true, size: 5 } }
        ],
        axes: [
          { label: 'Distance (km)', stroke: '#e5e7eb', grid: { stroke: '#4b5563' } },
          { label: result.variable, stroke: '#e5e7eb', grid: { stroke: '#4b5563' } }
        ]
      },
      [result.distancesKm, result.values],
      chartRef.current
    );
    return () => chart.destroy();
  }, [result]);
  return <div className="clickable mt-3 overflow-x-auto" ref={chartRef} />;
}

function FullTransectChart({
  result,
  colormap,
  scale
}: {
  result: FullTransectResult;
  colormap: string;
  scale: [number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useMemo(() => colormapBuilder(colormap, 'css', 256) as string[], [colormap]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const rows = result.values.length;
    const columns = result.positions.length;
    if (!canvas || !rows || !columns) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    if (!result.values.flat().some((value: number | null) => value !== null)) return;
    const [minimum, maximum] = scale;
    const image = context.createImageData(canvas.width, canvas.height);
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = canvas.width;
    colorCanvas.height = canvas.height;
    const colorContext = colorCanvas.getContext('2d')!;
    for (let y = 0; y < canvas.height; y++) {
      const rowPosition = rows === 1 ? 0 : (1 - y / (canvas.height - 1)) * (rows - 1);
      const row0 = Math.floor(rowPosition);
      const row1 = Math.min(rows - 1, row0 + 1);
      const rowFraction = rowPosition - row0;
      for (let x = 0; x < canvas.width; x++) {
        const columnPosition = columns === 1 ? 0 : (x / (canvas.width - 1)) * (columns - 1);
        const column0 = Math.floor(columnPosition);
        const column1 = Math.min(columns - 1, column0 + 1);
        const columnFraction = columnPosition - column0;
        const samples = [
          [result.values[row0][column0], (1 - rowFraction) * (1 - columnFraction)],
          [result.values[row0][column1], (1 - rowFraction) * columnFraction],
          [result.values[row1][column0], rowFraction * (1 - columnFraction)],
          [result.values[row1][column1], rowFraction * columnFraction]
        ] as const;
        let weightedValue = 0;
        let weight = 0;
        for (const [sample, sampleWeight] of samples) {
          if (sample !== null) {
            weightedValue += sample * sampleWeight;
            weight += sampleWeight;
          }
        }
        if (weight > 0) {
          const value = weightedValue / weight;
          const ratio =
            maximum === minimum
              ? 0.5
              : Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
          colorContext.fillStyle = colors[Math.round(ratio * (colors.length - 1))];
          colorContext.fillRect(x, y, 1, 1);
        }
      }
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(image, 0, 0);
    context.drawImage(colorCanvas, 0, 0);
  }, [colors, result, scale]);

  const elevationMinimum = result.elevations[0];
  const elevationMaximum = result.elevations.at(-1);
  const gradient = `linear-gradient(to top, ${colors.join(',')})`;

  return (
    <div className="clickable mt-3">
      <div className="flex items-stretch gap-2">
        <span className="text-xs [writing-mode:vertical-rl] rotate-180">Elevation / depth</span>
        <div className="flex flex-col justify-between text-right text-xs">
          <span>{Number(elevationMaximum).toFixed(2)}</span>
          <span>{Number(elevationMinimum).toFixed(2)}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={420}
          height={240}
          className="max-w-full border border-gray-500"
        />
        <div className="flex gap-1 text-xs">
          <div className="h-60 w-3 border border-gray-500" style={{ background: gradient }} />
          <div className="flex flex-col justify-between">
            <span>{scale[1]}</span>
            <span>{scale[0]}</span>
          </div>
        </div>
      </div>
      <div className="ml-8 text-center text-xs">
        Distance (km): 0 – {result.distancesKm.at(-1)?.toFixed(1)}
      </div>
      <div className="ml-8 text-center text-xs">{result.variable}</div>
    </div>
  );
}

export function TransectQueryInfo({
  provider,
  layerName,
  registerCapture,
  clearCapture,
  colormap = DEFAULT_COLORMAP,
  scale = DEFAULT_SCALE
}: TransectQueryInfoProps) {
  const [fullTransect, setFullTransect] = useState(false);
  const [samples, setSamples] = useState(10);
  const [points, setPoints] = useState<QueryPosition[]>([]);
  const [result, setResult] = useState<TransectResult | FullTransectResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const hasElevation = (provider.dimensionValues.elevation?.length ?? 0) > 1;

  useEffect(
    () => () => {
      abortRef.current?.abort();
      clearCapture();
    },
    [clearCapture]
  );

  useEffect(() => {
    if (points.length !== 2) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    setResult(null);
    const options = { samples, concurrency: 6, signal: controller.signal };
    const query = fullTransect
      ? provider.getFullTransect(points[0], points[1], undefined, options)
      : provider.getTransect(points[0], points[1], undefined, options);
    void query
      .then(setResult)
      .catch(queryError => {
        if (!controller.signal.aborted) {
          setError(queryError instanceof Error ? queryError.message : 'Transect query failed');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [fullTransect, points, provider, samples]);

  function startCapture() {
    abortRef.current?.abort();
    setPoints([]);
    setResult(null);
    setError('');
    const captured: QueryPosition[] = [];
    registerCapture(position => {
      captured.push(position);
      setPoints([...captured]);
      if (captured.length !== 2) return;
      registerCapture(null);
    });
  }

  return (
    <div className="text-sm">
      <div className="truncate" title={layerName}>
        Layer: {layerName}
      </div>
      <div className="flex justify-between">
        <div className="clickable mt-3 flex items-center gap-0">
          <span>Single-level</span>
          <CustomSwitch
            checked={fullTransect}
            disabled={!hasElevation}
            onChange={(checked: boolean) => setFullTransect(checked)}
            id="full-transect-switch"
          />
          <span>Full vertical</span>
        </div>
        <label className="clickable mt-3 flex items-center gap-3">
          Num. Samples
          <input
            type="number"
            min={2}
            max={500}
            value={samples}
            onChange={event =>
              setSamples(Math.max(2, Math.min(500, Number(event.target.value) || 2)))
            }
            className="w-20 rounded bg-gray-800 px-2 py-1 text-white"
          />
        </label>
      </div>
      <Button
        onClick={startCapture}
        className="w-full text-white bg-black rounded-lg opacity-50 hover:opacity-80 flex justify-center items-center py-2! gap-2 clickable"
      >
        Select two map points
      </Button>
      <div className="mt-2 text-gray-300">
        {points.length === 0
          ? 'Click the button, then select the start and end points.'
          : points.length === 1
            ? 'Start selected. Choose the end point.'
            : 'Two points selected.'}
      </div>
      {points.length > 0 ? (
        <div className="mt-2 space-y-1 font-mono text-xs">
          <div>
            Start: lon {points[0][0].toFixed(5)}, lat {points[0][1].toFixed(5)}
          </div>
          {points[1] ? (
            <div>
              End: lon {points[1][0].toFixed(5)}, lat {points[1][1].toFixed(5)}
            </div>
          ) : null}
        </div>
      ) : null}
      {loading ? <div className="mt-3 text-yellow-300">Querying transect…</div> : null}
      {error ? <div className="mt-3 text-red-300">{error}</div> : null}
      {!loading && result ? (
        'elevations' in result ? (
          <FullTransectChart result={result} colormap={colormap} scale={scale} />
        ) : (
          <TransectLineChart result={result} />
        )
      ) : null}
    </div>
  );
}
