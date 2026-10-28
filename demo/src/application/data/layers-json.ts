import type { LayersJsonType } from '../../types';

export const layersJson: LayersJsonType = {
  '2D Visualisation': {
    layerNames: {
      salinity_pyramid_geozarr: {
        dataType: 'zarr-cesium',
        dataDescription: ['Salinity', ''],
        tags: ['V3', 'multiscale', 'geozarr', 'epsg:4326'],
        content:
          'Salinity outputs from NEMO NPD-EORCA1 model. This dataset contains 3D data (time, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demov2/prod9/eorca1_T/T1m/so_abs',
          variable: 'so_abs',
          scale: [30, 37],
          crs: 'EPSG:4326',
          zarrVersion: 3,
          colormap: 'inferno',
          multiscaleFormat: 'geozarr',
          latIsAscending: true
        }
      },
      salinity_pyramid_v2: {
        dataType: 'zarr-cesium',
        dataDescription: ['Salinity', ''],
        tags: ['V2', 'multiscale', 'epsg:3857'],
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
      'temperature-4d_pyramid_v3': {
        dataType: 'zarr-cesium',
        tags: ['V3', 'multiscale', 'epsg:3857'],
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
        tags: ['V3', 'atm', 'epsg:4326'],
        dataDescription: ['Surface pressure', 'Pa'],
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
      },
      icechunk_precipitation: {
        dataType: 'zarr-cesium',
        dataDescription: ['Precipitation', 'mm/hr'],
        tags: ['icechunk', 'epsg:4326'],
        content: 'Virtualized NASA IMERG precipitation stored in Icechunk with native multiscales.',
        params: {
          url: 'https://carbonplan-share.s3.us-west-2.amazonaws.com/zarr-layer-examples/pipeline/multi_level_virtual_hybrid_icechunk.icechunk',
          variable: 'IMERG_PRECTOT',
          scale: [0, 10],
          colormap: 'cool',
          zarrVersion: 3,
          crs: 'EPSG:4326'
        }
      },
      sea_ice_age_epsg3408: {
        dataType: 'zarr-cesium',
        dataDescription: ['Sea ice age', 'years'],
        tags: ['V3', 'polar', 'epsg:3408', 'proj4'],
        content:
          'NSIDC sea-ice age data on a north-polar Lambert azimuthal equal-area grid. This example exercises client-side reprojection from EPSG:3408 into Cesium geographic tiles.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/openday/age_of_sea_ice.zarr',
          variable: 'age_of_sea_ice',
          zarrVersion: 3,
          crs: 'EPSG:3408',
          proj4:
            '+proj=laea +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +a=6371228 +b=6371228 +units=m +no_defs',
          colormap: 'cool',
          scale: [0, 5],
          noDataMin: 0.5,
          noDataMax: 19.5,
          selectors: {
            time: {
              selected: 0,
              type: 'index'
            }
          },
          dimensionNames: {
            lon: 'x',
            lat: 'y',
            time: 'time'
          }
        }
      }
    }
  },
  '3D Cube Visualisation': {
    layerNames: {
      salinity_pyramid_geozarr: {
        dataType: 'zarr-cube',
        dataDescription: ['Salinity', ''],
        tags: ['V3', 'multiscale', 'geozarr', 'epsg:4326'],
        content:
          'Salinity outputs from NEMO NPD-EORCA1 model. This dataset contains 4D data (time, depth, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demov2/prod10/eorca1_T/T1m/so_abs',
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
          multiscaleLevel: 1,
          colormap: 'jet',
          scale: [30, 37],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          crs: undefined,
          verticalExaggeration: 10000,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          elevationMode: undefined,
          dimensionNames: undefined,
          multiscaleFormat: 'geozarr',
          latIsAscending: true
        }
      },
      'salinity-pyramid_v3': {
        dataType: 'zarr-cube',
        dataDescription: ['Salinity', ''],
        tags: ['V3', 'multiscale', 'epsg:3857'],
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
          multiscaleLevel: 1,
          colormap: 'jet',
          scale: [30, 37],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          crs: undefined,
          verticalExaggeration: 10000,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          elevationMode: undefined,
          dimensionNames: undefined
        }
      },
      'temperature-4d_pyramid_v3': {
        dataType: 'zarr-cube',
        dataDescription: ['Temperature', 'deg C'],
        tags: ['V3', 'multiscale', 'epsg:3857'],
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
          multiscaleLevel: 1,
          colormap: 'jet',
          scale: [0, 30],
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          crs: undefined,
          verticalExaggeration: 10000,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          elevationMode: undefined,
          dimensionNames: undefined
        }
      },
      wind_speed_florence_v3: {
        dataType: 'zarr-cube',
        dataDescription: ['Wind Speed', 'm/s'],
        tags: ['V3', 'atm', 'epsg:4326'],
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
          verticalExaggeration: 1000,
          opacity: undefined,
          showHorizontalSlices: undefined,
          showVerticalSlices: undefined,
          elevationMode: undefined,
          dimensionNames: undefined
        }
      },
      'u-currents_v2': {
        dataType: 'zarr-cube',
        dataDescription: ['U-component currents', 'm/s'],
        tags: ['V2', 'epsg:4326'],
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
          elevationMode: undefined,
          dimensionNames: undefined
        }
      },
      hrrr_temperature_projected_cube: {
        dataType: 'zarr-cube',
        dataDescription: ['HRRR forecast temperature', 'K'],
        tags: ['V2', 'cube', 'Lambert Conformal Conic', 'proj4'],
        content:
          'Projection implementation example only, not a real physical 3D dataset demonstration. NOAA HRRR 2 m temperature is displayed as a projected space-time cube over Colorado; the vertical axis represents 36 forecast hours rather than atmospheric height.',
        params: {
          url: 'https://hrrrzarr.s3.amazonaws.com/sfc/20200903/20200903_00z_fcst.zarr/2m_above_ground/TMP',
          variable: '2m_above_ground/TMP',
          zarrVersion: 2,
          crs: 'HRRR:LCC',
          proj4:
            '+proj=lcc +lat_1=38.5 +lat_2=38.5 +lat_0=38.5 +lon_0=-97.5 +x_0=0 +y_0=0 +R=6371229 +units=m +no_defs',
          dimensionNames: {
            lon: 'projection_x_coordinate',
            lat: 'projection_y_coordinate',
            elevation: 'time'
          },
          selectors: {
            elevation: {
              selected: [0, 36],
              type: 'index'
            }
          },
          bounds: { west: -107, south: 38, east: -103, north: 42 },
          scale: [250, 310],
          colormap: 'hot',
          elevationMode: 'depth',
          verticalExaggeration: 1000,
          showHorizontalSlices: true,
          showVerticalSlices: true,
          latIsAscending: true
        }
      },
      sea_ice_age_projected_cube: {
        dataType: 'zarr-cube',
        dataDescription: ['Sea ice age', 'years'],
        tags: ['V3', 'cube', 'polar', 'epsg:3408', 'proj4'],
        content:
          'Projection implementation example only, not a real physical 3D dataset demonstration. NSIDC sea-ice age is displayed as a projected space-time cube; the vertical axis represents the first 8 observation times rather than physical elevation.',
        params: {
          url: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/openday/age_of_sea_ice.zarr',
          variable: 'age_of_sea_ice',
          zarrVersion: 3,
          crs: 'EPSG:3408',
          proj4:
            '+proj=laea +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +a=6371228 +b=6371228 +units=m +no_defs',
          dimensionNames: {
            lon: 'x',
            lat: 'y',
            elevation: 'time'
          },
          selectors: {
            elevation: {
              selected: [0, 8],
              type: 'index'
            }
          },
          scale: [0, 5],
          colormap: 'cool',
          noDataMin: 0.5,
          noDataMax: 19.5,
          elevationMode: 'depth',
          verticalExaggeration: 20000,
          showHorizontalSlices: true,
          showVerticalSlices: true,
          latIsAscending: true
        }
      },
    },
  },
  '3D Cube Velocity Visualisation': {
    layerNames: {
      currents_2d_v2: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Currents', 'm/s'],
        tags: ['V2', 'epsg:4326'],
        content:
          'Currents outputs from NEMO NPD-EORCA1 model. This dataset contains 4D velocity data (time, depth, latitude, longitude) stored in a Zarr v2 format and EPSG:4326 coordinate reference system.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/vo.zarr'
          },
          variables: { u: 'uo', v: 'vo' },
          bounds: {
            west: -180,
            south: -89.72809667673717,
            east: 180,
            north: 89.72809667673717
          },
          latIsAscending: false,
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
          scale: [0, 0.7],
          verticalExaggeration: undefined,
          sliceSpacing: undefined,
          elevationMode: undefined,
          dimensionNames: undefined,
          multiscaleLevel: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: {
            particlesTextureSize: 400,
            lineWidth: { min: 1.5, max: 8 },
            lineLength: { min: 0, max: 1000 },
            speedFactor: 12,
            dropRate: 0.002,
            dropRateBump: 0.01,
            minVisibleRatio: 0.6,
            useViewerBounds: false,
            dynamic: true
          }
        }
      },
      currents_3d_v2: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Currents', 'm/s'],
        tags: ['V2', 'epsg:4326'],
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
          latIsAscending: false,
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
          elevationMode: undefined,
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
        tags: ['V3', 'multiscale', 'epsg:3857'],
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
            },
            elevation: {
              selected: [0, 22]
            }
          },
          colormap: 'jet',
          scale: [0, 0.5],
          verticalExaggeration: undefined,
          sliceSpacing: undefined,
          elevationMode: undefined,
          dimensionNames: undefined,
          multiscaleLevel: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: undefined
        }
      },
      currents_3d_pyramid_geozarr: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Currents', 'm/s'],
        tags: ['V3', 'multiscale', 'geozarr', 'epsg:4326'],
        content:
          'Currents outputs from NEMO NPD-EORCA1 model. This dataset contains 4D velocity data (time, depth, latitude, longitude) stored in a Zarr v3 format with a multiscale pyramid structure and EPSG:3857 coordinate reference system.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demov2/prod10/eorca1_U/U1y/uo',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/noc-npd-era5-demov2/prod10/eorca1_V/V1y/vo'
          },
          variables: { u: 'uo', v: 'vo' },
          bounds: { west: -50, south: -20, east: 10, north: 20 },
          flipElevation: true,
          zarrVersion: 3,
          latIsAscending: true,
          selectors: {
            time: {
              selected: 0
            },
            elevation: {
              selected: [0, 22]
            }
          },
          colormap: 'jet',
          scale: [0, 0.5],
          verticalExaggeration: undefined,
          sliceSpacing: undefined,
          elevationMode: undefined,
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
        tags: ['V3', 'atm', 'multiscale', 'epsg:4326'],
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
          elevationMode: undefined,
          multiscaleLevel: undefined,
          opacity: undefined,
          crs: undefined,
          windOptions: {
            speedFactor: 0.2,
            lineLength: { min: 0, max: 400 }
          }
        }
      },
      sea_ice_age_projected_velocity: {
        dataType: 'zarr-cube-velocity',
        dataDescription: ['Synthetic projected vectors', 'arbitrary units'],
        tags: ['V3', 'polar', 'epsg:3408', 'proj4', 'synthetic'],
        content:
          'Projection implementation example only, not a real velocity dataset demonstration. The sea-ice-age scalar is deliberately used as both the grid-relative U and V component to exercise projected-grid resampling and vector rotation. The resulting particle directions and speeds have no scientific meaning.',
        params: {
          urls: {
            u: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/openday/age_of_sea_ice.zarr',
            v: 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/openday/age_of_sea_ice.zarr'
          },
          variables: {
            u: 'age_of_sea_ice',
            v: 'age_of_sea_ice'
          },
          zarrVersion: 3,
          crs: 'EPSG:3408',
          proj4:
            '+proj=laea +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +a=6371228 +b=6371228 +units=m +no_defs',
          dimensionNames: {
            lon: 'x',
            lat: 'y',
            elevation: 'time'
          },
          selectors: {
            elevation: {
              selected: 0,
              type: 'index'
            }
          },
          latIsAscending: true,
          scale: [0, 7],
          colormap: 'cool',
          elevationMode: 'height',
          verticalExaggeration: 0,
          windOptions: {
            particlesTextureSize: 120,
            lineWidth: { min: 1, max: 4 },
            lineLength: { min: 0, max: 300 },
            speedFactor: 0.02,
            dropRate: 0.003,
            dropRateBump: 0.01,
            useViewerBounds: false,
            dynamic: true
          }
        }
      },
    }
  }
};
