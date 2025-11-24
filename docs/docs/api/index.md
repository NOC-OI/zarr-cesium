# API Reference

## Classes

| Class | Description |
| ------ | ------ |
| [ZarrCubeProvider](classes/ZarrCubeProvider.md) | Provides rendering of volumetric (3D) Zarr datasets as Cesium primitives. |
| [ZarrCubeVelocityProvider](classes/ZarrCubeVelocityProvider.md) | Provider responsible for loading and rendering 3D velocity fields (U and V components) from Zarr datasets as animated Cesium `WindLayer`s. |
| [ZarrImageryLayer](classes/ZarrImageryLayer.md) | Custom Cesium imagery layer for Zarr datasets. |
| [ZarrLayerProvider](classes/ZarrLayerProvider.md) | Imagery provider for rendering Zarr datasets as Cesium imagery tiles. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [BoundsProps](interfaces/BoundsProps.md) | Geographic bounding box definition (degrees). |
| [ColorMapInfo](interfaces/ColorMapInfo.md) | Structure of the global color map registry. |
| [ColorScaleProps](interfaces/ColorScaleProps.md) | Describes a numerical-to-color mapping for visualizing scalar fields. |
| [CubeOptions](interfaces/CubeOptions.md) | Configuration for a 3D cube visualization (volumetric rendering). |
| [CubeVelocityProps](interfaces/CubeVelocityProps.md) | Represents the in-memory structure of a velocity field slice. |
| [DataSliceProps](interfaces/DataSliceProps.md) | Describes a slice of a multidimensional array. |
| [DimensionNamesProps](interfaces/DimensionNamesProps.md) | Describes the mapping between dataset dimensions and their standardized names. |
| [DimensionValues](interfaces/DimensionValues.md) | Mapping of dimension names to their corresponding coordinate arrays. |
| [DimIndicesProps](interfaces/DimIndicesProps.md) | Maps dimension keys to their indices and associated coordinate arrays. |
| [LayerOptions](interfaces/LayerOptions.md) | Configuration for a 2D raster (image) layer visualization. |
| [VelocityOptions](interfaces/VelocityOptions.md) | Configuration for a vector (velocity) visualization layer. |
| [XYLimits](interfaces/XYLimits.md) | Describes the XY coordinate boundaries of a dataset. |
| [XYLimitsProps](interfaces/XYLimitsProps.md) | Alias of [XYLimits](interfaces/XYLimits.md) with explicit type name for Zarr coordinate bounds. |
| [ZarrLevelMetadata](interfaces/ZarrLevelMetadata.md) | Metadata for a single multiscale level in a Zarr dataset. |
| [ZarrSelectorsProps](interfaces/ZarrSelectorsProps.md) | Describes a selector for a Zarr dataset dimension. |

## Functions

| Function | Description |
| ------ | ------ |
| [calculateElevationSlice](functions/calculateElevationSlice.md) | Determines the index range of the elevation axis to load from a Zarr cube. |
| [calculateHeightMeters](functions/calculateHeightMeters.md) | Converts elevation index to Cesium height (meters), applying vertical exaggeration and optional below-sea-level offset. |
| [calculateNearestIndex](functions/calculateNearestIndex.md) | Finds the index of the value in `values` nearest to `target`. |
| [calculateSliceArgs](functions/calculateSliceArgs.md) | Constructs Zarr slice arguments for extracting a subregion of a multidimensional array. |
| [calculateXYFromBounds](functions/calculateXYFromBounds.md) | Converts geographic bounds (lat/lon) to pixel-space indices for slicing Zarr arrays. Supports both EPSG:4326 and EPSG:3857 projections. |
| [colormapBuilder](functions/colormapBuilder.md) | Builds a color ramp (discrete or continuous) from a specified colormap. |
| [colorScaleByName](functions/colorScaleByName.md) | Returns a color scale function for a given colormap name. |
| [createColorRampTexture](functions/createColorRampTexture.md) | Creates a flexible 1D color-ramp texture supporting either normalized (0–1) or integer (0–255) color definitions. |
| [createProgram](functions/createProgram.md) | Creates and links a WebGL program using the specified vertex and fragment shaders. |
| [createShader](functions/createShader.md) | Creates and compiles a WebGL shader from source code. |
| [deriveRectangleAndScheme](functions/deriveRectangleAndScheme.md) | Computes a Cesium [Rectangle](https://cesium.com/learn/cesiumjs/ref-doc/Rectangle.html) and [TilingScheme](https://cesium.com/learn/cesiumjs/ref-doc/TilingScheme.html) for a Zarr dataset. |
| [detectCRS](functions/detectCRS.md) | Detects the coordinate reference system (CRS) of a Zarr dataset based on metadata or coordinate range. Defaults to EPSG:4326 (WGS84) if uncertain. |
| [extractNoDataMetadata](functions/extractNoDataMetadata.md) | Extracts no-data related metadata from a Zarr array's attributes. |
| [getCubeDimensions](functions/getCubeDimensions.md) | Computes cube dimension ordering and strides based on dimension indices. Useful for reshaping 3D Zarr arrays into Cesium-renderable layouts. |
| [getXYLimits](functions/getXYLimits.md) | Retrieve the geographic coordinate limits (min/max latitude/longitude) for a Zarr array. |
| [identifyDimensionIndices](functions/identifyDimensionIndices.md) | Identify the indices of common dimensions (lat, lon, time, elevation) in a Zarr array, optionally using CF-compliant standard names or custom dimension mappings. |
| [initZarrDataset](functions/initZarrDataset.md) | Opens a Zarr variable (single-scale or multiscale pyramid) and prepares its metadata. |
| [latDegToMercY](functions/latDegToMercY.md) | Converts a latitude value (in degrees) to Web Mercator Y coordinate (in meters). |
| [loadDimensionValues](functions/loadDimensionValues.md) | Loads the coordinate values for a specific dimension. |
| [lonDegToMercX](functions/lonDegToMercX.md) | Converts a longitude in degrees into a Web Mercator X coordinate (meters). |
| [openLevelArray](functions/openLevelArray.md) | Opens and caches a specific multiscale level array. Keeps a small LRU-style cache of up to three levels. |
| [resolveNoDataRange](functions/resolveNoDataRange.md) | Resolves the no-data value range for masking dataset values. |
| [updateImgData](functions/updateImgData.md) | Updates an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object with a new pixel color derived from a numeric value and a [ColorScaleProps](interfaces/ColorScaleProps.md) colormap. |
| [validateBounds](functions/validateBounds.md) | Validates whether geographic bounds are logically consistent. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [ColorMapName](type-aliases/ColorMapName.md) | Type representing valid color map names. The values are derived from the `allColorScales` array imported from the `jsColormaps` module and are based on matplotlib colormap (https://matplotlib.org/stable/users/explain/colors/colormaps.html). |
| [CRS](type-aliases/CRS.md) | Supported Coordinate Reference Systems. |
| [SliceArgs](type-aliases/SliceArgs.md) | Represents a multidimensional slice argument for Zarr array indexing. |

## Variables

| Variable | Description |
| ------ | ------ |
| [Accent](variables/Accent.md) | - |
| [AccentR](variables/AccentR.md) | - |
| [afmhot](variables/afmhot.md) | - |
| [afmhotR](variables/afmhotR.md) | - |
| [allColorScales](variables/allColorScales.md) | List of all available colormap names (including reversed versions). |
| [autumn](variables/autumn.md) | - |
| [autumnR](variables/autumnR.md) | - |
| [binary](variables/binary.md) | - |
| [binaryR](variables/binaryR.md) | - |
| [Blues](variables/Blues.md) | - |
| [BluesR](variables/BluesR.md) | - |
| [bone](variables/bone.md) | - |
| [boneR](variables/boneR.md) | - |
| [BrBG](variables/BrBG.md) | - |
| [BrBGR](variables/BrBGR.md) | - |
| [brg](variables/brg.md) | - |
| [brgR](variables/brgR.md) | - |
| [BuGn](variables/BuGn.md) | - |
| [BuGnR](variables/BuGnR.md) | - |
| [BuPu](variables/BuPu.md) | - |
| [BuPuR](variables/BuPuR.md) | - |
| [bwr](variables/bwr.md) | - |
| [bwrR](variables/bwrR.md) | - |
| [cividis](variables/cividis.md) | - |
| [cividisR](variables/cividisR.md) | - |
| [CMRmap](variables/CMRmap.md) | - |
| [CMRmapR](variables/CMRmapR.md) | - |
| [cool](variables/cool.md) | - |
| [coolR](variables/coolR.md) | - |
| [coolwarm](variables/coolwarm.md) | - |
| [coolwarmR](variables/coolwarmR.md) | - |
| [copper](variables/copper.md) | - |
| [copperR](variables/copperR.md) | - |
| [cubehelix](variables/cubehelix.md) | - |
| [cubehelixR](variables/cubehelixR.md) | - |
| [Dark2](variables/Dark2.md) | - |
| [Dark2R](variables/Dark2R.md) | - |
| [DEFAULT\_COLORMAP](variables/DEFAULT_COLORMAP.md) | Default colormap for data visualization. |
| [DEFAULT\_OPACITY](variables/DEFAULT_OPACITY.md) | Default opacity for layer visualization. |
| [DEFAULT\_SCALE](variables/DEFAULT_SCALE.md) | Default data scale range for visualization. |
| [DEFAULT\_VERTICAL\_EXAGGERATION](variables/DEFAULT_VERTICAL_EXAGGERATION.md) | Default vertical exaggeration factor for Zarr cube visualization. |
| [DEFAULT\_WIND\_OPTIONS](variables/DEFAULT_WIND_OPTIONS.md) | Default configuration for `WindLayer` rendering. |
| [flag](variables/flag.md) | - |
| [flagR](variables/flagR.md) | - |
| [fragmentShaderSource](variables/fragmentShaderSource.md) | - |
| [gistEarth](variables/gistEarth.md) | - |
| [gistEarthR](variables/gistEarthR.md) | - |
| [gistGray](variables/gistGray.md) | - |
| [gistGrayR](variables/gistGrayR.md) | - |
| [gistHeat](variables/gistHeat.md) | - |
| [gistHeatR](variables/gistHeatR.md) | - |
| [gistNcar](variables/gistNcar.md) | - |
| [gistNcarR](variables/gistNcarR.md) | - |
| [gistRainbow](variables/gistRainbow.md) | - |
| [gistRainbowR](variables/gistRainbowR.md) | - |
| [gistStern](variables/gistStern.md) | - |
| [gistSternR](variables/gistSternR.md) | - |
| [gistYarg](variables/gistYarg.md) | - |
| [gistYargR](variables/gistYargR.md) | - |
| [GnBu](variables/GnBu.md) | - |
| [GnBuR](variables/GnBuR.md) | - |
| [gnuplot](variables/gnuplot.md) | - |
| [gnuplot2](variables/gnuplot2.md) | - |
| [gnuplot2R](variables/gnuplot2R.md) | - |
| [gnuplotR](variables/gnuplotR.md) | - |
| [gray](variables/gray.md) | - |
| [grayR](variables/grayR.md) | - |
| [Greens](variables/Greens.md) | - |
| [GreensR](variables/GreensR.md) | - |
| [Greys](variables/Greys.md) | - |
| [GreysR](variables/GreysR.md) | - |
| [hot](variables/hot.md) | - |
| [hotR](variables/hotR.md) | - |
| [hsv](variables/hsv.md) | - |
| [hsvR](variables/hsvR.md) | - |
| [inferno](variables/inferno.md) | - |
| [infernoR](variables/infernoR.md) | - |
| [jet](variables/jet.md) | - |
| [jetR](variables/jetR.md) | - |
| [magma](variables/magma.md) | - |
| [magmaR](variables/magmaR.md) | - |
| [mercProj](variables/mercProj.md) | Global Web Mercator projection instance used for coordinate conversions. |
| [nipySpectral](variables/nipySpectral.md) | - |
| [nipySpectralR](variables/nipySpectralR.md) | - |
| [ocean](variables/ocean.md) | - |
| [oceanR](variables/oceanR.md) | - |
| [Oranges](variables/Oranges.md) | - |
| [OrangesR](variables/OrangesR.md) | - |
| [OrRd](variables/OrRd.md) | - |
| [OrRdR](variables/OrRdR.md) | - |
| [Paired](variables/Paired.md) | - |
| [PairedR](variables/PairedR.md) | - |
| [Pastel1](variables/Pastel1.md) | - |
| [Pastel1R](variables/Pastel1R.md) | - |
| [Pastel2](variables/Pastel2.md) | - |
| [Pastel2R](variables/Pastel2R.md) | - |
| [pink](variables/pink.md) | - |
| [pinkR](variables/pinkR.md) | - |
| [PiYG](variables/PiYG.md) | - |
| [PiYGR](variables/PiYGR.md) | - |
| [plasma](variables/plasma.md) | - |
| [plasmaR](variables/plasmaR.md) | - |
| [PRGn](variables/PRGn.md) | - |
| [PRGnR](variables/PRGnR.md) | - |
| [prism](variables/prism.md) | - |
| [prismR](variables/prismR.md) | - |
| [PuBu](variables/PuBu.md) | - |
| [PuBuGn](variables/PuBuGn.md) | - |
| [PuBuGnR](variables/PuBuGnR.md) | - |
| [PuBuR](variables/PuBuR.md) | - |
| [PuOr](variables/PuOr.md) | - |
| [PuOrR](variables/PuOrR.md) | - |
| [PuRd](variables/PuRd.md) | - |
| [PuRdR](variables/PuRdR.md) | - |
| [Purples](variables/Purples.md) | - |
| [PurplesR](variables/PurplesR.md) | - |
| [rainbow](variables/rainbow.md) | - |
| [rainbowR](variables/rainbowR.md) | - |
| [RdBu](variables/RdBu.md) | - |
| [RdBuR](variables/RdBuR.md) | - |
| [RdGy](variables/RdGy.md) | - |
| [RdGyR](variables/RdGyR.md) | - |
| [RdPu](variables/RdPu.md) | - |
| [RdPuR](variables/RdPuR.md) | - |
| [RdYlBu](variables/RdYlBu.md) | - |
| [RdYlBuR](variables/RdYlBuR.md) | - |
| [RdYlGn](variables/RdYlGn.md) | - |
| [RdYlGnR](variables/RdYlGnR.md) | - |
| [Reds](variables/Reds.md) | - |
| [RedsR](variables/RedsR.md) | - |
| [seismic](variables/seismic.md) | - |
| [seismicR](variables/seismicR.md) | - |
| [Set1](variables/Set1.md) | - |
| [Set1R](variables/Set1R.md) | - |
| [Set2](variables/Set2.md) | - |
| [Set2R](variables/Set2R.md) | - |
| [Set3](variables/Set3.md) | - |
| [Set3R](variables/Set3R.md) | - |
| [Spectral](variables/Spectral.md) | - |
| [SpectralR](variables/SpectralR.md) | - |
| [spring](variables/spring.md) | - |
| [springR](variables/springR.md) | - |
| [summer](variables/summer.md) | - |
| [summerR](variables/summerR.md) | - |
| [tab10](variables/tab10.md) | - |
| [tab10R](variables/tab10R.md) | - |
| [tab20](variables/tab20.md) | - |
| [tab20b](variables/tab20b.md) | - |
| [tab20bR](variables/tab20bR.md) | - |
| [tab20c](variables/tab20c.md) | - |
| [tab20cR](variables/tab20cR.md) | - |
| [tab20R](variables/tab20R.md) | - |
| [terrain](variables/terrain.md) | - |
| [terrainR](variables/terrainR.md) | - |
| [turbo](variables/turbo.md) | - |
| [turboR](variables/turboR.md) | - |
| [twilight](variables/twilight.md) | - |
| [twilightR](variables/twilightR.md) | - |
| [twilightShifted](variables/twilightShifted.md) | - |
| [twilightShiftedR](variables/twilightShiftedR.md) | - |
| [vertexShaderSource](variables/vertexShaderSource.md) | - |
| [viridis](variables/viridis.md) | - |
| [viridisR](variables/viridisR.md) | - |
| [winter](variables/winter.md) | - |
| [winterR](variables/winterR.md) | - |
| [Wistia](variables/Wistia.md) | - |
| [WistiaR](variables/WistiaR.md) | - |
| [YlGn](variables/YlGn.md) | - |
| [YlGnBu](variables/YlGnBu.md) | - |
| [YlGnBuR](variables/YlGnBuR.md) | - |
| [YlGnR](variables/YlGnR.md) | - |
| [YlOrBr](variables/YlOrBr.md) | - |
| [YlOrBrR](variables/YlOrBrR.md) | - |
| [YlOrRd](variables/YlOrRd.md) | - |
| [YlOrRdR](variables/YlOrRdR.md) | - |
