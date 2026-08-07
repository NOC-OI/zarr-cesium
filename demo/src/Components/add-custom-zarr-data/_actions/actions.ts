import type { LayerFormType } from '../../../application/data/schemas';

export function getDefaultLayerValues(dataType: LayerFormType['dataType']): LayerFormType {
  switch (dataType) {
    case 'zarr-cesium':
      return {
        dataType: 'zarr-cesium',
        dataDescription: ['', ''],
        content: '',
        params: {
          url: '',
          variable: '',
          scale: [0, 1],
          colormap: 'viridis',
          opacity: 1,
          crs: undefined
        }
      };

    case 'zarr-cube':
      return {
        dataType: 'zarr-cube',
        dataDescription: ['', ''],
        content: '',
        params: {
          url: '',
          variable: '',
          flipElevation: false,
          scale: [0, 1],
          colormap: 'viridis',
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          opacity: 1
        }
      };

    case 'zarr-cube-velocity':
      return {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['', ''],
        content: '',
        params: {
          urls: { u: '', v: '' },
          variables: { u: '', v: '' },
          scale: [0, 1],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          colormap: 'viridis',
          flipElevation: false,
          opacity: 1
        }
      };
  }
}
