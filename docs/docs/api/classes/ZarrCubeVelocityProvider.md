# ZarrCubeVelocityProvider

Provider responsible for loading and rendering 3D velocity fields (U and V components)
from Zarr datasets as animated Cesium `WindLayer`s.

## Remarks

This provider targets the NOC-OI fork of `cesium-wind-layer` v0.11.0. The
fork adds bounded camera-driven particle scaling through `minVisibleRatio`
and restores overview styling after zooming back out. The provider loads 3D
vector data, slices it by elevation, and creates animated particle layers
that visualize flow direction and speed.

## Example

```ts
const provider = new ZarrCubeVelocityProvider(viewer, {
  urls: { u: 'uo.zarr', v: 'vo.zarr' },
  variables: { u: 'uo', v: 'vo' },
  bounds: { west: -10, south: 30, east: 10, north: 45 }
});
await provider.load();
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

Elevation offset used by shared profile query helpers.

## Constructors

### Constructor

```ts
new ZarrCubeVelocityProvider(viewer, options): ZarrCubeVelocityProvider;
```

Creates a new ZarrCubeVelocityProvider instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `viewer` | [`CesiumHost`](../type-aliases/CesiumHost.md) | Cesium viewer or widget where the layers will be rendered. |
| `options` | [`VelocityOptions`](../interfaces/VelocityOptions.md) | Velocity dataset options (see [VelocityOptions](../interfaces/VelocityOptions.md)). |

#### Returns

`ZarrCubeVelocityProvider`

#### Throws

If either U or V has neither a URL nor a custom store.

## Methods

### destroy()

```ts
destroy(): void;
```

Removes all active wind layers from the Cesium scene.

#### Returns

`void`

#### Remarks

Loaded U/V arrays and selectors remain in memory. Call
[updateSlices](#updateslices) or [load](#load) to render layers again.

***

### getTimeSeries()

```ts
getTimeSeries(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries all time values and vector components at one position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in WGS84 degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than time. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query cancellation and coordinate-output controls. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Speed and component values ordered by time.

***

### getVerticalProfile()

```ts
getVerticalProfile(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries all loaded elevation values and vector components at one position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in WGS84 degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than elevation. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query cancellation and coordinate-output controls. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Speed and component values ordered by elevation.

***

### load()

```ts
load(): Promise<void>;
```

Loads both U and V components of the velocity field from their respective Zarr datasets.

#### Returns

`Promise`\<`void`\>

A promise resolved after both components, coordinates, selected
subsets, and all elevation wind layers have loaded.

#### Throws

When either custom or URL-backed store, selected array, dimensions, or data chunks cannot be read.

#### Remarks

U and V are loaded concurrently and must describe compatible grids.

***

### queryData()

```ts
queryData(
   geometry,
   selectors,
options): Promise<VelocityQueryResult>;
```

Queries velocity components and derived speed at a WGS84 point.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `geometry` | [`QueryGeometry`](../type-aliases/QueryGeometry.md) | Point geometry in `[longitude, latitude]` degrees. |
| `selectors` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Optional time/elevation selectors for this query. |
| `options` | [`QueryOptions`](../interfaces/QueryOptions.md) | Cancellation and coordinate-output controls. |

#### Returns

`Promise`\<[`VelocityQueryResult`](../interfaces/VelocityQueryResult.md)\>

Speed values plus aligned U and V component arrays.

#### Throws

For unsupported geometries, invalid selectors, or failed reads.

#### Remarks

A ranged elevation selector returns a vertical profile; a ranged
time selector reads the source arrays instead of only the rendered layers.

***

### updateSelectors()

```ts
updateSelectors(options): Promise<void>;
```

Updates the dimension selectors, multiscale level, or geographic bounds,
and reloads the velocity data accordingly.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `bounds?`: [`BoundsProps`](../interfaces/BoundsProps.md); `multiscaleLevel?`: `number`; `selectors?`: \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \}; \} | Partial data-selection update. Changed selectors, level, or bounds destroy the existing wind layers and reload both components. |
| `options.bounds?` | [`BoundsProps`](../interfaces/BoundsProps.md) | - |
| `options.multiscaleLevel?` | `number` | - |
| `options.selectors?` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | - |

#### Returns

`Promise`\<`void`\>

A promise that resolves after the change is scheduled. If no value
changed, it resolves without rebuilding layers.

#### Remarks

Latitude bounds are clamped to the Web Mercator limit.

***

### updateSlices()

```ts
updateSlices(options): Promise<void>;
```

Updates the rendered slices (number of vertical layers) based on the spacing or exaggeration.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `belowSeaLevel?`: `boolean`; `sliceSpacing?`: `number`; `verticalExaggeration?`: `number`; \} | Partial slice-layout update. `sliceSpacing` is an elevation index interval; `verticalExaggeration` scales height; `belowSeaLevel` controls whether depth is placed beneath the ellipsoid. |
| `options.belowSeaLevel?` | `boolean` | - |
| `options.sliceSpacing?` | `number` | - |
| `options.verticalExaggeration?` | `number` | - |

#### Returns

`Promise`\<`void`\>

A promise resolved after replacement wind layers are created.

#### Remarks

Non-positive spacing/exaggeration and spacing beyond the elevation
dimension are rejected with a warning.

***

### updateStyle()

```ts
updateStyle(options): void;
```

Updates the visual style of the velocity layers, such as opacity,
color scale, or particle simulation parameters.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `colormap?`: `string`; `opacity?`: `number`; `scale?`: \[`number`, `number`\]; `windOptions?`: [`VelocityWindOptions`](../type-aliases/VelocityWindOptions.md); \} | Partial style update. `windOptions` are forwarded to each WindLayer except `particleHeight`, which remains derived from Zarr elevation. |
| `options.colormap?` | `string` | - |
| `options.opacity?` | `number` | - |
| `options.scale?` | \[`number`, `number`\] | - |
| `options.windOptions?` | [`VelocityWindOptions`](../type-aliases/VelocityWindOptions.md) | - |

#### Returns

`void`

#### Remarks

Existing layers are updated in place; source data is not reloaded.

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

Cube dimensions: [longitude, latitude, elevation].

***

### dimensionValues

```ts
dimensionValues: object = {};
```

Dimension coordinate arrays (e.g. lat, lon, elevation).

#### Index Signature

```ts
[key: string]: string[] | number[] | Float64Array<ArrayBufferLike>
```

***

### elevationShape

```ts
elevationShape: number = 0;
```

Shape (size) of the elevation dimension.

***

### id

```ts
id: string = '';
```

Unique identifier for the cube provider instance.

***

### levelInfos

```ts
levelInfos: string[] = [];
```

Information about multiscale levels in the Zarr dataset.

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
