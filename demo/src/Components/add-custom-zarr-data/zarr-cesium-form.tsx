import { FormRow } from '../ui/form-row';
import { StyledTextField } from '../ui/styled-text-field';
import type { ZarrCesiumFormProps } from '../../application/data/schemas';
import { ScaleField } from './forms/scale-field';
import { ColormapField } from './forms/colormap-field';
import { DimensionNamesSection } from './forms/dimension-names-section';
import { OptionalNumberField } from './forms/optional-number-field';
import { BooleanSwitchField } from './forms/boolean-switch-field';
import { SelectField } from './forms/select-field';
import {
  formGridClass,
  formHeadingClass,
  formSectionClass,
  formSubheadingClass
} from './form-styles';

export function ZarrCesiumForm({ register, control, errors }: ZarrCesiumFormProps) {
  return (
    <section className={formSectionClass}>
      <div className={formHeadingClass}>
        <span>2D imagery dataset</span>
        <small>Required store and array details</small>
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
        error={errors?.params?.crs?.message}
      />
      <SelectField
        control={control}
        name="params.multiscaleFormat"
        label="Multiscale"
        options={[{ label: 'GeoZarr', value: 'geozarr' }]}
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
        <small>Colour and tile controls</small>
      </div>
      <ColormapField control={control} error={errors?.params?.colormap?.message} />
      <ScaleField control={control} error={errors?.params?.scale?.message} />
      <OptionalNumberField
        register={register}
        name="params.opacity"
        label="Opacity"
        placeholder="0 to 1"
        error={errors?.params?.opacity?.message}
      />
      <div className={formGridClass}>
        <OptionalNumberField
          register={register}
          name="params.tileWidth"
          label="Tile width"
          placeholder="256"
          error={errors?.params?.tileWidth?.message}
        />
        <OptionalNumberField
          register={register}
          name="params.tileHeight"
          label="Tile height"
          placeholder="256"
          error={errors?.params?.tileHeight?.message}
        />
        <OptionalNumberField
          register={register}
          name="params.minimumLevel"
          label="Min zoom"
          placeholder="0"
          error={errors?.params?.minimumLevel?.message}
        />
        <OptionalNumberField
          register={register}
          name="params.maximumLevel"
          label="Max zoom"
          placeholder="Auto"
          error={errors?.params?.maximumLevel?.message}
        />
        <OptionalNumberField
          register={register}
          name="params.noDataMin"
          label="No-data min"
          placeholder="Optional"
          error={errors?.params?.noDataMin?.message}
        />
        <OptionalNumberField
          register={register}
          name="params.noDataMax"
          label="No-data max"
          placeholder="Optional"
          error={errors?.params?.noDataMax?.message}
        />
      </div>
      <div className={formSubheadingClass}>
        <span>Dimensions</span>
        <small>Optional overrides for non-CF datasets</small>
      </div>
      <div className={formGridClass}>
        <OptionalNumberField
          register={register}
          name="params.selectors.time.selected"
          label="Time index"
          placeholder="0"
        />
        <OptionalNumberField
          register={register}
          name="params.selectors.elevation.selected"
          label="Elevation index"
          placeholder="0"
        />
      </div>
      <DimensionNamesSection register={register} error={errors?.params?.dimensionNames?.message} />
    </section>
  );
}
