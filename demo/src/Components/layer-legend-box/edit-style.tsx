import { useLayersManagementHandle } from '../../application/use-layers';
import { CubeOptionsSelector } from './cube-options-selector';
import { CubeVelocityOptionsSelector } from './cube-velocity-options-selector';
import { EditColors } from './edit-colors';
import type { EditSelectorsProps } from './edit-selectors';

export function EditStyle({ layerLegendName }: EditSelectorsProps) {
  const { selectedLayers } = useLayersManagementHandle();

  return (
    <div className="">
      <div className="text-sm text-center pt-2 pb-0 font-bold">Edit Style</div>
      {selectedLayers[layerLegendName].dataType === 'zarr-cube' && (
        <CubeOptionsSelector layerLegendName={layerLegendName} />
      )}
      {selectedLayers[layerLegendName].dataType === 'zarr-cube-velocity' && (
        <CubeVelocityOptionsSelector layerLegendName={layerLegendName} />
      )}
      {['zarr-titiler', 'zarr-cesium'].includes(selectedLayers[layerLegendName].dataType) && (
        <EditColors layerLegendName={layerLegendName} />
      )}
    </div>
  );
}
