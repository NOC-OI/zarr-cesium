import { allColorScales, type ColorMapName } from 'zarr-maps-colormap';
import { DEFAULT_COLORMAP, DEFAULT_SCALE } from 'zarr-cesium';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import Slider from '@mui/material/Slider';
import { useState } from 'react';
import { Button } from '../ui/button';

export function EditColors({ layerLegendName }: { layerLegendName: string }) {
  const { layerLegend, selectedLayer } = useAppSelector(state => ({
    layerLegend: state.layers.layerLegend,
    selectedLayer: state.layers.selectedLayers[layerLegendName]
  }));
  const dispatch = useAppDispatch();

  const [scaleLimits, setScaleLimits] = useState<[number, number]>(
    layerLegend[layerLegendName]?.scale || DEFAULT_SCALE
  );
  const [colormap, setColormap] = useState<ColorMapName>(
    layerLegend[layerLegendName]?.colormap || DEFAULT_COLORMAP
  );
  const handleSubmit = () => {
    dispatch(layersActions.setLayerAction('update-colors'));
    dispatch(layersActions.setActualLayer(layerLegendName));
    dispatch(
      layersActions.upsertLayerLegend({
        name: layerLegendName,
        legend: {
          ...layerLegend[layerLegendName],
          scale: scaleLimits,
          colormap: colormap
        }
      })
    );
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: {
          ...selectedLayer,
          params: {
            ...selectedLayer.params,
            colormap: colormap,
            scale: scaleLimits
          }
        }
      })
    );
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
              onChange={(_, v) => {
                if (!Array.isArray(v)) return;
                setScaleLimits([v[0], v[1]]);
              }}
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
