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
    },
    {
      type: "category",
      label: "Variables",
      items: [
        {
          type: "doc",
          id: "api/variables/Accent",
          label: "Accent"
        },
        {
          type: "doc",
          id: "api/variables/AccentR",
          label: "AccentR"
        },
        {
          type: "doc",
          id: "api/variables/afmhot",
          label: "afmhot"
        },
        {
          type: "doc",
          id: "api/variables/afmhotR",
          label: "afmhotR"
        },
        {
          type: "doc",
          id: "api/variables/allColorScales",
          label: "allColorScales"
        },
        {
          type: "doc",
          id: "api/variables/autumn",
          label: "autumn"
        },
        {
          type: "doc",
          id: "api/variables/autumnR",
          label: "autumnR"
        },
        {
          type: "doc",
          id: "api/variables/binary",
          label: "binary"
        },
        {
          type: "doc",
          id: "api/variables/binaryR",
          label: "binaryR"
        },
        {
          type: "doc",
          id: "api/variables/Blues",
          label: "Blues"
        },
        {
          type: "doc",
          id: "api/variables/BluesR",
          label: "BluesR"
        },
        {
          type: "doc",
          id: "api/variables/bone",
          label: "bone"
        },
        {
          type: "doc",
          id: "api/variables/boneR",
          label: "boneR"
        },
        {
          type: "doc",
          id: "api/variables/BrBG",
          label: "BrBG"
        },
        {
          type: "doc",
          id: "api/variables/BrBGR",
          label: "BrBGR"
        },
        {
          type: "doc",
          id: "api/variables/brg",
          label: "brg"
        },
        {
          type: "doc",
          id: "api/variables/brgR",
          label: "brgR"
        },
        {
          type: "doc",
          id: "api/variables/BuGn",
          label: "BuGn"
        },
        {
          type: "doc",
          id: "api/variables/BuGnR",
          label: "BuGnR"
        },
        {
          type: "doc",
          id: "api/variables/BuPu",
          label: "BuPu"
        },
        {
          type: "doc",
          id: "api/variables/BuPuR",
          label: "BuPuR"
        },
        {
          type: "doc",
          id: "api/variables/bwr",
          label: "bwr"
        },
        {
          type: "doc",
          id: "api/variables/bwrR",
          label: "bwrR"
        },
        {
          type: "doc",
          id: "api/variables/cividis",
          label: "cividis"
        },
        {
          type: "doc",
          id: "api/variables/cividisR",
          label: "cividisR"
        },
        {
          type: "doc",
          id: "api/variables/CMRmap",
          label: "CMRmap"
        },
        {
          type: "doc",
          id: "api/variables/CMRmapR",
          label: "CMRmapR"
        },
        {
          type: "doc",
          id: "api/variables/cool",
          label: "cool"
        },
        {
          type: "doc",
          id: "api/variables/coolR",
          label: "coolR"
        },
        {
          type: "doc",
          id: "api/variables/coolwarm",
          label: "coolwarm"
        },
        {
          type: "doc",
          id: "api/variables/coolwarmR",
          label: "coolwarmR"
        },
        {
          type: "doc",
          id: "api/variables/copper",
          label: "copper"
        },
        {
          type: "doc",
          id: "api/variables/copperR",
          label: "copperR"
        },
        {
          type: "doc",
          id: "api/variables/cubehelix",
          label: "cubehelix"
        },
        {
          type: "doc",
          id: "api/variables/cubehelixR",
          label: "cubehelixR"
        },
        {
          type: "doc",
          id: "api/variables/Dark2",
          label: "Dark2"
        },
        {
          type: "doc",
          id: "api/variables/Dark2R",
          label: "Dark2R"
        },
        {
          type: "doc",
          id: "api/variables/DEFAULT_COLORMAP",
          label: "DEFAULT_COLORMAP"
        },
        {
          type: "doc",
          id: "api/variables/DEFAULT_OPACITY",
          label: "DEFAULT_OPACITY"
        },
        {
          type: "doc",
          id: "api/variables/DEFAULT_SCALE",
          label: "DEFAULT_SCALE"
        },
        {
          type: "doc",
          id: "api/variables/DEFAULT_VERTICAL_EXAGGERATION",
          label: "DEFAULT_VERTICAL_EXAGGERATION"
        },
        {
          type: "doc",
          id: "api/variables/DEFAULT_WIND_OPTIONS",
          label: "DEFAULT_WIND_OPTIONS"
        },
        {
          type: "doc",
          id: "api/variables/flag",
          label: "flag"
        },
        {
          type: "doc",
          id: "api/variables/flagR",
          label: "flagR"
        },
        {
          type: "doc",
          id: "api/variables/fragmentShaderSource",
          label: "fragmentShaderSource"
        },
        {
          type: "doc",
          id: "api/variables/gistEarth",
          label: "gistEarth"
        },
        {
          type: "doc",
          id: "api/variables/gistEarthR",
          label: "gistEarthR"
        },
        {
          type: "doc",
          id: "api/variables/gistGray",
          label: "gistGray"
        },
        {
          type: "doc",
          id: "api/variables/gistGrayR",
          label: "gistGrayR"
        },
        {
          type: "doc",
          id: "api/variables/gistHeat",
          label: "gistHeat"
        },
        {
          type: "doc",
          id: "api/variables/gistHeatR",
          label: "gistHeatR"
        },
        {
          type: "doc",
          id: "api/variables/gistNcar",
          label: "gistNcar"
        },
        {
          type: "doc",
          id: "api/variables/gistNcarR",
          label: "gistNcarR"
        },
        {
          type: "doc",
          id: "api/variables/gistRainbow",
          label: "gistRainbow"
        },
        {
          type: "doc",
          id: "api/variables/gistRainbowR",
          label: "gistRainbowR"
        },
        {
          type: "doc",
          id: "api/variables/gistStern",
          label: "gistStern"
        },
        {
          type: "doc",
          id: "api/variables/gistSternR",
          label: "gistSternR"
        },
        {
          type: "doc",
          id: "api/variables/gistYarg",
          label: "gistYarg"
        },
        {
          type: "doc",
          id: "api/variables/gistYargR",
          label: "gistYargR"
        },
        {
          type: "doc",
          id: "api/variables/GnBu",
          label: "GnBu"
        },
        {
          type: "doc",
          id: "api/variables/GnBuR",
          label: "GnBuR"
        },
        {
          type: "doc",
          id: "api/variables/gnuplot",
          label: "gnuplot"
        },
        {
          type: "doc",
          id: "api/variables/gnuplot2",
          label: "gnuplot2"
        },
        {
          type: "doc",
          id: "api/variables/gnuplot2R",
          label: "gnuplot2R"
        },
        {
          type: "doc",
          id: "api/variables/gnuplotR",
          label: "gnuplotR"
        },
        {
          type: "doc",
          id: "api/variables/gray",
          label: "gray"
        },
        {
          type: "doc",
          id: "api/variables/grayR",
          label: "grayR"
        },
        {
          type: "doc",
          id: "api/variables/Greens",
          label: "Greens"
        },
        {
          type: "doc",
          id: "api/variables/GreensR",
          label: "GreensR"
        },
        {
          type: "doc",
          id: "api/variables/Greys",
          label: "Greys"
        },
        {
          type: "doc",
          id: "api/variables/GreysR",
          label: "GreysR"
        },
        {
          type: "doc",
          id: "api/variables/hot",
          label: "hot"
        },
        {
          type: "doc",
          id: "api/variables/hotR",
          label: "hotR"
        },
        {
          type: "doc",
          id: "api/variables/hsv",
          label: "hsv"
        },
        {
          type: "doc",
          id: "api/variables/hsvR",
          label: "hsvR"
        },
        {
          type: "doc",
          id: "api/variables/inferno",
          label: "inferno"
        },
        {
          type: "doc",
          id: "api/variables/infernoR",
          label: "infernoR"
        },
        {
          type: "doc",
          id: "api/variables/jet",
          label: "jet"
        },
        {
          type: "doc",
          id: "api/variables/jetR",
          label: "jetR"
        },
        {
          type: "doc",
          id: "api/variables/magma",
          label: "magma"
        },
        {
          type: "doc",
          id: "api/variables/magmaR",
          label: "magmaR"
        },
        {
          type: "doc",
          id: "api/variables/mercProj",
          label: "mercProj"
        },
        {
          type: "doc",
          id: "api/variables/nipySpectral",
          label: "nipySpectral"
        },
        {
          type: "doc",
          id: "api/variables/nipySpectralR",
          label: "nipySpectralR"
        },
        {
          type: "doc",
          id: "api/variables/ocean",
          label: "ocean"
        },
        {
          type: "doc",
          id: "api/variables/oceanR",
          label: "oceanR"
        },
        {
          type: "doc",
          id: "api/variables/Oranges",
          label: "Oranges"
        },
        {
          type: "doc",
          id: "api/variables/OrangesR",
          label: "OrangesR"
        },
        {
          type: "doc",
          id: "api/variables/OrRd",
          label: "OrRd"
        },
        {
          type: "doc",
          id: "api/variables/OrRdR",
          label: "OrRdR"
        },
        {
          type: "doc",
          id: "api/variables/Paired",
          label: "Paired"
        },
        {
          type: "doc",
          id: "api/variables/PairedR",
          label: "PairedR"
        },
        {
          type: "doc",
          id: "api/variables/Pastel1",
          label: "Pastel1"
        },
        {
          type: "doc",
          id: "api/variables/Pastel1R",
          label: "Pastel1R"
        },
        {
          type: "doc",
          id: "api/variables/Pastel2",
          label: "Pastel2"
        },
        {
          type: "doc",
          id: "api/variables/Pastel2R",
          label: "Pastel2R"
        },
        {
          type: "doc",
          id: "api/variables/pink",
          label: "pink"
        },
        {
          type: "doc",
          id: "api/variables/pinkR",
          label: "pinkR"
        },
        {
          type: "doc",
          id: "api/variables/PiYG",
          label: "PiYG"
        },
        {
          type: "doc",
          id: "api/variables/PiYGR",
          label: "PiYGR"
        },
        {
          type: "doc",
          id: "api/variables/plasma",
          label: "plasma"
        },
        {
          type: "doc",
          id: "api/variables/plasmaR",
          label: "plasmaR"
        },
        {
          type: "doc",
          id: "api/variables/PRGn",
          label: "PRGn"
        },
        {
          type: "doc",
          id: "api/variables/PRGnR",
          label: "PRGnR"
        },
        {
          type: "doc",
          id: "api/variables/prism",
          label: "prism"
        },
        {
          type: "doc",
          id: "api/variables/prismR",
          label: "prismR"
        },
        {
          type: "doc",
          id: "api/variables/PuBu",
          label: "PuBu"
        },
        {
          type: "doc",
          id: "api/variables/PuBuGn",
          label: "PuBuGn"
        },
        {
          type: "doc",
          id: "api/variables/PuBuGnR",
          label: "PuBuGnR"
        },
        {
          type: "doc",
          id: "api/variables/PuBuR",
          label: "PuBuR"
        },
        {
          type: "doc",
          id: "api/variables/PuOr",
          label: "PuOr"
        },
        {
          type: "doc",
          id: "api/variables/PuOrR",
          label: "PuOrR"
        },
        {
          type: "doc",
          id: "api/variables/PuRd",
          label: "PuRd"
        },
        {
          type: "doc",
          id: "api/variables/PuRdR",
          label: "PuRdR"
        },
        {
          type: "doc",
          id: "api/variables/Purples",
          label: "Purples"
        },
        {
          type: "doc",
          id: "api/variables/PurplesR",
          label: "PurplesR"
        },
        {
          type: "doc",
          id: "api/variables/rainbow",
          label: "rainbow"
        },
        {
          type: "doc",
          id: "api/variables/rainbowR",
          label: "rainbowR"
        },
        {
          type: "doc",
          id: "api/variables/RdBu",
          label: "RdBu"
        },
        {
          type: "doc",
          id: "api/variables/RdBuR",
          label: "RdBuR"
        },
        {
          type: "doc",
          id: "api/variables/RdGy",
          label: "RdGy"
        },
        {
          type: "doc",
          id: "api/variables/RdGyR",
          label: "RdGyR"
        },
        {
          type: "doc",
          id: "api/variables/RdPu",
          label: "RdPu"
        },
        {
          type: "doc",
          id: "api/variables/RdPuR",
          label: "RdPuR"
        },
        {
          type: "doc",
          id: "api/variables/RdYlBu",
          label: "RdYlBu"
        },
        {
          type: "doc",
          id: "api/variables/RdYlBuR",
          label: "RdYlBuR"
        },
        {
          type: "doc",
          id: "api/variables/RdYlGn",
          label: "RdYlGn"
        },
        {
          type: "doc",
          id: "api/variables/RdYlGnR",
          label: "RdYlGnR"
        },
        {
          type: "doc",
          id: "api/variables/Reds",
          label: "Reds"
        },
        {
          type: "doc",
          id: "api/variables/RedsR",
          label: "RedsR"
        },
        {
          type: "doc",
          id: "api/variables/seismic",
          label: "seismic"
        },
        {
          type: "doc",
          id: "api/variables/seismicR",
          label: "seismicR"
        },
        {
          type: "doc",
          id: "api/variables/Set1",
          label: "Set1"
        },
        {
          type: "doc",
          id: "api/variables/Set1R",
          label: "Set1R"
        },
        {
          type: "doc",
          id: "api/variables/Set2",
          label: "Set2"
        },
        {
          type: "doc",
          id: "api/variables/Set2R",
          label: "Set2R"
        },
        {
          type: "doc",
          id: "api/variables/Set3",
          label: "Set3"
        },
        {
          type: "doc",
          id: "api/variables/Set3R",
          label: "Set3R"
        },
        {
          type: "doc",
          id: "api/variables/Spectral",
          label: "Spectral"
        },
        {
          type: "doc",
          id: "api/variables/SpectralR",
          label: "SpectralR"
        },
        {
          type: "doc",
          id: "api/variables/spring",
          label: "spring"
        },
        {
          type: "doc",
          id: "api/variables/springR",
          label: "springR"
        },
        {
          type: "doc",
          id: "api/variables/summer",
          label: "summer"
        },
        {
          type: "doc",
          id: "api/variables/summerR",
          label: "summerR"
        },
        {
          type: "doc",
          id: "api/variables/tab10",
          label: "tab10"
        },
        {
          type: "doc",
          id: "api/variables/tab10R",
          label: "tab10R"
        },
        {
          type: "doc",
          id: "api/variables/tab20",
          label: "tab20"
        },
        {
          type: "doc",
          id: "api/variables/tab20b",
          label: "tab20b"
        },
        {
          type: "doc",
          id: "api/variables/tab20bR",
          label: "tab20bR"
        },
        {
          type: "doc",
          id: "api/variables/tab20c",
          label: "tab20c"
        },
        {
          type: "doc",
          id: "api/variables/tab20cR",
          label: "tab20cR"
        },
        {
          type: "doc",
          id: "api/variables/tab20R",
          label: "tab20R"
        },
        {
          type: "doc",
          id: "api/variables/terrain",
          label: "terrain"
        },
        {
          type: "doc",
          id: "api/variables/terrainR",
          label: "terrainR"
        },
        {
          type: "doc",
          id: "api/variables/turbo",
          label: "turbo"
        },
        {
          type: "doc",
          id: "api/variables/turboR",
          label: "turboR"
        },
        {
          type: "doc",
          id: "api/variables/twilight",
          label: "twilight"
        },
        {
          type: "doc",
          id: "api/variables/twilightR",
          label: "twilightR"
        },
        {
          type: "doc",
          id: "api/variables/twilightShifted",
          label: "twilightShifted"
        },
        {
          type: "doc",
          id: "api/variables/twilightShiftedR",
          label: "twilightShiftedR"
        },
        {
          type: "doc",
          id: "api/variables/vertexShaderSource",
          label: "vertexShaderSource"
        },
        {
          type: "doc",
          id: "api/variables/viridis",
          label: "viridis"
        },
        {
          type: "doc",
          id: "api/variables/viridisR",
          label: "viridisR"
        },
        {
          type: "doc",
          id: "api/variables/winter",
          label: "winter"
        },
        {
          type: "doc",
          id: "api/variables/winterR",
          label: "winterR"
        },
        {
          type: "doc",
          id: "api/variables/Wistia",
          label: "Wistia"
        },
        {
          type: "doc",
          id: "api/variables/WistiaR",
          label: "WistiaR"
        },
        {
          type: "doc",
          id: "api/variables/YlGn",
          label: "YlGn"
        },
        {
          type: "doc",
          id: "api/variables/YlGnBu",
          label: "YlGnBu"
        },
        {
          type: "doc",
          id: "api/variables/YlGnBuR",
          label: "YlGnBuR"
        },
        {
          type: "doc",
          id: "api/variables/YlGnR",
          label: "YlGnR"
        },
        {
          type: "doc",
          id: "api/variables/YlOrBr",
          label: "YlOrBr"
        },
        {
          type: "doc",
          id: "api/variables/YlOrBrR",
          label: "YlOrBrR"
        },
        {
          type: "doc",
          id: "api/variables/YlOrRd",
          label: "YlOrRd"
        },
        {
          type: "doc",
          id: "api/variables/YlOrRdR",
          label: "YlOrRdR"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;