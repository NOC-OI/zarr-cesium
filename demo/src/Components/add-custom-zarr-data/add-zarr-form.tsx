import { FormProvider, useForm } from 'react-hook-form';
import { FormRow } from '../ui/form-row';
import { getDefaultLayerValues } from './_actions/actions';
import { layerFormSchema, type LayerFormType } from '../../application/data/schemas';
import { zodResolver } from '@hookform/resolvers/zod';

import { ZarrCubeForm } from './zarr-cube-form';
import { ZarrCesiumForm } from './zarr-cesium-form';
import { ZarrCubeVelocityForm } from './zarr-cube-velocity-form';
import { useEffect } from 'react';
import { Button } from '../ui/button';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import { handleChangeMapLayerAndAddLegend } from '../data-exploration/_actions/actions';
import { StyledTextField } from '../ui/styled-text-field';
import { SelectField } from './forms/select-field';
import { formHeadingClass, formSectionClass } from './form-styles';

export function AddZarrForm() {
  const form = useForm<LayerFormType>({
    resolver: zodResolver(layerFormSchema),
    defaultValues: getDefaultLayerValues('zarr-cesium')
  });
  const layerLegend = useAppSelector(state => state.layers.layerLegend);
  const dispatch = useAppDispatch();
  // const { setFlashMessage } = useContextHandle();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors }
  } = form;
  const dataType = watch('dataType');

  useEffect(() => {
    reset(getDefaultLayerValues(dataType));
  }, [dataType, reset]);

  const onSubmit = (data: LayerFormType) => {
    const variableName =
      'variable' in data.params
        ? data.params.variable
        : 'variables' in data.params
          ? data.params.variables.u + '-' + data.params.variables.v
          : 'layer';
    const newLayerName = variableName + '-' + Math.random().toString(36).substring(2, 6);
    dispatch(
      layersActions.addListLayer({ group: 'Updated Layers', name: newLayerName, layer: data })
    );
    handleChangeMapLayerAndAddLegend(
      true,
      { subLayer: 'Updated Layers_' + newLayerName, dataInfo: data },
      dispatch,
      newLayerName,
      layerLegend,
      'Updated Layers'
    );

    reset(getDefaultLayerValues(data.dataType));
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="custom-data-form">
        <section className={formSectionClass}>
          <div className={formHeadingClass}>
            <span>Layer</span>
            <small>How this dataset appears in the catalog</small>
          </div>
          <SelectField
            control={control as any}
            name="dataType"
            label="Layer type"
            optional={false}
            options={[
              { label: '2D Zarr imagery', value: 'zarr-cesium' },
              { label: '3D Zarr cube', value: 'zarr-cube' },
              { label: 'Velocity particles', value: 'zarr-cube-velocity' }
            ]}
            error={errors.dataType?.message}
          />
          <FormRow label="Display name" error={errors.dataDescription?.[0]?.message}>
            <StyledTextField
              {...register('dataDescription.0')}
              placeholder="e.g. Sea-surface temperature"
            />
          </FormRow>
          <FormRow label="Units" error={errors.dataDescription?.[1]?.message}>
            <StyledTextField {...register('dataDescription.1')} placeholder="e.g. °C, m/s, g/kg" />
          </FormRow>
          <FormRow label="Description" error={errors.content?.message}>
            <StyledTextField
              {...register('content')}
              placeholder="Describe the source and coverage"
              multiline
              minRows={2}
            />
          </FormRow>
        </section>

        {/* Type-specific forms */}
        {dataType === 'zarr-cesium' && (
          <ZarrCesiumForm register={register} control={control as any} errors={errors} />
        )}
        {dataType === 'zarr-cube' && (
          <ZarrCubeForm register={register} control={control as any} errors={errors} />
        )}

        {dataType === 'zarr-cube-velocity' && (
          <ZarrCubeVelocityForm register={register} control={control as any} errors={errors} />
        )}
        <Button className="form-submit clickable" type="submit">
          Add Layer
        </Button>
      </form>
    </FormProvider>
  );
}
