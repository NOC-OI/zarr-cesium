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
    <div className="grid w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5 py-1">
      <p className="text-[10px] font-semibold leading-tight text-[#b8b8b8]">Bounds</p>
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="grid grid-cols-[34px_minmax(0,1fr)_34px] items-center gap-2">
            <span className="text-right text-[9px] tabular-nums text-[#aaa]">
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
            <span className="text-[9px] tabular-nums text-[#aaa]">
              {pendingBounds.east < 0
                ? `${Math.round(pendingBounds.east) * -1}°W`
                : `${Math.round(pendingBounds.east)}°E`}
            </span>
          </div>
          <div className="grid grid-cols-[34px_minmax(0,1fr)_34px] items-center gap-2">
            <span className="text-right text-[9px] tabular-nums text-[#aaa]">
              {pendingBounds.south < 0
                ? `${Math.round(pendingBounds.south) * -1}°S`
                : `${Math.round(pendingBounds.south)}°N`}
            </span>
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
            <span className="text-[9px] tabular-nums text-[#aaa]">
              {pendingBounds.north < 0
                ? `${Math.round(pendingBounds.north) * -1}°S`
                : `${Math.round(pendingBounds.north)}°N`}
            </span>
          </div>
        </div>
        <button
          type="button"
          title="Apply bounds"
          className="layer-control-apply clickable"
          onClick={() => handleChangeDimension(pendingBounds)}
        >
          <CheckCircleIcon />
        </button>
      </div>
    </div>
  );
}
