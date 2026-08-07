import { Controller, type Control } from 'react-hook-form';
import Slider from '@mui/material/Slider';
import { FormRow } from '../../ui/form-row';

interface ScaleFieldProps {
  control: Control<any>;
  name?: string;
  label?: string;
  step?: number;
  padding?: number;
  error?: string;
}

export function ScaleField({
  control,
  name = 'params.scale',
  label = 'Scale',
  step = 0.1,
  padding = 10,
  error
}: ScaleFieldProps) {
  return (
    <FormRow label={label} error={error}>
      <Controller
        name={name}
        control={control}
        defaultValue={[0, 1]}
        render={({ field }) => {
          const value: [number, number] = field.value ?? [0, 1];

          return (
            <div className="w-full px-2">
              <Slider
                getAriaLabel={() => `${label} range`}
                value={value}
                min={value[0] - padding}
                max={value[1] + padding}
                step={step}
                disableSwap
                onChange={(_, v) => field.onChange(v as [number, number])}
                className="clickable"
                color="success"
              />

              <div className="flex justify-between text-xs text-white mt-1">
                <span>{value[0]}</span>
                <span>{value[1]}</span>
              </div>
            </div>
          );
        }}
      />
    </FormRow>
  );
}
