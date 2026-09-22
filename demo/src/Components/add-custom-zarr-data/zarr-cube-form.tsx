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
import { SelectField } from './forms/select-field';
import { IndexRangeField } from './forms/index-range-field';
import { formHeadingClass, formSectionClass, formSubheadingClass } from './form-styles';

export function ZarrCubeForm({ register, control, errors }: ZarrCesiumFormProps) {
  return (
    <section className={formSectionClass}>
      <div className={formHeadingClass}>
        <span>3D cube dataset</span>
        <small>Volume source and coordinate settings</small>
      </div>

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
      <SelectField
        control={control}
        name="params.crs"
        label="Projection"
        options={[
          { label: 'Geographic (EPSG:4326)', value: 'EPSG:4326' },
          { label: 'Web Mercator (EPSG:3857)', value: 'EPSG:3857' }
        ]}
      />
      <SelectField
        control={control}
        name="params.multiscaleFormat"
        label="Multiscale"
        options={[{ label: 'GeoZarr', value: 'geozarr' }]}
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
      <BooleanSwitchField
        control={control}
        name="params.latIsAscending"
        label="Latitude order"
        enabledLabel="Ascending"
        disabledLabel="Descending / auto"
      />
      <div className={formSubheadingClass}>
        <span>Rendering</span>
        <small>Volume extent, slices, and appearance</small>
      </div>
      <ColormapField control={control} error={errors?.params?.colormap?.message} />
      <ScaleField control={control} error={errors?.params?.scale?.message} />
      <OptionalNumberField
        register={register}
        name="params.opacity"
        label="Opacity"
        placeholder="0 to 1"
      />
      <OptionalNumberField
        register={register}
        name="params.verticalExaggeration"
        label="Vertical exaggeration"
        placeholder="e.g. 1000"
      />
      <BooleanSwitchField
        control={control}
        name="params.showHorizontalSlices"
        label="Horizontal slices"
      />
      <BooleanSwitchField
        control={control}
        name="params.showVerticalSlices"
        label="Vertical slices"
      />
      <BooleanSwitchField control={control} name="params.belowSeaLevel" label="Below sea level" />
      <BoundsField control={control} error={errors?.params?.bounds?.message} />
      <div className={formSubheadingClass}>
        <span>Dimensions</span>
        <small>Initial time selection and elevation index range</small>
      </div>
      <OptionalNumberField
        register={register}
        name="params.selectors.time.selected"
        label="Time index"
        placeholder="0"
      />
      <IndexRangeField
        control={control}
        name="params.selectors.elevation.selected"
        label="Elevation range"
        error={errors?.params?.selectors?.elevation?.selected?.message}
      />
      <DimensionNamesSection register={register} error={errors?.params?.dimensionNames?.message} />
    </section>
  );
}
