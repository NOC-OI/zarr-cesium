import { useState } from 'react';
import { useLayersManagementHandle } from '../../application/use-layers';
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

  const { setSelectedLayers, setLayerAction, setActualLayer } = useLayersManagementHandle();
  const handleChangeDimension = async (value: BoundsProps) => {
    setActualLayer(layerLegendName);
    setLayerAction('update-bounds');

    setSelectedLayers(prev => {
      const layer = prev[layerLegendName];
      const updatedParams = {
        ...layer.params,
        bounds: { ...value }
      };

      const updatedLayer = {
        ...layer,
        params: updatedParams,
        slices: {
          latIndex: 0,
          lonIndex: 0,
          elevationIndex: 0
        }
      };

      return {
        ...prev,
        [layerLegendName]: updatedLayer
      };
    });
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
              setPendingBounds(prev => ({
                ...prev,
                west: (newValue as [number, number])[0],
                east: (newValue as [number, number])[1]
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
              setPendingBounds(prev => ({
                ...prev,
                south: (newValue as [number, number])[0],
                north: (newValue as [number, number])[1]
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
