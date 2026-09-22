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
import type { ColorMapName } from 'zarr-maps-colormap';
import { ColormapSelect } from 'zarr-maps-explorer';

export function CubeVelocityOptionsSelector({ layerLegendName }: LayerLegendBoxProps) {
  const selectedLayers = useAppSelector(state => state.layers.selectedLayers);
  const dispatch = useAppDispatch();

  const selectedLayer = selectedLayers[layerLegendName] as SelectedLayer;
  const params = selectedLayer.params as VelocityOptions;
  const windOptions = {
    ...DEFAULT_WIND_OPTIONS,
    ...(params.windOptions || {})
  };
  const elevationSelection = params.selectors?.elevation?.selected;
  const is2D = elevationSelection !== undefined && !Array.isArray(elevationSelection);

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
    <div className="flex flex-col gap-4 rounded-xl border border-white/12 bg-white/[.035] p-4 text-white">
      {!is2D && (
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
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">Color Map</p>
        <ColormapSelect
          value={(params.colormap || DEFAULT_COLORMAP) as ColorMapName}
          onChange={colormap => handleUpdateParams({ colormap })}
        />
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
            className="layer-control-input clickable"
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
            className="layer-control-input clickable"
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
            className="layer-control-input clickable"
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
            className="layer-control-input clickable"
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
            className="layer-control-input clickable"
            value={windOptions.minVisibleRatio}
            onChange={e => updateWindOptions({ minVisibleRatio: Number(e.target.value) })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
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
