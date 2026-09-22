import { useCallback } from 'react';
import {
  DEFAULT_COLORMAP,
  DEFAULT_SCALE,
  type QueryPosition,
  type ZarrCubeProvider,
  type ZarrLayerProvider
} from 'zarr-cesium';
import { TransectQueryInfo as SharedTransectQueryInfo } from 'zarr-maps-explorer';

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

export function TransectQueryInfo({
  provider,
  layerName,
  registerCapture,
  clearCapture,
  colormap = DEFAULT_COLORMAP,
  scale = DEFAULT_SCALE
}: TransectQueryInfoProps) {
  const query = useCallback(
    (
      start: QueryPosition,
      end: QueryPosition,
      full: boolean,
      samples: number,
      signal: AbortSignal
    ) => {
      const options = { samples, concurrency: 6, signal };
      return full
        ? provider.getFullTransect(start, end, undefined, options)
        : provider.getTransect(start, end, undefined, options);
    },
    [provider]
  );

  return (
    <SharedTransectQueryInfo
      layerName={layerName}
      hasElevation={(provider.dimensionValues.elevation?.length ?? 0) > 1}
      registerCapture={registerCapture}
      clearCapture={clearCapture}
      query={query}
      colormap={colormap}
      scale={scale}
    />
  );
}
