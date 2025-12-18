// components/forms/ZarrCubeForm.tsx

import { FormRow } from '../ui/form-row';
import { StyledTextField } from '../ui/styled-text-field';
import type { ZarrCesiumFormProps } from '../../application/data/schemas';
import { DimensionNamesSection } from './forms/dimension-names-section';
import { BoundsField } from './forms/bounds-field';
import { ScaleField } from './forms/scale-field';
import { ColormapField } from './forms/colormap-field';
import { OptionalNumberField } from './forms/optional-number-field';
import { BooleanSwitchField } from './forms/boolean-switch-field';

export function ZarrCubeForm({ register, control, errors }: ZarrCesiumFormProps) {
  return (
    <div className="space-y-4 bg-gray bg-opacity-30 p-4 rounded-lg border border-black">
      <p className="text-white font-bold text-lg mb-2">Zarr Cube Parameters</p>

      <FormRow label="URL" error={errors?.params?.url?.message}>
        <StyledTextField {...register('params.url')} placeholder="Enter URL" />
      </FormRow>
      <FormRow label="Variable" error={errors?.params?.variable?.message}>
        <StyledTextField {...register('params.variable')} placeholder="Enter variable name" />
      </FormRow>
      <OptionalNumberField
        register={register}
        name="params.zarrVersion"
        label="Zarr Version"
        placeholder="e.g. 2 or 3 or leave blank for auto-detect"
        error={errors?.params?.zarrVersion?.message}
      />
      <OptionalNumberField
        register={register}
        name="params.multiscaleLevel"
        label="Multiscale Level"
        placeholder="e.g. 0, 1, 2... or leave blank if not multiscale"
        error={errors?.params?.multiscaleLevel?.message}
      />
      <BooleanSwitchField
        control={control}
        name="params.flipElevation"
        label="Flip Elevation"
        error={errors?.params?.flipElevation?.message}
      />
      <ColormapField control={control} error={errors?.params?.colormap?.message} />
      <ScaleField control={control} error={errors?.params?.scale?.message} />
      <BoundsField control={control} error={errors?.params?.bounds?.message} />
      <DimensionNamesSection register={register} error={errors?.params?.dimensionNames?.message} />
    </div>
  );
}
