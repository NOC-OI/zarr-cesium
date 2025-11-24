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

## Constructors

### Constructor

```ts
new ZarrCubeProvider(viewer, options): ZarrCubeProvider;
```

Creates a new instance of ZarrCubeProvider.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `viewer` | `Viewer` | Cesium viewer instance to which primitives will be added. |
| `options` | [`CubeOptions`](../interfaces/CubeOptions.md) | Configuration for the cube visualization (see [CubeOptions](../interfaces/CubeOptions.md)). |

#### Returns

`ZarrCubeProvider`

## Methods

### clear()

```ts
clear(): void;
```

Removes all currently rendered slice primitives from the scene.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Destroys all allocated Cesium primitives and clears resources.

#### Returns

`void`

***

### load()

```ts
load(force): Promise<void>;
```

Loads the Zarr dataset and initializes the cube data and metadata.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `false` | If true, forces reloading of the dataset even if already loaded. |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the cube data is fully loaded.

***

### updateSelectors()

```ts
updateSelectors(options:): void;
```

Updates the dimension selectors, multiscale level, and bounds.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options:` | \{ `bounds?`: [`BoundsProps`](../interfaces/BoundsProps.md); `multiscaleLevel?`: `number`; `selectors?`: \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \}; \} | selectors - New selectors mapping. See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md). - multiscaleLevel - Multiscale level to switch to. - bounds - Updated geographic bounds. See [BoundsProps](../interfaces/BoundsProps.md). |
| `options:.bounds?` | [`BoundsProps`](../interfaces/BoundsProps.md) | - |
| `options:.multiscaleLevel?` | `number` | - |
| `options:.selectors?` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | - |

#### Returns

`void`

***

### updateSlices()

```ts
updateSlices(options:): void;
```

Updates the rendered slices based on the provided indices.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options:` | \{ `belowSeaLevel?`: `boolean`; `elevationIndex?`: `number`; `force?`: `boolean`; `latIndex?`: `number`; `lonIndex?`: `number`; \} | latIndex: Latitude slice index. - lonIndex: Longitude slice index. - elevationIndex: Elevation slice index. - force: Force re-render. - belowSeaLevel: Toggle below-sea-level height model. |
| `options:.belowSeaLevel?` | `boolean` | - |
| `options:.elevationIndex?` | `number` | - |
| `options:.force?` | `boolean` | - |
| `options:.latIndex?` | `number` | - |
| `options:.lonIndex?` | `number` | - |

#### Returns

`void`

***

### updateStyle()

```ts
updateStyle(options:): void;
```

Updates style parameters.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options:` | \{ `colormap?`: `string`; `opacity?`: `number`; `scale?`: \[`number`, `number`\]; `verticalExaggeration?`: `number`; \} | verticalExaggeration - Vertical exaggeration factor. - opacity - Opacity. - scale - [min,max] data scaling range. - colormap - Colormap name. See [ColorMapName](../type-aliases/ColorMapName.md). |
| `options:.colormap?` | `string` | - |
| `options:.opacity?` | `number` | - |
| `options:.scale?` | \[`number`, `number`\] | - |
| `options:.verticalExaggeration?` | `number` | - |

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

Size of the cube in [longitude, latitude, elevation].

***

### dimensionValues

```ts
dimensionValues: object = {};
```

Values of the cube’s coordinate dimensions (latitude, longitude, elevation, etc.).

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
