import { FormRow } from '../ui/form-row';
import { StyledTextField } from '../ui/styled-text-field';
import type { ZarrCesiumFormProps } from '../../application/data/schemas';
import { ScaleField } from './forms/scale-field';
import { ColormapField } from './forms/colormap-field';
import { DimensionNamesSection } from './forms/dimension-names-section';
import { OptionalNumberField } from './forms/optional-number-field';

export function ZarrCesiumForm({ register, control, errors }: ZarrCesiumFormProps) {
  console.log('erross in ZarrCesiumForm:', errors);
  return (
    <div className="space-y-4 bg-gray bg-opacity-10 p-4 rounded-lg border border-black">
      <p className="text-white font-bold text-lg mb-2">Zarr Cesium Parameters</p>
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
      <ColormapField control={control} error={errors?.params?.colormap?.message} />
      <ScaleField control={control} error={errors?.params?.scale?.message} />
      <DimensionNamesSection register={register} error={errors?.params?.dimensionNames?.message} />
    </div>
  );
}
