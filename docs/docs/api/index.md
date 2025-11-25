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
