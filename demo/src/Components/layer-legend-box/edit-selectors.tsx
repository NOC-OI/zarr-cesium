import { type CubeOptions, type VelocityOptions } from 'zarr-cesium';
import { useAppSelector } from '../../application/use-layers';
import type { DimensionLegendProps } from '../../types';
import BoundsSelector from './bounds-selector';
import DimensionSelector from './dimension-selector';

export interface EditSelectorsProps {
  layerLegendName: string;
}

export function EditSelectors({ layerLegendName }: EditSelectorsProps) {
  const selectedLayers = useAppSelector(state => state.layers.selectedLayers);
  return (
    <section className="mt-3">
      <div className="mb-2 px-1 text-[9px] font-extrabold uppercase tracking-[.1em] text-[#888]">
        Data selectors
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-white/12 bg-white/[.035] p-3 text-white">
        {(selectedLayers[layerLegendName].params as CubeOptions | VelocityOptions).bounds && (
          <BoundsSelector
            bounds={
              (selectedLayers[layerLegendName].params as CubeOptions | VelocityOptions).bounds!
            }
            layerLegendName={layerLegendName}
          />
        )}
        {selectedLayers[layerLegendName].dimensions &&
          Object.entries(
            selectedLayers[layerLegendName].dimensions as {
              [key: string]: DimensionLegendProps;
            }
          ).map(([dimension, dimObj]) => (
            <DimensionSelector
              key={dimension}
              dimension={dimension}
              values={dimObj.values}
              selectedIndex={dimObj.selected}
              totalShape={dimObj.indices}
              layerLegendName={layerLegendName}
            />
          ))}
        {(selectedLayers[layerLegendName].pyramidLevels ?? [])?.length > 0 && (
          <DimensionSelector
            dimension={'pyramidLevels'}
            values={selectedLayers[layerLegendName].pyramidLevels!}
            selectedIndex={
              (selectedLayers[layerLegendName].params as CubeOptions).multiscaleLevel as number
            }
            totalShape={undefined}
            layerLegendName={layerLegendName}
          />
        )}
      </div>
    </section>
  );
}
