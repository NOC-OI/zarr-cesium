import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import Slider from '@mui/material/Slider';
import type { BoundsProps } from 'zarr-cesium';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function BoundsSelector({
  bounds,
  layerLegendName
}: {
  bounds: BoundsProps;
  layerLegendName: string;
}) {
  const [pendingBounds, setPendingBounds] = useState<BoundsProps>(bounds);

  const layer = useAppSelector(state => state.layers.selectedLayers[layerLegendName]);
  const dispatch = useAppDispatch();
  const handleChangeDimension = async (value: BoundsProps) => {
    dispatch(layersActions.setActualLayer(layerLegendName));
    dispatch(layersActions.setLayerAction('update-bounds'));
    dispatch(
      layersActions.updateSelectedLayer({
        name: layerLegendName,
        layer: {
          ...layer,
          params: {
            ...layer.params,
            bounds: { ...value }
          },
          slices: {
            latIndex: 0,
            lonIndex: 0,
            elevationIndex: 0
          }
        }
      })
    );
  };

  return (
    <div className="p-1 pt-4 flex justify-between w-full items-center gap-4">
      <p className="text-md font-bold text-white text-center">Bounds</p>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex justify-between w-full items-center gap-4">
          <span className="text-sm text-white">
            {pendingBounds.west < 0
              ? `${Math.round(pendingBounds.west) * -1}°W`
              : `${Math.round(pendingBounds.west)}°E`}
          </span>
          <Slider
            getAriaLabel={() => 'Elevation range'}
            value={[Math.round(pendingBounds.west), Math.round(pendingBounds.east)]}
            min={-180}
            max={180}
            disableSwap
            onChange={(_, newValue) => {
              if (!Array.isArray(newValue)) return;
              setPendingBounds(prev => ({
                ...prev,
                west: newValue[0],
                east: newValue[1]
              }));
            }}
            className="clickable"
            color="success"
          />
          {pendingBounds.east < 0
            ? `${Math.round(pendingBounds.east) * -1}°W`
            : `${Math.round(pendingBounds.east)}°E`}
        </div>
        <div className="flex justify-between w-full items-center gap-4">
          {pendingBounds.south < 0
            ? `${Math.round(pendingBounds.south) * -1}°S`
            : `${Math.round(pendingBounds.south)}°N`}
          <Slider
            getAriaLabel={() => 'Elevation range'}
            value={[Math.round(pendingBounds.south), Math.round(pendingBounds.north)]}
            min={-85}
            max={85}
            disableSwap
            onChange={(_, newValue) => {
              if (!Array.isArray(newValue)) return;
              setPendingBounds(prev => ({
                ...prev,
                south: newValue[0],
                north: newValue[1]
              }));
            }}
            className="clickable"
            color="success"
          />
          {pendingBounds.north < 0
            ? `${Math.round(pendingBounds.north) * -1}°S`
            : `${Math.round(pendingBounds.north)}°N`}
        </div>
      </div>
      <button
        className=" text-white rounded-md hover:opacity-100 opacity-70 clickable p-0"
        onClick={() => handleChangeDimension(pendingBounds)}
      >
        <CheckCircleIcon />
      </button>
    </div>
  );
}
