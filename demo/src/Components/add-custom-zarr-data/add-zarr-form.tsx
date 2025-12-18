import { Controller, FormProvider, useForm } from 'react-hook-form';
import { FormRow } from '../ui/form-row';
import { getDefaultLayerValues } from './_actions/actions';
import { layerFormSchema, type LayerFormType } from '../../application/data/schemas';
import { zodResolver } from '@hookform/resolvers/zod';

import { ZarrCubeForm } from './zarr-cube-form';
import { ZarrCesiumForm } from './zarr-cesium-form';
import { ZarrCubeVelocityForm } from './zarr-cube-velocity-form';
import { useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Button } from '../ui/button';
import { useLayersManagementHandle } from '../../application/use-layers';
import { handleChangeMapLayerAndAddLegend } from '../data-exploration/_actions/actions';

export function AddZarrForm() {
  const form = useForm<LayerFormType>({
    resolver: zodResolver(layerFormSchema),
    defaultValues: getDefaultLayerValues('zarr-cesium')
  });
  const {
    listLayers,
    setListLayers,
    setActualLayer,
    setSelectedLayers,
    setLayerAction,
    setLayerLegend,
    layerLegend
  } = useLayersManagementHandle();
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
    const updatedLayers = listLayers['Updated Layers'] || { layerNames: {} };
    updatedLayers.layerNames[newLayerName] = data;

    setListLayers(prev => {
      return {
        ...prev,
        'Updated Layers': updatedLayers
      };
    });
    handleChangeMapLayerAndAddLegend(
      true,
      { subLayer: 'Updated Layers_' + newLayerName, dataInfo: data },
      setActualLayer,
      setLayerAction,
      setSelectedLayers,
      newLayerName,
      setLayerLegend,
      layerLegend,
      'Updated Layers'
    );

    reset(getDefaultLayerValues(data.dataType));
  };
  console.log('listLayers in AddZarrForm:', listLayers);
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 ...">
        {/* Data type selector */}
        <FormRow label="Data Type" error={errors.dataType?.message}>
          <Controller
            name="dataType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <Select
                  {...field}
                  value={field.value ?? 'zarr-cesium'}
                  className="text-white clickable"
                  sx={{
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white'
                    },
                    '.MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  <MenuItem value="zarr-cesium">zarr-cesium</MenuItem>
                  <MenuItem value="zarr-cube">zarr-cube</MenuItem>
                  <MenuItem value="zarr-cube-velocity">zarr-cube-velocity</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </FormRow>

        {/* Type-specific forms */}
        {dataType === 'zarr-cesium' && (
          <ZarrCesiumForm register={register} control={control} errors={errors} />
        )}
        {dataType === 'zarr-cube' && (
          <ZarrCubeForm register={register} control={control} errors={errors} />
        )}

        {dataType === 'zarr-cube-velocity' && (
          <ZarrCubeVelocityForm register={register} control={control} errors={errors} />
        )}
        <Button
          className="w-full text-white bg-black rounded-lg opacity-100 hover:opacity-80 flex justify-center items-center py-2! gap-2 clickable"
          type="submit"
        >
          Add Layer
        </Button>
      </form>
    </FormProvider>
  );
}
