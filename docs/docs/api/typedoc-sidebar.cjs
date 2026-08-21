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
        },
        {
          type: "doc",
          id: "api/classes/ZarrTileProvider",
          label: "ZarrTileProvider"
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
          id: "api/interfaces/FullTransectResult",
          label: "FullTransectResult"
        },
        {
          type: "doc",
          id: "api/interfaces/LayerOptions",
          label: "LayerOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/QueryBackend",
          label: "QueryBackend"
        },
        {
          type: "doc",
          id: "api/interfaces/QueryMultiPolygonGeometry",
          label: "QueryMultiPolygonGeometry"
        },
        {
          type: "doc",
          id: "api/interfaces/QueryOptions",
          label: "QueryOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/QueryPointGeometry",
          label: "QueryPointGeometry"
        },
        {
          type: "doc",
          id: "api/interfaces/QueryPolygonGeometry",
          label: "QueryPolygonGeometry"
        },
        {
          type: "doc",
          id: "api/interfaces/QueryResult",
          label: "QueryResult"
        },
        {
          type: "doc",
          id: "api/interfaces/RequestOverrides",
          label: "RequestOverrides"
        },
        {
          type: "doc",
          id: "api/interfaces/RequestParameters",
          label: "RequestParameters"
        },
        {
          type: "doc",
          id: "api/interfaces/TransectQueryOptions",
          label: "TransectQueryOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/TransectResult",
          label: "TransectResult"
        },
        {
          type: "doc",
          id: "api/interfaces/VelocityOptions",
          label: "VelocityOptions"
        },
        {
          type: "doc",
          id: "api/interfaces/VelocityQueryResult",
          label: "VelocityQueryResult"
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
          id: "api/interfaces/ZarrSelectors",
          label: "ZarrSelectors"
        },
        {
          type: "doc",
          id: "api/interfaces/ZarrSelectorsProps",
          label: "ZarrSelectorsProps"
        },
        {
          type: "doc",
          id: "api/interfaces/ZarrTileOptions",
          label: "ZarrTileOptions"
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
          id: "api/functions/calculateSliceArgsRequestImage",
          label: "calculateSliceArgsRequestImage"
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
          id: "api/functions/decodeCFTime",
          label: "decodeCFTime"
        },
        {
          type: "doc",
          id: "api/functions/deriveRectangleAndScheme",
          label: "deriveRectangleAndScheme"
        },
        {
          type: "doc",
          id: "api/functions/detectBrowser",
          label: "detectBrowser"
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
          id: "api/functions/getFullTransect",
          label: "getFullTransect"
        },
        {
          type: "doc",
          id: "api/functions/getTimeSeries",
          label: "getTimeSeries"
        },
        {
          type: "doc",
          id: "api/functions/getTransect",
          label: "getTransect"
        },
        {
          type: "doc",
          id: "api/functions/getVerticalProfile",
          label: "getVerticalProfile"
        },
        {
          type: "doc",
          id: "api/functions/getXYLimits",
          label: "getXYLimits"
        },
        {
          type: "doc",
          id: "api/functions/getZarrData",
          label: "getZarrData"
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
          id: "api/functions/parseCFUnits",
          label: "parseCFUnits"
        },
        {
          type: "doc",
          id: "api/functions/resolveNoDataRange",
          label: "resolveNoDataRange"
        },
        {
          type: "doc",
          id: "api/functions/sampleTransectPositions",
          label: "sampleTransectPositions"
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
          id: "api/type-aliases/BrowserName",
          label: "BrowserName"
        },
        {
          type: "doc",
          id: "api/type-aliases/CalendarDate",
          label: "CalendarDate"
        },
        {
          type: "doc",
          id: "api/type-aliases/CesiumHost",
          label: "CesiumHost"
        },
        {
          type: "doc",
          id: "api/type-aliases/CFCalendar",
          label: "CFCalendar"
        },
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
          id: "api/type-aliases/MultiscaleFormat",
          label: "MultiscaleFormat"
        },
        {
          type: "doc",
          id: "api/type-aliases/OnAuthError",
          label: "OnAuthError"
        },
        {
          type: "doc",
          id: "api/type-aliases/QueryGeometry",
          label: "QueryGeometry"
        },
        {
          type: "doc",
          id: "api/type-aliases/QueryPosition",
          label: "QueryPosition"
        },
        {
          type: "doc",
          id: "api/type-aliases/SliceArgs",
          label: "SliceArgs"
        },
        {
          type: "doc",
          id: "api/type-aliases/TransformRequest",
          label: "TransformRequest"
        },
        {
          type: "doc",
          id: "api/type-aliases/VelocityWindOptions",
          label: "VelocityWindOptions"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;