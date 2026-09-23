import { useAppSelector } from '../../application/use-layers';
import { CubeOptionsSelector } from './cube-options-selector';
import { CubeVelocityOptionsSelector } from './cube-velocity-options-selector';
import { EditColors } from './edit-colors';
import type { EditSelectorsProps } from './edit-selectors';

export function EditStyle({ layerLegendName }: EditSelectorsProps) {
  const selectedLayers = useAppSelector(state => state.layers.selectedLayers);

  return (
    <section className="mt-3">
      <div className="mb-2 px-1 text-[9px] font-extrabold uppercase tracking-[.1em] text-[#888]">
        Appearance
      </div>
      {selectedLayers[layerLegendName].dataType === 'zarr-cube' && (
        <CubeOptionsSelector layerLegendName={layerLegendName} />
      )}
      {selectedLayers[layerLegendName].dataType === 'zarr-cube-velocity' && (
        <CubeVelocityOptionsSelector layerLegendName={layerLegendName} />
      )}
      {selectedLayers[layerLegendName].dataType === 'zarr-cesium' && (
        <EditColors layerLegendName={layerLegendName} />
      )}
    </section>
  );
}
