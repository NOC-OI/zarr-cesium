import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import type { LayerLegendBoxProps, SelectedLayer } from '../../types';
import Slider from '@mui/material/Slider';
import {
  DEFAULT_COLORMAP,
  DEFAULT_SCALE,
  DEFAULT_VERTICAL_EXAGGERATION,
  DEFAULT_WIND_OPTIONS,
  type VelocityOptions
} from 'zarr-cesium';
import { allColorScales, type ColorMapName } from 'zarr-maps-colormap';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export function CubeVelocityOptionsSelector({ layerLegendName }: LayerLegendBoxProps) {
  const selectedLayers = useAppSelector(state => state.layers.selectedLayers);
  const dispatch = useAppDispatch();

  const selectedLayer = selectedLayers[layerLegendName] as SelectedLayer;
  const params = selectedLayer.params as VelocityOptions;
  const windOptions = {
    ...DEFAULT_WIND_OPTIONS,
    ...(params.windOptions || {})
  };

  const handleUpdateParams = (newParams: Partial<VelocityOptions>) => {
    dispatch(layersActions.setLayerAction('update-cube-params'));
    dispatch(layersActions.setActualLayer(layerLegendName));

    const selectedLayer = selectedLayers[layerLegendName] as SelectedLayer;
    const params = selectedLayer.params as VelocityOptions;
    const updatedParams = { ...params, ...newParams };

    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: { ...selectedLayer, params: updatedParams }
      })
    );
  };
  const handleUpdateSlice = (newParams: Partial<{ verticalExaggeration: number }>) => {
    dispatch(layersActions.setLayerAction('update-velocity-slices'));
    dispatch(layersActions.setActualLayer(layerLegendName));
    const selectedLayer = selectedLayers[layerLegendName] as SelectedLayer;
    const params = selectedLayer.params as VelocityOptions;
    const updatedParams = { ...params, ...newParams };
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: { ...selectedLayer, params: updatedParams }
      })
    );
  };

  const updateWindOptions = (newWind: Partial<VelocityOptions['windOptions']>) => {
    handleUpdateParams({
      windOptions: {
        ...windOptions,
        ...newWind
      }
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
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">Vertical Exaggeration</p>
        <Slider
          value={params.verticalExaggeration || DEFAULT_VERTICAL_EXAGGERATION}
          min={0}
          max={100000}
          onChange={(_, v) => handleUpdateSlice({ verticalExaggeration: v as number })}
          color="success"
          className="clickable"
          valueLabelDisplay="auto"
          valueLabelFormat={idx => idx}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">Color Map</p>
        <FormControl fullWidth size="small">
          <Select
            value={params.colormap || DEFAULT_COLORMAP}
            onChange={e => handleUpdateParams({ colormap: e.target.value as ColorMapName })}
            className="text-white clickable"
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              '.MuiSvgIcon-root': { color: 'white' }
            }}
          >
            {allColorScales.map((color: string) => (
              <MenuItem key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">Min / Max Scale</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-white">
              {params.scale ? params.scale[0] : DEFAULT_SCALE[0]}
            </span>
            <Slider
              value={params.scale || DEFAULT_SCALE}
              min={params.scale ? params.scale[0] - 4 : DEFAULT_SCALE[0] - 4}
              max={params.scale ? params.scale[1] + 4 : DEFAULT_SCALE[1] + 4}
              disableSwap
              step={0.1}
              onChange={(_, v) => {
                if (!Array.isArray(v)) return;
                handleUpdateParams({ scale: [v[0], v[1]] });
              }}
              className="clickable"
              color="success"
            />
            <span className="text-sm text-white">
              {params.scale ? params.scale[1] : DEFAULT_SCALE[1]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-2 border-t border-white/20">
        <div className="text-[12px] font-bold">Wind Options</div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Speed Factor</p>
          <input
            type="text"
            className="w-full rounded-lg px-2 py-1 bg-black bg-opacity-30 text-white text-[12px] clickable"
            value={windOptions.speedFactor}
            onChange={e => updateWindOptions({ speedFactor: JSON.parse(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Line Width</p>
          <div className="flex items-center gap-3">
            <Slider
              value={[windOptions.lineWidth!.min, windOptions.lineWidth!.max]}
              min={0}
              max={20}
              disableSwap
              onChange={(_, v) => {
                if (!Array.isArray(v)) return;
                updateWindOptions({ lineWidth: { min: v[0], max: v[1] } });
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={idx => idx}
              className="clickable"
              color="success"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Particles Texture Size</p>
          <input
            type="text"
            className="w-full rounded-lg px-2 py-1 bg-black bg-opacity-30 text-white text-[12px] clickable"
            value={windOptions.particlesTextureSize}
            onChange={e => updateWindOptions({ particlesTextureSize: JSON.parse(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Line Length</p>
          <div className="flex items-center gap-3">
            <Slider
              value={[windOptions.lineLength!.min, windOptions.lineLength!.max]}
              min={0}
              max={10000}
              disableSwap
              onChange={(_, v) => {
                if (!Array.isArray(v)) return;
                updateWindOptions({ lineLength: { min: v[0], max: v[1] } });
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={idx => idx}
              className="clickable"
              color="success"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Drop Rate</p>
          <input
            type="number"
            min={0}
            max={1}
            step={0.001}
            className="w-full rounded-lg px-2 py-1 bg-black bg-opacity-30 text-white text-[12px] clickable"
            value={windOptions.dropRate}
            onChange={e => updateWindOptions({ dropRate: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Drop Rate Bump</p>
          <input
            type="number"
            min={0}
            max={1}
            step={0.001}
            className="w-full rounded-lg px-2 py-1 bg-black bg-opacity-30 text-white text-[12px] clickable"
            value={windOptions.dropRateBump}
            onChange={e => updateWindOptions({ dropRateBump: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold">Minimum Visible Ratio</p>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            className="w-full rounded-lg px-2 py-1 bg-black bg-opacity-30 text-white text-[12px] clickable"
            value={windOptions.minVisibleRatio}
            onChange={e => updateWindOptions({ minVisibleRatio: Number(e.target.value) })}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex items-center gap-1 text-[11px]">
            <input
              type="checkbox"
              className="clickable"
              checked={windOptions.flipY}
              onChange={e => updateWindOptions({ flipY: e.target.checked })}
            />
            Flip Y
          </label>
          <label className="flex items-center gap-1 text-[11px]">
            <input
              type="checkbox"
              className="clickable"
              checked={windOptions.useViewerBounds}
              onChange={e => updateWindOptions({ useViewerBounds: e.target.checked })}
            />
            Viewer Bounds
          </label>
          <label className="flex items-center gap-1 text-[11px]">
            <input
              type="checkbox"
              className="clickable"
              checked={windOptions.dynamic}
              onChange={e => updateWindOptions({ dynamic: e.target.checked })}
            />
            Dynamic
          </label>
        </div>
      </div>
    </div>
  );
}
