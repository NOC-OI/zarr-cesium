# ZarrCubeVelocityProvider

Provider responsible for loading and rendering 3D velocity fields (U and V components)
from Zarr datasets as animated Cesium `WindLayer`s.

## Remarks

This class supports loading 3D vector field data (u, v components), slicing them by elevation,
and creating animated particle layers that visualize flow direction and speed.

## Example

```ts
const provider = new ZarrCubeVelocityProvider(viewer, {
  urls: { u: 'uo.zarr', v: 'vo.zarr' },
  variables: { u: 'uo', v: 'vo' },
  bounds: { west: -10, south: 30, east: 10, north: 45 }
});
await provider.load();
```

## Constructors

### Constructor

```ts
new ZarrCubeVelocityProvider(viewer, options): ZarrCubeVelocityProvider;
```

Creates a new ZarrCubeVelocityProvider instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `viewer` | `Viewer` | Cesium viewer where the layers will be rendered. |
| `options` | [`VelocityOptions`](../interfaces/VelocityOptions.md) | Velocity dataset options (see [VelocityOptions](../interfaces/VelocityOptions.md)). |

#### Returns

`ZarrCubeVelocityProvider`

## Methods

### destroy()

```ts
destroy(): void;
```

Removes all active wind layers from the Cesium scene.

#### Returns

`void`

***

### load()

```ts
load(): Promise<void>;
```

Loads both U and V components of the velocity field from their respective Zarr datasets.

#### Returns

`Promise`\<`void`\>

Promise resolved when both datasets are loaded and rendered as wind layers.

***

### updateSelectors()

```ts
updateSelectors(options:): Promise<void>;
```

Updates the dimension selectors, multiscale level, or geographic bounds,
and reloads the velocity data accordingly.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options:` | \{ `bounds?`: [`BoundsProps`](../interfaces/BoundsProps.md); `multiscaleLevel?`: `number`; `selectors?`: \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \}; \} | selectors - New dimension selectors. See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md). - multiscaleLevel - New multiscale level to load. - bounds - Updated geographic bounds. See [BoundsProps](../interfaces/BoundsProps.md). |
| `options:.bounds?` | [`BoundsProps`](../interfaces/BoundsProps.md) | - |
| `options:.multiscaleLevel?` | `number` | - |
| `options:.selectors?` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | - |

#### Returns

`Promise`\<`void`\>

***

### updateSlices()

```ts
updateSlices(options:): Promise<void>;
```

Updates the rendered slices (number of vertical layers) based on the spacing or exaggeration.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options:` | \{ `belowSeaLevel?`: `boolean`; `sliceSpacing?`: `number`; `verticalExaggeration?`: `number`; \} | sliceSpacing - Distance between rendered elevation slices. - verticalExaggeration - Height exaggeration. - belowSeaLevel - Whether elevations below sea level are considered. |
| `options:.belowSeaLevel?` | `boolean` | - |
| `options:.sliceSpacing?` | `number` | - |
| `options:.verticalExaggeration?` | `number` | - |

#### Returns

`Promise`\<`void`\>

***

### updateStyle()

```ts
updateStyle(options:): void;
```

Updates the visual style of the velocity layers, such as opacity,
color scale, or particle simulation parameters.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options:` | \{ `colormap?`: `string`; `opacity?`: `number`; `scale?`: \[`number`, `number`\]; `windOptions?`: `Partial`\<`WindLayerOptions`\>; \} | opacity - Opacity. - scale - [min, max] scale for coloring. - colormap - Colormap name. See [ColorMapName](../type-aliases/ColorMapName.md). - windOptions - Additional parameters forwarded to the WindLayer (see WindLayerOptions). |
| `options:.colormap?` | `string` | - |
| `options:.opacity?` | `number` | - |
| `options:.scale?` | \[`number`, `number`\] | - |
| `options:.windOptions?` | `Partial`\<`WindLayerOptions`\> | - |

#### Returns

`void`

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
[key: string]: number[] | Float64Array<ArrayBufferLike>
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
