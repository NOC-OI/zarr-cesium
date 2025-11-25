import type { LayersJsonType } from '../../types';

export const layersJson: LayersJsonType = {
  'Zarr-cesium': {
    layerNames: {
      salinity_v2: {
        dataType: 'zarr-cesium',
        dataDescription: ['Salinity', ''],
        content:
          'Salinity outputs from NEMO NPD-EORCA1 model. This dataset contains 3D data (time, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/T1d/sos_abs.zarr',
          variable: 'sos_abs',
          selectors: {
            time: {
              selected: 0
            }
          },
          zarrVersion: 2,
          colormap: 'viridis',
          scale: [30, 37],
          crs: undefined,
          opacity: undefined,
          dimensionNames: undefined,
          tileWidth: undefined,
          tileHeight: undefined,
          minimumLevel: undefined,
          maximumLevel: undefined
        }
      },
      salinity_pyramid_v2: {
        dataType: 'zarr-cesium',
        dataDescription: ['Salinity', ''],
        content:
          'Salinity outputs from NEMO NPD-EORCA1 model. This dataset contains 3D data (time, latitude, longitude) stored in a Zarr v2 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/pyramid2/T1d/sos_abs.zarr',
          variable: 'sos_abs',
          zarrVersion: 2,
          colormap: 'inferno',
          scale: [30, 37],
          crs: undefined,
          opacity: undefined,
          dimensionNames: undefined,
          tileWidth: undefined,
          tileHeight: undefined,
          minimumLevel: undefined,
          maximumLevel: undefined
        }
      },
      'temperature-pyramid_v3': {
        dataType: 'zarr-cesium',
        dataDescription: ['Temperature', 'deg C'],
        content:
          'Temperature outputs from NEMO NPD-EORCA1 model. This dataset contains 3D temperature data (time, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demo/npd-eorca1-era5v1/gn/T1y/tos_con',
          variable: 'tos_con',
          zarrVersion: 3,
          colormap: 'hot',
          scale: [0, 27],
          crs: undefined,
          opacity: undefined,
          dimensionNames: undefined,
          tileWidth: undefined,
          tileHeight: undefined,
          minimumLevel: undefined,
          maximumLevel: undefined
        }
      },
      'temperature-4d_pyramid_v3': {
        dataType: 'zarr-cesium',
        dataDescription: ['Temperature', 'deg C'],
        content:
          'Temperature outputs from NEMO NPD-EORCA025 model. This dataset contains 4D temperature data (time, depth, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demo/npd-eorca025-era5v1/gn/T1y_4d/thetao_con',
          variable: 'thetao_con',
          zarrVersion: 3,
          colormap: 'BrBG',
          scale: [0, 27],
          crs: undefined,
          opacity: undefined,
          dimensionNames: undefined,
          tileWidth: undefined,
          tileHeight: undefined,
          minimumLevel: undefined,
          maximumLevel: undefined
        }
      },
      pressure_florence_v3: {
        dataType: 'zarr-cesium',
        dataDescription: ['Wind Speed', 'm/s'],
        content:
          'Surface pressure data for Hurricane Florence from ERA5 reanalysis. This dataset contains 3D surface pressure data (time, latitude, longitude) stored in a Zarr v3 format and EPSG:4326 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/hurricanes/era5/florence',
          variable: 'surface_pressure',
          zarrVersion: 3,
          colormap: 'jet',
          scale: [75000, 104000],
          noDataMin: 0,
          noDataMax: 999999,
          crs: undefined,
          opacity: undefined,
          dimensionNames: undefined,
          tileWidth: undefined,
          tileHeight: undefined,
          minimumLevel: undefined,
          maximumLevel: undefined
        }
      }
    }
  },
  'Zarr-Cesium-Cube': {
    layerNames: {
      'u-currents_v2': {
        dataType: 'zarr-cube',
        dataDescription: ['U-component currents', 'm/s'],
        content:
          'U-component of the currents. This is a output from NEMO NPD-EORCA1 model. This dataset contains 4D data (time, depth, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr',
          variable: 'uo',
          flipElevation: true,
          selectors: {
            time: {
              selected: 0,
              type: 'index'
            },
            elevation: {
              selected: [0, 22]
            }
          },
          zarrVersion: 2,
          colormap: 'jet',
          scale: [-1, 1],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          crs: undefined,
          verticalExaggeration: 4500,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined
        }
      },
      'salinity-pyramid_v3': {
        dataType: 'zarr-cube',
        dataDescription: ['Salinity', ''],
        content:
          'Salinity outputs from NEMO NPD-EORCA1 model. This dataset contains 4D data (time, depth, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demo/npd-eorca1-era5v1/gn/T1y/so_abs',
          variable: 'so_abs',
          flipElevation: true,
          selectors: {
            time: {
              selected: 0,
              type: 'index'
            },
            elevation: {
              selected: [0, 10]
            }
          },
          zarrVersion: 3,
          multiscaleLevel: 3,
          colormap: 'jet',
          scale: [30, 37],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          crs: undefined,
          verticalExaggeration: 10000,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined
        }
      },
      'temperature-4d_pyramid_v3': {
        dataType: 'zarr-cube',
        dataDescription: ['Temperature', 'deg C'],
        content:
          'Temperature outputs from NEMO NPD-EORCA025 model. This dataset contains 4D temperature data (time, depth, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demo/npd-eorca025-era5v1/gn/T1y_4d/thetao_con',
          variable: 'thetao_con',
          zarrVersion: 3,
          flipElevation: true,
          selectors: {
            time: {
              selected: 0,
              type: 'index'
            },
            elevation: {
              selected: [0, 10]
            }
          },
          multiscaleLevel: 3,
          colormap: 'jet',
          scale: [0, 30],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          crs: undefined,
          verticalExaggeration: 10000,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined
        }
      },
      wind_speed_florence_v3: {
        dataType: 'zarr-cube',
        dataDescription: ['Wind Speed', 'm/s'],
        content:
          'Wind speed data for Hurricane Florence from ERA5 reanalysis. This dataset contains 4D wind speed data (time, height, latitude, longitude) stored in a Zarr v3 format and EPSG:4326 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/hurricanes/era5/florence',
          variable: 'velocity',
          flipElevation: false,
          zarrVersion: 3,
          colormap: 'jet',
          scale: [0, 40],
          bounds: { west: -95, south: 15, east: -40, north: 45 },
          crs: undefined,
          verticalExaggeration: 10,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined
        }
      }
    }
  },
  'Zarr-Cesium-Velocity': {
    layerNames: {
      currents_2d_v2: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Currents', 'm/s'],
        content:
          'Currents outputs from NEMO NPD-EORCA1 model. This dataset contains 4D velocity data (time, depth, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/vo.zarr'
          },
          variables: { u: 'uo', v: 'vo' },
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          flipElevation: true,
          zarrVersion: 2,
          selectors: {
            time: {
              selected: 0,
              type: 'index'
            },
            elevation: {
              selected: 0,
              type: 'index'
            }
          },
          colormap: 'jet',
          scale: [0, 1],
          verticalExaggeration: undefined,
          sliceSpacing: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined,
          multiscaleLevel: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: undefined
        }
      },
      currents_3d_v2: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Currents', 'm/s'],
        content:
          'Currents outputs from NEMO NPD-EORCA1 model. This dataset contains 4D velocity data (time, depth, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/vo.zarr'
          },
          variables: { u: 'uo', v: 'vo' },
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          flipElevation: true,
          zarrVersion: 2,
          selectors: {
            time: {
              selected: 0,
              type: 'index'
            },
            elevation: {
              selected: [0, 22]
            }
          },
          colormap: 'jet',
          scale: [0, 0.6],
          verticalExaggeration: 4500,
          sliceSpacing: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: {
            lineLength: { min: 0, max: 400 },
            particlesTextureSize: 80
          }
        }
      },
      currents_3d_pyramid_v3: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Currents', 'm/s'],
        content:
          'Currents outputs from NEMO NPD-EORCA1 model. This dataset contains 4D velocity data (time, depth, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demo/npd-eorca1-era5v1/gn/U1y/uo2',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demo/npd-eorca1-era5v1/gn/V1y/vo'
          },
          variables: { u: 'uo', v: 'vo' },
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          flipElevation: true,
          zarrVersion: 3,
          selectors: {
            time: {
              selected: 0
            }
          },
          colormap: 'jet',
          scale: [0, 0.5],
          verticalExaggeration: undefined,
          sliceSpacing: undefined,
          belowSeaLevel: undefined,
          dimensionNames: undefined,
          multiscaleLevel: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: undefined
        }
      },
      wind_3d_florence_v3: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Wind Speed', 'm/s'],
        content:
          'Wind speed data for Hurricane Florence from ERA5 reanalysis. This dataset contains 4D wind velocity data (time, height, latitude, longitude) stored in a Zarr v3 format and EPSG:4326 coordinate reference system.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/hurricanes/era5/florence',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/hurricanes/era5/florence'
          },
          variables: { u: 'u_component_of_wind', v: 'v_component_of_wind' },
          bounds: { west: -95, south: 15, east: -40, north: 45 },
          flipElevation: false,
          zarrVersion: 3,
          colormap: 'jet',
          scale: [0, 20],
          selectors: {
            elevation: {
              selected: [2, 17]
            }
          },
          verticalExaggeration: 5100,
          sliceSpacing: undefined,
          belowSeaLevel: undefined,
          multiscaleLevel: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: {
            speedFactor: 0.2,
            lineLength: { min: 0, max: 400 }
          }
        }
      }
    }
  },
  Titiler: {
    layerNames: {
      sos_abs_v2: {
        dataType: 'zarr-titiler',
        dataDescription: ['Salinity', ''],
        content:
          'Salinity outputs from NEMO NPD-EORCA1 model. This dataset contains 3D data (time, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/T1d/sos_abs.zarr',
          variable: 'sos_abs',
          scale: [30, 37]
        }
      }
    }
  }
};
