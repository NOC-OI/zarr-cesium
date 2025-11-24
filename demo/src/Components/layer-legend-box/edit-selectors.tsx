import { type CubeOptions, type VelocityOptions } from 'zarr-cesium';
import { useLayersManagementHandle } from '../../application/use-layers';
import type { DimensionLegendProps } from '../../types';
import BoundsSelector from './bounds-selector';
import DimensionSelector from './dimension-selector';

export interface EditSelectorsProps {
  layerLegendName: string;
}

export function EditSelectors({ layerLegendName }: EditSelectorsProps) {
  const { selectedLayers } = useLayersManagementHandle();

  return (
    <div className="p-0">
      <div className="text-sm text-center pt-2 pb-0 font-bold">Edit Selectors</div>
      <div
        className="
      mt-3 p-3 rounded-2xl
      bg-[rgba(17,17,17,0.6)] text-white
      shadow-[0px_4px_4px_rgba(0,0,0,1)]
      flex flex-col gap-3 px-4"
      >
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
    </div>
  );
}
