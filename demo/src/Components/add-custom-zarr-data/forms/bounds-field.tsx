import { Controller, type Control } from 'react-hook-form';
import Slider from '@mui/material/Slider';
import { FormRow } from '../../ui/form-row';

interface BoundsFieldProps {
  control: Control<any>;
  name?: string;
  error?: string;
}

const DEFAULT_BOUNDS = {
  west: -10,
  east: 10,
  south: -10,
  north: 10
};

export function BoundsField({ control, name = 'params.bounds', error }: BoundsFieldProps) {
  return (
    <>
      <p className="text-white font-semibold text-md mt-4">Bounds</p>

      {/* Longitude */}
      <FormRow label="Longitude (W ↔ E)" error={error}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const bounds = field.value ?? DEFAULT_BOUNDS;
            const value: [number, number] = [bounds.west, bounds.east];

            return (
              <div className="w-full px-2">
                <Slider
                  value={value}
                  min={-180}
                  max={180}
                  disableSwap
                  onChange={(_, v) => {
                    const [west, east] = v as [number, number];
                    field.onChange({ ...bounds, west, east });
                  }}
                  className="clickable"
                  color="success"
                />

                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatLon(value[0])}</span>
                  <span>{formatLon(value[1])}</span>
                </div>
              </div>
            );
          }}
        />
      </FormRow>

      {/* Latitude */}
      <FormRow label="Latitude (S ↔ N)">
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const bounds = field.value ?? DEFAULT_BOUNDS;
            const value: [number, number] = [bounds.south, bounds.north];

            return (
              <div className="w-full px-2">
                <Slider
                  value={value}
                  min={-85}
                  max={85}
                  disableSwap
                  onChange={(_, v) => {
                    const [south, north] = v as [number, number];
                    field.onChange({ ...bounds, south, north });
                  }}
                  className="clickable"
                  color="success"
                />

                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatLat(value[0])}</span>
                  <span>{formatLat(value[1])}</span>
                </div>
              </div>
            );
          }}
        />
      </FormRow>
    </>
  );
}

/* helpers */
function formatLon(v: number) {
  const r = Math.round(v);
  return r < 0 ? `${Math.abs(r)}°W` : `${r}°E`;
}

function formatLat(v: number) {
  const r = Math.round(v);
  return r < 0 ? `${Math.abs(r)}°S` : `${r}°N`;
}
