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
    <div className="p-2 z-40 block">
      <div className="flex justify-center font-extrabold gap-3">
        <p className="text-xs text-center font-bold">{dataDescription[0]}</p>
        <p className="text-xs text-center font-bold">{dataDescription[1]}</p>
      </div>
      <div className="flex justify-between font-extrabold">
        <p className="text-xs text-center font-bold">{Math.min(...listColorsValues).toFixed(1)}</p>
        <p className="text-xs text-center font-bold">{Math.max(...listColorsValues).toFixed(1)}</p>
      </div>
      <div className="flex">
        {listColors.map((value: number[], idx: number) => (
          <div
            className="px-[0.1rem] py-1.5"
            key={idx}
            style={{
              backgroundColor: `rgb(${value[0]},${value[1]},${value[2]})`
            }}
          >
            <p className="opacity-0">=</p>
          </div>
        ))}
      </div>
    </div>
  );
}
