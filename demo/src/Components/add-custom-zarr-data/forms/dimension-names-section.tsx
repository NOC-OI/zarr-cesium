import { useState } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { FormRow } from '../../ui/form-row';
import { StyledTextField } from '../../ui/styled-text-field';
import { Button } from '../../ui/button';

interface DimensionNamesSectionProps {
  register: UseFormRegister<any>;
  namePrefix?: 'params.dimensionNames';
  error?: string;
}

export function DimensionNamesSection({
  register,
  namePrefix = 'params.dimensionNames',
  error
}: DimensionNamesSectionProps) {
  const [showDimensions, setShowDimensions] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowDimensions(v => !v)}
        className="w-full text-white bg-black rounded-lg opacity-100 hover:opacity-80
                   flex justify-center items-center py-2! gap-2 clickable"
      >
        {showDimensions ? 'Use CF dimension names' : 'Add custom dim names'}
      </Button>

      {showDimensions && (
        <div className="mt-3 space-y-3 border border-white/20 rounded-md p-3">
          <p className="text-white font-semibold text-md">Dimension Names</p>

          <FormRow label="Time" error={error}>
            <StyledTextField {...register(`${namePrefix}.time`)} placeholder="e.g. time" />
          </FormRow>

          <FormRow label="Elevation" error={error}>
            <StyledTextField
              {...register(`${namePrefix}.elevation`)}
              placeholder="e.g. elevation"
            />
          </FormRow>

          <FormRow label="Latitude" error={error}>
            <StyledTextField {...register(`${namePrefix}.lat`)} placeholder="e.g. latitude" />
          </FormRow>

          <FormRow label="Longitude" error={error}>
            <StyledTextField {...register(`${namePrefix}.lon`)} placeholder="e.g. longitude" />
          </FormRow>

          <FormRow label="Others (comma separated)" error={error}>
            <StyledTextField
              placeholder="e.g. depth, ensemble"
              {...register(`${namePrefix}.others`, {
                setValueAs: value =>
                  typeof value === 'string'
                    ? value
                        .split(',')
                        .map(v => v.trim())
                        .filter(Boolean)
                    : undefined
              })}
            />
          </FormRow>
        </div>
      )}
    </>
  );
}
