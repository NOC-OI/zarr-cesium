import { useEffect, useState } from 'react';
import { useLayersManagementHandle } from '../../application/use-layers';
import type { LayerLegendBoxProps, SelectedLayer } from '../../types';
import Slider from '@mui/material/Slider';
import {
  allColorScales,
  DEFAULT_COLORMAP,
  DEFAULT_SCALE,
  DEFAULT_VERTICAL_EXAGGERATION,
  type ColorMapName,
  type CubeOptions
} from 'zarr-cesium';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export function CubeOptionsSelector({ layerLegendName }: LayerLegendBoxProps) {
  const { selectedLayers, setSelectedLayers, setLayerAction, setActualLayer } =
    useLayersManagementHandle();
  const [latSlice, setLatSlice] = useState<number>(
    selectedLayers[layerLegendName]?.slices?.latIndex || 0
  );
  const [lonSlice, setLonSlice] = useState<number>(
    selectedLayers[layerLegendName]?.slices?.lonIndex || 0
  );
  const [elevationSlice, setElevationSlice] = useState<number>(
    selectedLayers[layerLegendName]?.slices?.elevationIndex || 0
  );
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

  const handleUpdateParams = (newParams: Partial<CubeOptions>) => {
    setLayerAction('update-cube-params');
    setActualLayer(layerLegendName);
    const updatedParams = { ...params, ...newParams };
    setSelectedLayers(prev => {
      const updatedLayer = {
        ...prev[layerLegendName],
        params: updatedParams
      };
      return { ...prev, [layerLegendName]: updatedLayer };
    });
  };
  useEffect(() => {
    setLayerAction('update-cube-slices');
    setActualLayer(layerLegendName);
    setSelectedLayers(prev => {
      const slices = {
        latIndex: latSlice,
        lonIndex: lonSlice,
        elevationIndex: elevationSlice
      };
      const updatedLayer = { ...selectedLayer, slices };
      const updated = { ...prev };
      updated[layerLegendName] = updatedLayer;
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latSlice, lonSlice, elevationSlice]);

  return (
    <div
      className="
      mt-3 p-3 rounded-2xl
      bg-[rgba(17,17,17,0.6)] text-white
      shadow-[0px_4px_4px_rgba(0,0,0,1)]
      flex flex-col gap-3 px-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold">
          Elevation Slice:{' '}
          {selectedLayer.dimensions!.elevation
            ? (
                selectedLayer.dimensions!.elevation.values[
                  params.flipElevation
                    ? selectedLayer.dimensions!.elevation.values.length - 1 - elevationSlice
                    : elevationSlice
                ] as number
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
            {allColorScales.map(c => (
              <MenuItem key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
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
              getAriaLabel={() => 'Elevation range'}
              value={params.scale || DEFAULT_SCALE}
              min={params.scale ? params.scale[0] - 10 : DEFAULT_SCALE[0] - 10}
              max={params.scale ? params.scale[1] + 10 : DEFAULT_SCALE[1] + 10}
              disableSwap
              step={0.1}
              onChange={(_, v) => handleUpdateParams({ scale: v as [number, number] })}
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
