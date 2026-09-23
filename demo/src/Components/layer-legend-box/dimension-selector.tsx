import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
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
    if (dimension === 'elevation' || dimension === 'depth') {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue.toFixed(3) : String(value);
    }
    return String(value).replace(/(\.\d+)?$/, '');
  };

  const selectedLayers = useAppSelector(state => state.layers.selectedLayers);
  const dispatch = useAppDispatch();
  if (dimension === 'lat' || dimension === 'lon') {
    return null;
  }
  const handleChangeDimension = async (value: number | string | [number, number]) => {
    dispatch(layersActions.setActualLayer(layerLegendName));
    dispatch(layersActions.setLayerAction('update-dimensions'));

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
    const layer = selectedLayers[layerLegendName];
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

    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: {
          ...layer,
          dimensions: newDimensions,
          params: newParams,
          slices: layer.slices ? { latIndex: 0, lonIndex: 0, elevationIndex: 0 } : undefined
        }
      })
    );
  };

  const handleChangePyramidLevel = async (value: string) => {
    dispatch(layersActions.setActualLayer(layerLegendName));
    dispatch(layersActions.setLayerAction('update-pyramid-levels'));

    const newSelectedLayer = selectedLayers[layerLegendName];
    const params = newSelectedLayer.params as CubeOptions | VelocityOptions;
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: {
          ...newSelectedLayer,
          params: { ...params, multiscaleLevel: parseInt(value) }
        }
      })
    );
  };

  return (
    <div className="grid w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5 py-1">
      <p className="text-[10px] font-semibold leading-tight text-[#b8b8b8]">
        {dimension.charAt(0).toUpperCase() + dimension.slice(1)}:
      </p>

      <div className="flex min-w-0 items-center gap-2">
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
              type="button"
              title="Apply elevation range"
              className="layer-control-apply clickable"
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
              className="layer-control-select clickable"
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
              type="button"
              title="Apply pyramid level"
              className="layer-control-apply clickable"
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
              className="layer-control-select clickable"
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
              type="button"
              title={`Apply ${dimension}`}
              className="layer-control-apply clickable"
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
