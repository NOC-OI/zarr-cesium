import type { Control, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

export interface ZarrCesiumFormProps {
  register: UseFormRegister<LayerFormType>;
  control: Control<LayerFormType>;
  errors?: any;
}

const baseLayerSchema = z.object({
  dataType: z.enum(['zarr-cesium', 'zarr-cube', 'zarr-cube-velocity']),
  dataDescription: z.tuple([z.string(), z.string()]),
  content: z.string()
});

const boundsSchema = z.object({
  west: z.number(),
  south: z.number(),
  east: z.number(),
  north: z.number()
});
const zarrVersionSchema = z.union([z.literal(2), z.literal(3)]);
const crsSchema = z.enum(['EPSG:4326', 'EPSG:3857']);

const zarrCesiumParams = z
  .object({
    url: z.string().url(),
    variable: z.string(),
    crs: crsSchema.nullable().optional(),
    tileWidth: z.number().optional(),
    tileHeight: z.number().optional(),
    minimumLevel: z.number().optional(),
    maximumLevel: z.number().optional(),
    scale: z.tuple([z.number(), z.number()]).optional(),
    opacity: z.number().optional(),
    colormap: z.string().optional(),
    zarrVersion: zarrVersionSchema.optional(),
    dimensionNames: z.record(z.string(), z.string()).optional(),
    noDataMin: z.number().optional(),
    noDataMax: z.number().optional()
  })
  .strict();

const zarrCubeParams = z
  .object({
    url: z.string().url(),
    variable: z.string(),
    bounds: boundsSchema,
    crs: crsSchema.nullable().optional(),
    verticalExaggeration: z.number().optional(),
    opacity: z.number().optional(),
    showHorizontalSlices: z.boolean().optional(),
    showVerticalSlices: z.boolean().optional(),
    belowSeaLevel: z.boolean().optional(),
    dimensionNames: z.record(z.string(), z.string()).optional(),
    selectors: z.record(z.string(), z.any()).optional(),
    multiscaleLevel: z.number().optional(),
    zarrVersion: zarrVersionSchema.optional(),
    flipElevation: z.boolean().optional(),
    scale: z.tuple([z.number(), z.number()]).optional(),
    colormap: z.string().optional()
  })
  .strict();

const zarrCubeVelocityParams = z
  .object({
    urls: z.object({
      u: z.string().url(),
      v: z.string().url()
    }),
    variables: z.object({
      u: z.string(),
      v: z.string()
    }),
    bounds: boundsSchema,
    verticalExaggeration: z.number().optional(),
    flipElevation: z.boolean().optional(),
    sliceSpacing: z.number().optional(),
    belowSeaLevel: z.boolean().optional(),
    dimensionNames: z.record(z.string(), z.string()).optional(),
    selectors: z.record(z.string(), z.any()).optional(),
    multiscaleLevel: z.number().optional(),
    opacity: z.number().optional(),
    crs: crsSchema.nullable().optional(),
    scale: z.tuple([z.number(), z.number()]).optional(),
    colormap: z.string().optional(),
    zarrVersion: zarrVersionSchema.optional(),
    windOptions: z.record(z.string(), z.any()).optional()
  })
  .strict();

export const layerFormSchema = z.discriminatedUnion('dataType', [
  baseLayerSchema.extend({
    dataType: z.literal('zarr-cesium'),
    params: zarrCesiumParams
  }),
  baseLayerSchema.extend({
    dataType: z.literal('zarr-cube'),
    params: zarrCubeParams
  }),
  baseLayerSchema.extend({
    dataType: z.literal('zarr-cube-velocity'),
    params: zarrCubeVelocityParams
  })
]);

export type LayerFormType = z.infer<typeof layerFormSchema>;
