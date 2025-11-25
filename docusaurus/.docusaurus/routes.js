import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/zarr-cesium/docs/__docusaurus/debug',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug', 'db1'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/__docusaurus/debug/config',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug/config', '8b2'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/__docusaurus/debug/content',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug/content', '019'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/__docusaurus/debug/globalData',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug/globalData', 'b3b'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/__docusaurus/debug/metadata',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug/metadata', 'ece'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/__docusaurus/debug/registry',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug/registry', '6de'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/__docusaurus/debug/routes',
    component: ComponentCreator('/zarr-cesium/docs/__docusaurus/debug/routes', 'bbf'),
    exact: true
  },
  {
    path: '/zarr-cesium/docs/docs',
    component: ComponentCreator('/zarr-cesium/docs/docs', '7fe'),
    routes: [
      {
        path: '/zarr-cesium/docs/docs',
        component: ComponentCreator('/zarr-cesium/docs/docs', 'fde'),
        routes: [
          {
            path: '/zarr-cesium/docs/docs',
            component: ComponentCreator('/zarr-cesium/docs/docs', '15b'),
            routes: [
              {
                path: '/zarr-cesium/docs/docs/',
                component: ComponentCreator('/zarr-cesium/docs/docs/', '08c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/', '227'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/classes/ZarrCubeProvider',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/classes/ZarrCubeProvider', '62e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/classes/ZarrCubeVelocityProvider',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/classes/ZarrCubeVelocityProvider', 'f6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/classes/ZarrImageryLayer',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/classes/ZarrImageryLayer', '5c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/classes/ZarrLayerProvider',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/classes/ZarrLayerProvider', 'e56'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/calculateElevationSlice',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/calculateElevationSlice', '9c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/calculateHeightMeters',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/calculateHeightMeters', 'f10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/calculateNearestIndex',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/calculateNearestIndex', '3e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/calculateSliceArgs',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/calculateSliceArgs', 'd24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/calculateXYFromBounds',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/calculateXYFromBounds', '3c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/colormapBuilder',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/colormapBuilder', '3c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/colorScaleByName',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/colorScaleByName', '8fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/createColorRampTexture',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/createColorRampTexture', '986'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/createProgram',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/createProgram', '4f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/createShader',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/createShader', '20b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/deriveRectangleAndScheme',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/deriveRectangleAndScheme', '3fa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/detectCRS',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/detectCRS', '70c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/extractNoDataMetadata',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/extractNoDataMetadata', '217'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/getCubeDimensions',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/getCubeDimensions', '420'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/getXYLimits',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/getXYLimits', '279'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/identifyDimensionIndices',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/identifyDimensionIndices', 'adf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/initZarrDataset',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/initZarrDataset', '40e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/latDegToMercY',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/latDegToMercY', 'e90'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/loadDimensionValues',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/loadDimensionValues', '5d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/lonDegToMercX',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/lonDegToMercX', '9f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/openLevelArray',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/openLevelArray', 'c66'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/resolveNoDataRange',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/resolveNoDataRange', '117'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/updateImgData',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/updateImgData', '002'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/functions/validateBounds',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/functions/validateBounds', 'b2f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/BoundsProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/BoundsProps', 'ea1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/ColorMapInfo',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/ColorMapInfo', '0ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/ColorScaleProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/ColorScaleProps', '85c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/CubeOptions',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/CubeOptions', 'bfd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/CubeVelocityProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/CubeVelocityProps', '808'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/DataSliceProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/DataSliceProps', 'f21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/DimensionNamesProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/DimensionNamesProps', 'a4b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/DimensionValues',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/DimensionValues', '215'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/DimIndicesProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/DimIndicesProps', '780'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/LayerOptions',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/LayerOptions', 'ce8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/VelocityOptions',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/VelocityOptions', 'b44'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/XYLimits',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/XYLimits', '1fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/XYLimitsProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/XYLimitsProps', '4c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/ZarrLevelMetadata',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/ZarrLevelMetadata', '142'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/interfaces/ZarrSelectorsProps',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/interfaces/ZarrSelectorsProps', '0fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/type-aliases/ColorMapName',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/type-aliases/ColorMapName', 'd55'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/type-aliases/CRS',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/type-aliases/CRS', 'fba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/type-aliases/SliceArgs',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/type-aliases/SliceArgs', 'd73'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Accent',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Accent', 'd5e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/AccentR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/AccentR', 'baa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/afmhot',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/afmhot', 'b9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/afmhotR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/afmhotR', '2a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/allColorScales',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/allColorScales', '910'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/autumn',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/autumn', '58a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/autumnR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/autumnR', '09a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/binary',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/binary', '7f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/binaryR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/binaryR', '0f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Blues',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Blues', '5ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BluesR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BluesR', 'bff'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/bone',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/bone', 'ad2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/boneR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/boneR', 'e0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BrBG',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BrBG', 'c48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BrBGR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BrBGR', '62e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/brg',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/brg', '685'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/brgR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/brgR', '9ad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BuGn',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BuGn', 'db2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BuGnR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BuGnR', '36b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BuPu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BuPu', 'cda'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/BuPuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/BuPuR', '5bf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/bwr',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/bwr', '3e7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/bwrR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/bwrR', '032'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/cividis',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/cividis', 'b76'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/cividisR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/cividisR', 'ad0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/CMRmap',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/CMRmap', '201'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/CMRmapR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/CMRmapR', '1fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/cool',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/cool', 'f62'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/coolR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/coolR', '0f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/coolwarm',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/coolwarm', 'e2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/coolwarmR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/coolwarmR', '77e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/copper',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/copper', 'a7f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/copperR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/copperR', 'ffd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/cubehelix',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/cubehelix', 'e39'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/cubehelixR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/cubehelixR', 'cf3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Dark2',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Dark2', '83c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Dark2R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Dark2R', '864'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/DEFAULT_COLORMAP',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/DEFAULT_COLORMAP', '2a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/DEFAULT_OPACITY',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/DEFAULT_OPACITY', 'acd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/DEFAULT_SCALE',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/DEFAULT_SCALE', 'c37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/DEFAULT_VERTICAL_EXAGGERATION',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/DEFAULT_VERTICAL_EXAGGERATION', '811'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/DEFAULT_WIND_OPTIONS',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/DEFAULT_WIND_OPTIONS', '60c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/flag',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/flag', '4d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/flagR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/flagR', '86b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/fragmentShaderSource',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/fragmentShaderSource', '51e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistEarth',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistEarth', '39a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistEarthR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistEarthR', 'f06'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistGray',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistGray', 'fb1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistGrayR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistGrayR', 'e56'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistHeat',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistHeat', '23d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistHeatR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistHeatR', 'aab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistNcar',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistNcar', '8ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistNcarR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistNcarR', 'db0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistRainbow',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistRainbow', 'c8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistRainbowR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistRainbowR', '259'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistStern',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistStern', 'e6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistSternR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistSternR', '269'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistYarg',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistYarg', 'a23'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gistYargR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gistYargR', 'e16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/GnBu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/GnBu', '549'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/GnBuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/GnBuR', 'f5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gnuplot',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gnuplot', 'fdc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gnuplot2',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gnuplot2', 'e7b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gnuplot2R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gnuplot2R', 'd6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gnuplotR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gnuplotR', '57f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/gray',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/gray', 'ed6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/grayR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/grayR', 'b36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Greens',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Greens', 'a28'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/GreensR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/GreensR', 'e11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Greys',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Greys', '2e7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/GreysR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/GreysR', 'dcc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/hot',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/hot', '5e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/hotR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/hotR', '667'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/hsv',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/hsv', 'a49'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/hsvR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/hsvR', '1d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/inferno',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/inferno', '744'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/infernoR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/infernoR', '5cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/jet',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/jet', 'a38'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/jetR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/jetR', '400'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/magma',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/magma', 'f18'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/magmaR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/magmaR', '1f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/mercProj',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/mercProj', '527'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/nipySpectral',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/nipySpectral', '7b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/nipySpectralR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/nipySpectralR', 'c8f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/ocean',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/ocean', '41a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/oceanR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/oceanR', '2e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Oranges',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Oranges', '333'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/OrangesR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/OrangesR', '1c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/OrRd',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/OrRd', 'e0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/OrRdR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/OrRdR', 'a2f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Paired',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Paired', '54b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PairedR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PairedR', '16b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Pastel1',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Pastel1', '17b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Pastel1R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Pastel1R', '118'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Pastel2',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Pastel2', '8f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Pastel2R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Pastel2R', '34d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/pink',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/pink', '5f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/pinkR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/pinkR', '2bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PiYG',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PiYG', 'bbb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PiYGR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PiYGR', '9b8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/plasma',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/plasma', 'bb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/plasmaR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/plasmaR', 'dbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PRGn',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PRGn', '432'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PRGnR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PRGnR', '917'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/prism',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/prism', 'db8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/prismR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/prismR', 'e8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuBu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuBu', '2f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuBuGn',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuBuGn', '1b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuBuGnR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuBuGnR', 'df2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuBuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuBuR', 'd60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuOr',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuOr', 'dbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuOrR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuOrR', '832'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuRd',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuRd', '641'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PuRdR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PuRdR', '571'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Purples',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Purples', '006'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/PurplesR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/PurplesR', '769'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/rainbow',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/rainbow', '97b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/rainbowR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/rainbowR', '2ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdBu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdBu', '3fa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdBuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdBuR', 'd13'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdGy',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdGy', '070'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdGyR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdGyR', '6b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdPu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdPu', 'cd8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdPuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdPuR', 'a3b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdYlBu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdYlBu', '414'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdYlBuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdYlBuR', 'fe9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdYlGn',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdYlGn', 'e3d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RdYlGnR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RdYlGnR', 'f47'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Reds',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Reds', 'f2c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/RedsR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/RedsR', '6d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/seismic',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/seismic', '8ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/seismicR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/seismicR', '2dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Set1',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Set1', '6a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Set1R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Set1R', '0da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Set2',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Set2', '7a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Set2R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Set2R', '009'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Set3',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Set3', 'e64'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Set3R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Set3R', 'c6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Spectral',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Spectral', '026'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/SpectralR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/SpectralR', 'c2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/spring',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/spring', '016'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/springR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/springR', 'b95'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/summer',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/summer', '882'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/summerR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/summerR', '1e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab10',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab10', 'efb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab10R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab10R', '5b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab20',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab20', 'cc1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab20b',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab20b', 'c58'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab20bR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab20bR', 'ac0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab20c',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab20c', '717'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab20cR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab20cR', '5d7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/tab20R',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/tab20R', '0e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/terrain',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/terrain', 'a9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/terrainR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/terrainR', 'd2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/turbo',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/turbo', '1b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/turboR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/turboR', '9e7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/twilight',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/twilight', '9d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/twilightR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/twilightR', '288'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/twilightShifted',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/twilightShifted', '753'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/twilightShiftedR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/twilightShiftedR', '89c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/vertexShaderSource',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/vertexShaderSource', 'c76'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/viridis',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/viridis', 'c99'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/viridisR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/viridisR', '6fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/winter',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/winter', 'bcb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/winterR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/winterR', '852'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/Wistia',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/Wistia', 'd0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/WistiaR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/WistiaR', 'dec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlGn',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlGn', 'd52'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlGnBu',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlGnBu', '2e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlGnBuR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlGnBuR', '940'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlGnR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlGnR', '875'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlOrBr',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlOrBr', 'f92'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlOrBrR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlOrBrR', '336'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlOrRd',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlOrRd', 'cfd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/api/variables/YlOrRdR',
                component: ComponentCreator('/zarr-cesium/docs/docs/api/variables/YlOrRdR', '007'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/data',
                component: ComponentCreator('/zarr-cesium/docs/docs/data', '052'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/getting-started',
                component: ComponentCreator('/zarr-cesium/docs/docs/getting-started', '3d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/providers/zarr-cube-provider',
                component: ComponentCreator('/zarr-cesium/docs/docs/providers/zarr-cube-provider', '319'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/providers/zarr-cube-velocity-provider',
                component: ComponentCreator('/zarr-cesium/docs/docs/providers/zarr-cube-velocity-provider', 'c66'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/zarr-cesium/docs/docs/providers/zarr-layer-provider',
                component: ComponentCreator('/zarr-cesium/docs/docs/providers/zarr-layer-provider', '6d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
