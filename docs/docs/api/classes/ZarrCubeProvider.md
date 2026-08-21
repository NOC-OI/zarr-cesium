# ZarrCubeProvider

Provides rendering of volumetric (3D) Zarr datasets as Cesium primitives.

## Remarks

This class handles loading Zarr cubes, slicing them along latitude,
longitude, and elevation axes, and rendering those slices as textured
Cesium primitives (both horizontal and vertical).

It supports configurable color scales, opacity, vertical exaggeration,
and multiple visualization modes.

## Example

```ts
const cubeProvider = new ZarrCubeProvider(viewer, {
  url: 'https://example.com/mycube.zarr',
  variable: 'temperature',
  bounds: { west: -20, south: 30, east: 10, north: 60 },
  showHorizontalSlices: true,
  showVerticalSlices: true,
  colormap: 'viridis'
});

await cubeProvider.load();
```

## Accessors

### queryIndexOffsets

#### Get Signature

```ts
get queryIndexOffsets(): Record<string, number>;
```

Global coordinate offsets represented by index zero of the in-memory subset.

##### Returns

`Record`\<`string`, `number`\>

Offsets used by shared profile and transect query helpers.

## Constructors

### Constructor

```ts
new ZarrCubeProvider(viewer, options): ZarrCubeProvider;
```

Creates a new instance of ZarrCubeProvider.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `viewer` | [`CesiumHost`](../type-aliases/CesiumHost.md) | Cesium viewer or widget instance to which primitives will be added. |
| `options` | [`CubeOptions`](../interfaces/CubeOptions.md) | Configuration for the cube visualization (see [CubeOptions](../interfaces/CubeOptions.md)). |

#### Returns

`ZarrCubeProvider`

#### Throws

If neither `options.url` nor `options.store` is provided.

## Methods

### clear()

```ts
clear(): void;
```

Removes all currently rendered slice primitives from the scene.

#### Returns

`void`

#### Remarks

Loaded Zarr data and current selectors remain available, so slices
can be recreated with [updateSlices](#updateslices).

***

### destroy()

```ts
destroy(): void;
```

Removes all Cesium primitives owned by this provider.

#### Returns

`void`

#### Remarks

The currently loaded array remains in memory. Call [load](#load) or
[updateSelectors](#updateselectors) to render it again.

***

### getFullTransect()

```ts
getFullTransect(
   start,
   end,
   selectors?,
options?): Promise<FullTransectResult>;
```

Samples every loaded elevation along a WGS84 line.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Starting `[longitude, latitude]` coordinate in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Ending `[longitude, latitude]` coordinate in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than elevation. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sample count, concurrency, and cancellation controls. |

#### Returns

`Promise`\<[`FullTransectResult`](../interfaces/FullTransectResult.md)\>

A distance-by-elevation value matrix.

***

### getTimeSeries()

```ts
getTimeSeries(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries all available time coordinates at one WGS84 position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than time. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query cancellation and coordinate-output controls. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

A result ordered by the time coordinate.

***

### getTransect()

```ts
getTransect(
   start,
   end,
   selectors?,
options?): Promise<TransectResult>;
```

Samples one selected elevation along a WGS84 line.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Starting `[longitude, latitude]` coordinate in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Ending `[longitude, latitude]` coordinate in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Dimension selectors applied to every sample. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sample count, concurrency, and cancellation controls. |

#### Returns

`Promise`\<[`TransectResult`](../interfaces/TransectResult.md)\>

Positions, distances, and values along the transect.

***

### getVerticalProfile()

```ts
getVerticalProfile(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries all loaded elevation coordinates at one WGS84 position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than elevation. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query cancellation and coordinate-output controls. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

A result ordered by elevation.

***

### load()

```ts
load(force): Promise<void>;
```

Loads the Zarr dataset and initializes the cube data and metadata.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `false` | Recreate slice primitives even when their indices did not change. |

#### Returns

`Promise`\<`void`\>

A promise that resolves after metadata, coordinates, the selected
subset, and its Cesium primitives have loaded.

#### Throws

When the custom or URL-backed store, selected array, dimensions, or data chunks cannot be read.

#### Remarks

Calling `load` again replaces the in-memory subset. Use
[updateSelectors](#updateselectors) for normal runtime changes.

***

### queryData()

```ts
queryData(
   geometry,
   selectors?,
options?): Promise<QueryResult>;
```

Queries a voxel or vertical profile from the cube subset currently held in memory.
A scalar elevation selector returns one voxel; an elevation range returns a profile.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `geometry` | [`QueryGeometry`](../type-aliases/QueryGeometry.md) | WGS84 point geometry in `[longitude, latitude]` degrees. |
| `selectors?` | `Record`\<`string`, [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md)\> | Optional time/elevation overrides for this query. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Cancellation and coordinate-output controls. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Queried values with coordinates expressed using dataset dimension names.

#### Throws

If called before [load](#load), for unsupported geometries, or for
selector indices outside the loaded subset.

***

### updateSelectors()

```ts
updateSelectors(options): void;
```

Updates the dimension selectors, multiscale level, and bounds.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `bounds?`: [`BoundsProps`](../interfaces/BoundsProps.md); `multiscaleLevel?`: `number`; `selectors?`: \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \}; \} | Partial data-selection update. Changed selectors, level, or bounds cause the current primitives to be destroyed and reloaded. |
| `options.bounds?` | [`BoundsProps`](../interfaces/BoundsProps.md) | - |
| `options.multiscaleLevel?` | `number` | - |
| `options.selectors?` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | - |

#### Returns

`void`

Nothing. Reloading continues asynchronously after a change.

#### Remarks

Latitude bounds are clamped to the Web Mercator limit.

***

### updateSlices()

```ts
updateSlices(options): void;
```

Updates the rendered slices based on the provided indices.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `belowSeaLevel?`: `boolean`; `elevationIndex?`: `number`; `force?`: `boolean`; `latIndex?`: `number`; `lonIndex?`: `number`; \} | Slice update options. `latIndex`, `lonIndex`, and `elevationIndex` are local indices within the loaded subset. `force` recreates unchanged primitives; `belowSeaLevel` changes height placement. |
| `options.belowSeaLevel?` | `boolean` | - |
| `options.elevationIndex?` | `number` | - |
| `options.force?` | `boolean` | - |
| `options.latIndex?` | `number` | - |
| `options.lonIndex?` | `number` | - |

#### Returns

`void`

#### Remarks

Has no effect until [load](#load) has completed.

***

### updateStyle()

```ts
updateStyle(options): void;
```

Updates cube styling and immediately recreates the visible slices.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `colormap?`: `string`; `opacity?`: `number`; `scale?`: \[`number`, `number`\]; `verticalExaggeration?`: `number`; \} | Partial style update: vertical exaggeration, opacity, numeric color range, and/or colormap. |
| `options.colormap?` | `string` | - |
| `options.opacity?` | `number` | - |
| `options.scale?` | \[`number`, `number`\] | - |
| `options.verticalExaggeration?` | `number` | - |

#### Returns

`void`

#### Remarks

This reuses the loaded data and does not refetch Zarr chunks.

## Properties

### bounds

```ts
bounds: BoundsProps;
```

Configuration defining the geographic bounds of the cube.

***

### cubeDimensions

```ts
cubeDimensions: [number, number, number] | null = null;
```

Size of the cube in [longitude, latitude, elevation].

***

### dimensionValues

```ts
dimensionValues: DimensionValues = {};
```

Values of the cube’s coordinate dimensions (latitude, longitude, elevation, etc.).

***

### elevationShape

```ts
elevationShape: number = 0;
```

Shape (size) of the elevation dimension.

***

### elevationSliceIndex

```ts
elevationSliceIndex: number = -1;
```

Current index of the elevation slice being visualized.

***

### id

```ts
id: string = '';
```

Unique identifier for the cube provider instance.

***

### latSliceIndex

```ts
latSliceIndex: number = -1;
```

Current index of the latitude slice being visualized.

***

### levelInfos

```ts
levelInfos: string[] = [];
```

Information about multiscale levels in the Zarr dataset.

***

### lonSliceIndex

```ts
lonSliceIndex: number = -1;
```

Current index of the longitude slice being visualized.

***

### multiscaleLevel

```ts
multiscaleLevel: number = 0;
```

Current multiscale level to load.

***

### selectors

```ts
selectors: object;
```

User-defined selectors for slicing dimensions.

#### Index Signature

```ts
[key: string]: ZarrSelectorsProps
```
