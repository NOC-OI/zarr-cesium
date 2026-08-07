import { StyledTextField } from '../ui/styled-text-field';
import type { ZarrCesiumFormProps } from '../../application/data/schemas';
import { FormRow } from '../ui/form-row';
import { DimensionNamesSection } from './forms/dimension-names-section';
import { ColormapField } from './forms/colormap-field';
import { BoundsField } from './forms/bounds-field';
import { ScaleField } from './forms/scale-field';
import { OptionalNumberField } from './forms/optional-number-field';
import { BooleanSwitchField } from './forms/boolean-switch-field';

export function ZarrCubeVelocityForm({ register, control, errors }: ZarrCesiumFormProps) {
  return (
    <div className="space-y-4 bg-gray bg-opacity-30 p-4 rounded-lg border border-black">
      <p className="text-white font-bold text-lg mb-2">Zarr Cube Velocity Parameters</p>
      <FormRow label="URL (u)" error={errors?.params?.urls?.u?.message}>
        <StyledTextField {...register('params.urls.u')} />
      </FormRow>
      <FormRow label="URL (v)" error={errors?.params?.urls?.v?.message}>
        <StyledTextField {...register('params.urls.v')} />
      </FormRow>
      <FormRow label="Variable (u)" error={errors?.params?.variables?.u?.message}>
        <StyledTextField {...register('params.variables.u')} />
      </FormRow>
      <FormRow label="Variable (v)" error={errors?.params?.variables?.v?.message}>
        <StyledTextField {...register('params.variables.v')} />
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
