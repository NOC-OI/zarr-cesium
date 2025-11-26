// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "Classes",
      items: [
        {
          type: "doc",
          id: "api/classes/ZarrCubeProvider",
          label: "ZarrCubeProvider"
        },
        {
          type: "doc",
          id: "api/classes/ZarrCubeVelocityProvider",
          label: "ZarrCubeVelocityProvider"
        },
        {
          type: "doc",
          id: "api/classes/ZarrImageryLayer",
          label: "ZarrImageryLayer"
        },
        {
          type: "doc",
          id: "api/classes/ZarrLayerProvider",
          label: "ZarrLayerProvider"
        }
      ]
    },
    {
      type: "category",
      label: "Interfaces",
      items: [
        {
          type: "doc",
          id: "api/interfaces/BoundsProps",
          label: "BoundsProps"
        },
        {
          type: "doc",
          id: "api/interfaces/ColorMapInfo",
          label: "ColorMapInfo"
        },
        {
          type: "doc",
          id: "api/interfaces/ColorScaleProps",
          label: "ColorScaleProps"
        },
        {
          type: "doc",
          id: "api/interfaces/CubeOptions",
          label: "CubeOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/CubeVelocityProps",
          label: "CubeVelocityProps"
        },
        {
          type: "doc",
          id: "api/interfaces/DataSliceProps",
          label: "DataSliceProps"
        },
        {
          type: "doc",
          id: "api/interfaces/DimensionNamesProps",
          label: "DimensionNamesProps"
        },
        {
          type: "doc",
          id: "api/interfaces/DimensionValues",
          label: "DimensionValues"
        },
        {
          type: "doc",
          id: "api/interfaces/DimIndicesProps",
          label: "DimIndicesProps"
        },
        {
          type: "doc",
          id: "api/interfaces/LayerOptions",
          label: "LayerOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/VelocityOptions",
          label: "VelocityOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/XYLimits",
          label: "XYLimits"
        },
        {
          type: "doc",
          id: "api/interfaces/XYLimitsProps",
          label: "XYLimitsProps"
        },
        {
          type: "doc",
          id: "api/interfaces/ZarrLevelMetadata",
          label: "ZarrLevelMetadata"
        },
        {
          type: "doc",
          id: "api/interfaces/ZarrSelectorsProps",
          label: "ZarrSelectorsProps"
        }
      ]
    },
    {
      type: "category",
      label: "Functions",
      items: [
        {
          type: "doc",
          id: "api/functions/calculateElevationSlice",
          label: "calculateElevationSlice"
        },
        {
          type: "doc",
          id: "api/functions/calculateHeightMeters",
          label: "calculateHeightMeters"
        },
        {
          type: "doc",
          id: "api/functions/calculateNearestIndex",
          label: "calculateNearestIndex"
        },
        {
          type: "doc",
          id: "api/functions/calculateSliceArgs",
          label: "calculateSliceArgs"
        },
        {
          type: "doc",
          id: "api/functions/calculateXYFromBounds",
          label: "calculateXYFromBounds"
        },
        {
          type: "doc",
          id: "api/functions/colormapBuilder",
          label: "colormapBuilder"
        },
        {
          type: "doc",
          id: "api/functions/colorScaleByName",
          label: "colorScaleByName"
        },
        {
          type: "doc",
          id: "api/functions/createColorRampTexture",
          label: "createColorRampTexture"
        },
        {
          type: "doc",
          id: "api/functions/createProgram",
          label: "createProgram"
        },
        {
          type: "doc",
          id: "api/functions/createShader",
          label: "createShader"
        },
        {
          type: "doc",
          id: "api/functions/deriveRectangleAndScheme",
          label: "deriveRectangleAndScheme"
        },
        {
          type: "doc",
          id: "api/functions/detectCRS",
          label: "detectCRS"
        },
        {
          type: "doc",
          id: "api/functions/extractNoDataMetadata",
          label: "extractNoDataMetadata"
        },
        {
          type: "doc",
          id: "api/functions/getCubeDimensions",
          label: "getCubeDimensions"
        },
        {
          type: "doc",
          id: "api/functions/getXYLimits",
          label: "getXYLimits"
        },
        {
          type: "doc",
          id: "api/functions/identifyDimensionIndices",
          label: "identifyDimensionIndices"
        },
        {
          type: "doc",
          id: "api/functions/initZarrDataset",
          label: "initZarrDataset"
        },
        {
          type: "doc",
          id: "api/functions/latDegToMercY",
          label: "latDegToMercY"
        },
        {
          type: "doc",
          id: "api/functions/loadDimensionValues",
          label: "loadDimensionValues"
        },
        {
          type: "doc",
          id: "api/functions/lonDegToMercX",
          label: "lonDegToMercX"
        },
        {
          type: "doc",
          id: "api/functions/openLevelArray",
          label: "openLevelArray"
        },
        {
          type: "doc",
          id: "api/functions/resolveNoDataRange",
          label: "resolveNoDataRange"
        },
        {
          type: "doc",
          id: "api/functions/updateImgData",
          label: "updateImgData"
        },
        {
          type: "doc",
          id: "api/functions/validateBounds",
          label: "validateBounds"
        }
      ]
    },
    {
      type: "category",
      label: "Type Aliases",
      items: [
        {
          type: "doc",
          id: "api/type-aliases/ColorMapName",
          label: "ColorMapName"
        },
        {
          type: "doc",
          id: "api/type-aliases/CRS",
          label: "CRS"
        },
        {
          type: "doc",
          id: "api/type-aliases/SliceArgs",
          label: "SliceArgs"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;