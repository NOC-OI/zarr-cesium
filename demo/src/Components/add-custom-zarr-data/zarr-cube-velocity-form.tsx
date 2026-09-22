import { StyledTextField } from '../ui/styled-text-field';
import type { ZarrCesiumFormProps } from '../../application/data/schemas';
import { FormRow } from '../ui/form-row';
import { DimensionNamesSection } from './forms/dimension-names-section';
import { ColormapField } from './forms/colormap-field';
import { BoundsField } from './forms/bounds-field';
import { ScaleField } from './forms/scale-field';
import { OptionalNumberField } from './forms/optional-number-field';
import { BooleanSwitchField } from './forms/boolean-switch-field';
import { SelectField } from './forms/select-field';
import { IndexRangeField } from './forms/index-range-field';
import {
  formGridClass,
  formHeadingClass,
  formSectionClass,
  formSubheadingClass
} from './form-styles';

export function ZarrCubeVelocityForm({ register, control, errors }: ZarrCesiumFormProps) {
  return (
    <section className={formSectionClass}>
      <div className={formHeadingClass}>
        <span>Velocity dataset</span>
        <small>Paired U and V component arrays</small>
      </div>
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
        <small>Particle volume and appearance</small>
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
      <OptionalNumberField
        register={register}
        name="params.sliceSpacing"
        label="Slice spacing"
        placeholder="Dataset units"
      />
      <BooleanSwitchField control={control} name="params.belowSeaLevel" label="Below sea level" />
      <BoundsField control={control} error={errors?.params?.bounds?.message} />
      <div className={formSubheadingClass}>
        <span>Particles</span>
        <small>Optional Cesium wind-layer tuning</small>
      </div>
      <div className={formGridClass}>
        <OptionalNumberField
          register={register}
          name="params.windOptions.particlesTextureSize"
          label="Particle texture"
          placeholder="e.g. 128"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.speedFactor"
          label="Speed factor"
          placeholder="e.g. 1"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.dropRate"
          label="Drop rate"
          placeholder="e.g. 0.003"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.dropRateBump"
          label="Drop-rate bump"
          placeholder="e.g. 0.01"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.lineWidth.min"
          label="Min line width"
          placeholder="1"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.lineWidth.max"
          label="Max line width"
          placeholder="4"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.lineLength.min"
          label="Min line length"
          placeholder="0"
        />
        <OptionalNumberField
          register={register}
          name="params.windOptions.lineLength.max"
          label="Max line length"
          placeholder="400"
        />
      </div>
      <BooleanSwitchField
        control={control}
        name="params.windOptions.flipY"
        label="Flip particle Y"
      />
      <BooleanSwitchField
        control={control}
        name="params.windOptions.dynamic"
        label="Dynamic particles"
      />
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
