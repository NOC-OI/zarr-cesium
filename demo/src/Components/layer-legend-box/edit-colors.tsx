import { allColorScales, DEFAULT_COLORMAP, DEFAULT_SCALE, type ColorMapName } from 'zarr-cesium';
import { useLayersManagementHandle } from '../../application/use-layers';
import type { LayersLegendType } from '../../types';
import Slider from '@mui/material/Slider';
import { useState } from 'react';
import { Button } from '../ui/button';

export function EditColors({ layerLegendName }: { layerLegendName: string }) {
  const { setLayerLegend, setSelectedLayers, setActualLayer, setLayerAction, layerLegend } =
    useLayersManagementHandle();

  const [scaleLimits, setScaleLimits] = useState<[number, number]>(
    layerLegend[layerLegendName]?.scale || DEFAULT_SCALE
  );
  const [colormap, setColormap] = useState<ColorMapName>(
    layerLegend[layerLegendName]?.colormap || DEFAULT_COLORMAP
  );
  const handleSubmit = () => {
    setLayerAction('update-colors');
    setActualLayer(layerLegendName);
    setLayerLegend((layerLegend: LayersLegendType) => {
      const newLayerLegend = { ...layerLegend };
      newLayerLegend[layerLegendName] = {
        ...newLayerLegend[layerLegendName],
        scale: scaleLimits,
        colormap: colormap
      };
      return newLayerLegend;
    });
    setSelectedLayers(prev => {
      const updatedLayer = {
        ...prev[layerLegendName],
        params: {
          ...prev[layerLegendName].params,
          colormap: colormap,
          scale: scaleLimits
        }
      };
      return { ...prev, [layerLegendName]: updatedLayer };
    });
  };

  return (
    <div
      className="
      mt-3 p-3 rounded-2xl
      bg-[rgba(17,17,17,0.6)] text-white
      shadow-[0px_4px_4px_rgba(0,0,0,1)]
      flex flex-col gap-3 px-4"
    >
      <div className="pt-4 flex justify-left w-full items-center gap-2">
        <p className="text-md font-bold text-white text-center">Color Scale:</p>
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-left items-center w-full">
            <select
              value={colormap}
              onChange={e => setColormap(e.target.value as ColorMapName)}
              className="clickable bg-black border border-black bg-opacity-20 text-white text-sm rounded-lg  block w-max p-2 hover:bg-opacity-80"
            >
              {allColorScales.map((allColorScale, index) => (
                <option
                  className="bg-black! bg-opacity-80! opacity-30 text-white! clickable"
                  value={allColorScale}
                  key={index}
                >
                  {allColorScale}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="p-1 pt-4 flex justify-between w-full items-center gap-4">
        <p className="text-md font-bold text-white text-center">Scale</p>
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex justify-between w-full items-center gap-4">
            <span className="text-sm text-white">{scaleLimits[0]}</span>
            <Slider
              getAriaLabel={() => 'Scale range'}
              value={scaleLimits}
              min={scaleLimits[0] - 10}
              max={scaleLimits[1] + 10}
              disableSwap
              step={0.1}
              onChange={(_, v) => setScaleLimits(v as [number, number])}
              className="clickable"
              color="success"
            />
            <span className="text-sm text-white">{scaleLimits[1]}</span>
          </div>
        </div>
      </div>
      <Button
        onClick={() => handleSubmit()}
        className="w-full text-white bg-black rounded-lg opacity-50 hover:opacity-80 flex justify-center items-center py-2! gap-2 clickable"
      >
        UPDATE LAYER
      </Button>
    </div>
  );
}
