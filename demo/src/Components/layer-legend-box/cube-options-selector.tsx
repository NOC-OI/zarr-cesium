import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import type { LayerLegendBoxProps, SelectedLayer } from '../../types';
import Slider from '@mui/material/Slider';
import {
  DEFAULT_COLORMAP,
  DEFAULT_SCALE,
  DEFAULT_VERTICAL_EXAGGERATION,
  type CubeOptions
} from 'zarr-cesium';
import type { ColorMapName } from 'zarr-maps-colormap';
import { ColormapSelect } from 'zarr-maps-explorer';

export function CubeOptionsSelector({ layerLegendName }: LayerLegendBoxProps) {
  const selectedLayers = useAppSelector(state => state.layers.selectedLayers);
  const dispatch = useAppDispatch();
  const [latSlice, setLatSlice] = useState<number>(
    selectedLayers[layerLegendName]?.slices?.latIndex || 0
  );
  const [lonSlice, setLonSlice] = useState<number>(
    selectedLayers[layerLegendName]?.slices?.lonIndex || 0
  );
  const [elevationSlice, setElevationSlice] = useState<number>(
    selectedLayers[layerLegendName]?.slices?.elevationIndex || 0
  );
  const synchronizingSlices = useRef(false);
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer>(
    selectedLayers[layerLegendName]
  );
  const [params, setParams] = useState<CubeOptions>(selectedLayer.params as CubeOptions);

  useEffect(() => {
    setSelectedLayer(selectedLayers[layerLegendName]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayers]);

  useEffect(() => {
    setParams(selectedLayer.params as CubeOptions);
  }, [selectedLayer]);

  useEffect(() => {
    if (!selectedLayer.slices) return;
    if (
      selectedLayer.slices.latIndex === latSlice &&
      selectedLayer.slices.lonIndex === lonSlice &&
      selectedLayer.slices.elevationIndex === elevationSlice
    ) {
      return;
    }
    synchronizingSlices.current = true;
    setLatSlice(selectedLayer.slices.latIndex);
    setLonSlice(selectedLayer.slices.lonIndex);
    setElevationSlice(selectedLayer.slices.elevationIndex);
    // Slice state changes are dispatched separately. This effect only reacts to
    // a new provider/Redux slice snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayer.slices]);

  const handleUpdateParams = (newParams: Partial<CubeOptions>) => {
    dispatch(layersActions.setLayerAction('update-cube-params'));
    dispatch(layersActions.setActualLayer(layerLegendName));
    const updatedParams = { ...params, ...newParams };
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: { ...selectedLayers[layerLegendName], params: updatedParams }
      })
    );
  };
  useEffect(() => {
    if (synchronizingSlices.current) {
      synchronizingSlices.current = false;
      return;
    }
    dispatch(layersActions.setLayerAction('update-cube-slices'));
    dispatch(layersActions.setActualLayer(layerLegendName));
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: {
          ...selectedLayer,
          slices: {
            latIndex: latSlice,
            lonIndex: lonSlice,
            elevationIndex: elevationSlice
          }
        }
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latSlice, lonSlice, elevationSlice]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/12 bg-white/[.035] p-4 text-white">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">
          Elevation Slice:{' '}
          {selectedLayer.dimensions!.elevation
            ? (
                selectedLayer.dimensions!.elevation.values[elevationSlice] as number
              ).toFixed(2)
            : elevationSlice}{' '}
          m
        </p>
        <Slider
          value={elevationSlice}
          min={0}
          max={selectedLayer.dimensions!.elevation.values.length - 1}
          onChange={(_, v) => setElevationSlice(v as number)}
          color="success"
          className="clickable"
        />
        <p className="text-[10px] text-gray-300">Lon × Lat plane</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">
          Latitude Slice:{' '}
          {selectedLayer.dimensions!.lat
            ? (selectedLayer.dimensions!.lat.values[latSlice] as number).toFixed(2)
            : latSlice}
          °
        </p>
        <Slider
          value={latSlice}
          min={0}
          max={selectedLayer.dimensions!.lat.values.length - 1}
          onChange={(_, v) => setLatSlice(v as number)}
          color="success"
          className="clickable"
        />
        <p className="text-[10px] text-gray-300">Lon × Elevation plane</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">
          Longitude Slice:{' '}
          {selectedLayer.dimensions!.lon
            ? (selectedLayer.dimensions!.lon.values[lonSlice] as number).toFixed(2)
            : lonSlice}
          °
        </p>
        <Slider
          value={lonSlice}
          min={0}
          max={selectedLayer.dimensions!.lon.values.length - 1}
          onChange={(_, v) => setLonSlice(v as number)}
          color="success"
          className="clickable"
        />
        <p className="text-[10px] text-gray-300">Lat × Elevation plane</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">Vertical Exaggeration</p>
        <Slider
          value={params.verticalExaggeration || DEFAULT_VERTICAL_EXAGGERATION}
          min={0}
          max={100000}
          onChange={(_, v) => handleUpdateParams({ verticalExaggeration: v as number })}
          color="success"
          className="clickable"
          valueLabelDisplay="auto"
          valueLabelFormat={idx => idx}
        />
      </div>
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
              getAriaLabel={() => 'Elevation range'}
              value={params.scale || DEFAULT_SCALE}
              min={params.scale ? params.scale[0] - 10 : DEFAULT_SCALE[0] - 10}
              max={params.scale ? params.scale[1] + 10 : DEFAULT_SCALE[1] + 10}
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
    </div>
  );
}
