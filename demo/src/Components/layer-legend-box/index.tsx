import { useRef } from 'react';
import { ColorBar } from './colorbar';
import { useLayersManagementHandle } from '../../application/use-layers';
import Draggable from 'react-draggable';
import type { LayerLegendBoxProps, LayersLegendType } from '../../types';
import { EditSelectors } from './edit-selectors';
import CancelIcon from '@mui/icons-material/Cancel';
import { EditStyle } from './edit-style';

export function LayerLegendBox({ layerLegendName }: LayerLegendBoxProps) {
  const { layerLegend, setLayerLegend } = useLayersManagementHandle();

  function handleClose() {
    setLayerLegend((layerLegend: LayersLegendType) => {
      const newLayerLegend = { ...layerLegend };
      delete newLayerLegend[layerLegendName];
      return newLayerLegend;
    });
  }

  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable nodeRef={nodeRef} cancel=".clickable">
      <div
        className="absolute top-[5vh] left-full ml-4 z-30 overflow-x-auto overflow-y-auto
        min-w-60 max-w-160 max-h-[90vh] h-max
        bg-[rgba(17,17,17,0.6)] text-white
        p-2 rounded-2xl shadow-[0px_4px_4px_rgba(0,0,0,1)]"
        ref={nodeRef}
        id="legend-box"
      >
        <div className="flex justify-end pb-1">
          <CancelIcon
            onClick={handleClose}
            className="clickable cursor-pointer hover:text-yellow-500"
          />
        </div>
        <div>
          <div className="text-sm text-center pb-1.5 font-bold">LEGEND</div>
          <div className="text-sm text-center pb-1.5 font-bold">{layerLegendName}</div>
          <div className="flex flex-col justify-center items-center gap-2">
            <ColorBar layerLegend={layerLegend[layerLegendName]} />
          </div>
          <EditSelectors layerLegendName={layerLegendName} />
          <EditStyle layerLegendName={layerLegendName} />
        </div>
      </div>
    </Draggable>
  );
}
