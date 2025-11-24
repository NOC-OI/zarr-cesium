import { useState, useEffect } from 'react';
import { useLayersManagementHandle } from '../../application/use-layers';
import type { DimensionSelectorProps } from '../../types';
import Slider from '@mui/material/Slider';
import type { CubeOptions, VelocityOptions } from 'zarr-cesium';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function DimensionSelector({
  dimension,
  values,
  selectedIndex,
  totalShape,
  layerLegendName
}: DimensionSelectorProps) {
  const [pendingRange, setPendingRange] = useState<[number, number]>(
    Array.isArray(selectedIndex) ? selectedIndex : [0, 0]
  );
  const [pendingValue, setPendingValue] = useState<number | string>(
    selectedIndex as number | string
  );

  useEffect(() => {
    if (Array.isArray(selectedIndex)) {
      setPendingRange(selectedIndex);
    } else {
      setPendingValue(selectedIndex as number | string);
    }
  }, [selectedIndex]);

  const formatValue = (value: string | number) => {
    if (dimension === 'time' && typeof value === 'string' && value.length > 10) {
      return value.slice(0, 13);
    }
    return String(value).replace(/(\.\d+)?$/, '');
  };

  const { setSelectedLayers, setLayerAction, setActualLayer, selectedLayers } =
    useLayersManagementHandle();
  if (dimension === 'lat' || dimension === 'lon') {
    return null;
  }
  const handleChangeDimension = async (value: number | string | [number, number]) => {
    setActualLayer(layerLegendName);
    setLayerAction('update-dimensions');

    const newSelectedLayer = selectedLayers[layerLegendName];
    const dimensionValues = newSelectedLayer.dimensions || {};

    let newSelectedValue;

    if (Array.isArray(value)) {
      newSelectedValue = value;
    } else {
      let idx = dimensionValues[dimension].values.indexOf(value);
      if (idx === -1) {
        idx = dimensionValues[dimension].values.indexOf(
          isNaN(Number(value)) ? value : Number(value)
        );
      }
      newSelectedValue = idx;
    }
    setSelectedLayers(prev => {
      const layer = prev[layerLegendName];

      const newDimensions = {
        ...layer.dimensions,
        [dimension]: {
          ...layer.dimensions![dimension],
          selected: newSelectedValue
        }
      };

      const newParams = {
        ...layer.params,
        selectors: {
          ...(layer.params.selectors || {}),
          [dimension]: { selected: newSelectedValue }
        }
      };

      return {
        ...prev,
        [layerLegendName]: {
          ...layer,
          dimensions: newDimensions,
          params: newParams,
          slices: layer.slices ? { latIndex: 0, lonIndex: 0, elevationIndex: 0 } : undefined
        }
      };
    });
  };

  const handleChangePyramidLevel = async (value: string) => {
    setActualLayer(layerLegendName);
    setLayerAction('update-pyramid-levels');

    const newSelectedLayer = selectedLayers[layerLegendName];
    const params = newSelectedLayer.params as CubeOptions | VelocityOptions;
    params.multiscaleLevel = parseInt(value);
    newSelectedLayer.params = params;
    setSelectedLayers(prev => {
      const updated = { ...prev };
      updated[layerLegendName] = newSelectedLayer;
      return updated;
    });
  };

  return (
    <div className="p-1 flex justify-between w-full items-center gap-4">
      <p className="text-md font-bold text-white text-center">
        {dimension.charAt(0).toUpperCase() + dimension.slice(1)}:
      </p>

      <div className="flex flex-col items-center gap-0 w-full">
        {dimension === 'elevation' && totalShape ? (
          <div className="w-full flex items-center gap-2">
            <Slider
              getAriaLabel={() => 'Elevation range'}
              value={pendingRange}
              min={0}
              max={totalShape.length - 1}
              disableSwap
              onChange={(_, newValue) => {
                setPendingRange(newValue as [number, number]);
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={idx => totalShape[idx]}
              className="clickable"
              color="success"
            />
            <button
              className=" text-white rounded-md hover:opacity-100 opacity-70 clickable p-0"
              onClick={() => handleChangeDimension(pendingRange)}
            >
              <CheckCircleIcon />
            </button>
          </div>
        ) : dimension === 'pyramidLevels' ? (
          <div className="w-full flex items-center gap-2">
            <select
              value={values[pendingValue as number]}
              onChange={e => setPendingValue(e.target.value)}
              className="clickable bg-black bg-opacity-20 border border-black text-white text-sm rounded-lg block w-full p-2 hover:bg-opacity-80"
            >
              {values.map((value, idx) => (
                <option
                  className="bg-black bg-opacity-80 text-white clickable"
                  key={idx}
                  value={value}
                >
                  {`Level ${formatValue(value)}`}
                </option>
              ))}
            </select>
            <button
              className=" text-white rounded-md hover:opacity-100 opacity-70 clickable p-0"
              onClick={() => handleChangePyramidLevel(pendingValue as string)}
            >
              <CheckCircleIcon />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2">
            <select
              value={values[pendingValue as number]}
              onChange={e => setPendingValue(e.target.value)}
              className="clickable bg-black bg-opacity-20 border border-black text-white text-sm rounded-lg block w-full p-2 hover:bg-opacity-80"
            >
              {values.map((value, idx) => (
                <option
                  className="bg-black bg-opacity-80 text-white clickable"
                  key={idx}
                  value={value}
                >
                  {formatValue(value)}
                </option>
              ))}
            </select>
            <button
              className=" text-white rounded-md hover:opacity-100 opacity-70 clickable p-0"
              onClick={() => handleChangeDimension(pendingValue)}
            >
              <CheckCircleIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
