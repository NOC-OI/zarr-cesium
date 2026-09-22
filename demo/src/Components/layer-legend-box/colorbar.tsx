import type { LayerLegendType } from '../../types';

interface ColorBarProps {
  layerLegend: LayerLegendType;
}
import { calculateColorsForLegend } from '../../lib/map-layers/utils';

export function ColorBar({ layerLegend }: ColorBarProps) {
  const dataDescription = layerLegend.dataDescription ? layerLegend.dataDescription : ['', ''];

  const { listColors, listColorsValues } = calculateColorsForLegend(
    layerLegend.colormap,
    layerLegend.scale,
    30
  );
  return (
    <div className="z-40 block w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="truncate text-[11px] font-bold text-[#e8e8e8]">{dataDescription[0]}</p>
        <p className="shrink-0 text-[9px] font-semibold text-[#888]">{dataDescription[1]}</p>
      </div>
      <div className="mb-1.5 flex justify-between">
        <p className="text-[9px] font-semibold tabular-nums text-[#aaa]">
          {Math.min(...listColorsValues).toFixed(1)}
        </p>
        <p className="text-[9px] font-semibold tabular-nums text-[#aaa]">
          {Math.max(...listColorsValues).toFixed(1)}
        </p>
      </div>
      <div className="flex h-3.5 overflow-hidden rounded-full ring-1 ring-white/10">
        {listColors.map((value: number[], idx: number) => (
          <div
            className="min-w-0 flex-1"
            key={idx}
            style={{
              backgroundColor: `rgb(${value[0]},${value[1]},${value[2]})`
            }}
          />
        ))}
      </div>
    </div>
  );
}
