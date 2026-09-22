import { useRef } from 'react';
import { ColorBar } from './colorbar';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import Draggable from 'react-draggable';
import type { LayerLegendBoxProps } from '../../types';
import { EditSelectors } from './edit-selectors';
import CancelIcon from '@mui/icons-material/Cancel';
import { EditStyle } from './edit-style';

export function LayerLegendBox({ layerLegendName }: LayerLegendBoxProps) {
  const layerLegend = useAppSelector(state => state.layers.layerLegend);
  const dispatch = useAppDispatch();

  function handleClose() {
    dispatch(layersActions.removeLayerLegend(layerLegendName));
  }

  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable nodeRef={nodeRef} handle=".legend-drag-handle" cancel=".clickable">
      <div
        className="absolute left-full top-0 z-30 ml-4 flex max-h-[calc(100vh-32px)] w-[min(360px,calc(100vw-32px))] flex-col overflow-hidden rounded-[18px] border border-white/18 bg-[rgba(17,17,17,0.92)] text-white shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-[18px] backdrop-saturate-125"
        ref={nodeRef}
        id="legend-box"
      >
        <div className="legend-drag-handle flex cursor-move items-center gap-3 border-b border-white/12 px-4 py-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#d49511]/16 text-[#d49511]">
            <span className="text-sm font-black">L</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-extrabold uppercase tracking-[.11em] text-[#888]">
              Layer controls
            </div>
            <div className="truncate text-[13px] font-bold text-[#f1f1f1]">{layerLegendName}</div>
          </div>
          <button
            type="button"
            title="Close layer controls"
            aria-label="Close layer controls"
            onClick={handleClose}
            className="clickable flex justify-center h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-[#999] hover:bg-white/8 hover:text-[#d49511]"
          >
            <CancelIcon fontSize="small" />
          </button>
        </div>
        <div className="overflow-y-auto p-3 [scrollbar-color:#555_transparent] [scrollbar-width:thin]">
          <section className="rounded-xl border border-white/12 bg-white/[.035] p-3">
            <div className="mb-2 text-[9px] font-extrabold uppercase tracking-[.1em] text-[#888]">
              Legend
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <ColorBar layerLegend={layerLegend[layerLegendName]} />
            </div>
          </section>
          <EditSelectors layerLegendName={layerLegendName} />
          <EditStyle layerLegendName={layerLegendName} />
        </div>
      </div>
    </Draggable>
  );
}
