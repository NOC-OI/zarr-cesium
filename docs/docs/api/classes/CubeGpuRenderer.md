# CubeGpuRenderer

Low-level Cesium primitive that keeps cube values and colormapping on the GPU.

## Constructors

### Constructor

```ts
new CubeGpuRenderer(options): CubeGpuRenderer;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`CubeGpuRendererOptions`](../interfaces/CubeGpuRendererOptions.md) |

#### Returns

`CubeGpuRenderer`

## Methods

### clearCrossSection()

```ts
clearCrossSection(): void;
```

Clears the cross-section, reverting to the default slice rendering.

#### Returns

`void`

***

### destroy()

```ts
destroy(): undefined;
```

Destroys the renderer, releasing all associated resources.

#### Returns

`undefined`

***

### isDestroyed()

```ts
isDestroyed(): boolean;
```

Checks if the renderer has been destroyed.

#### Returns

`boolean`

True if the renderer has been destroyed, false otherwise.

***

### setCrossSection()

```ts
setCrossSection(start, end): void;
```

Updates the rendered slices based on the provided cross-section points.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`CubeCrossSectionPoint`](../type-aliases/CubeCrossSectionPoint.md) | The starting point of the cross-section. |
| `end` | [`CubeCrossSectionPoint`](../type-aliases/CubeCrossSectionPoint.md) | The ending point of the cross-section. |

#### Returns

`void`

***

### setSlices()

```ts
setSlices(
   latitude, 
   longitude, 
   elevation): void;
```

Updates the rendered slices based on the provided indices.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `latitude` | `number` | The index of the latitude slice to display. |
| `longitude` | `number` | The index of the longitude slice to display. |
| `elevation` | `number` | The index of the elevation slice to display. |

#### Returns

`void`

***

### setStyle()

```ts
setStyle(
   colors, 
   min, 
   max, 
   opacity): void;
```

Updates the rendered style based on the provided color scale and opacity.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `colors` | `string`[] \| `number`[][] | The color scale to use for rendering. |
| `min` | `number` | The minimum value of the color scale. |
| `max` | `number` | The maximum value of the color scale. |
| `opacity` | `number` | The opacity of the rendered cube. |

#### Returns

`void`

***

### setVerticalLayout()

```ts
setVerticalLayout(verticalExaggeration, elevationMode): void;
```

Updates the vertical layout of the cube based on the provided vertical exaggeration and elevation mode.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `verticalExaggeration` | `number` | The factor by which to exaggerate the vertical dimension. |
| `elevationMode` | [`ElevationMode`](../type-aliases/ElevationMode.md) | The mode to use for rendering elevation ('height' or 'depth'). |

#### Returns

`void`

***

### update()

```ts
update(frameState): void;
```

Updates the renderer, rebuilding commands and textures as needed.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `frameState` | `any` | The current frame state from Cesium. |

#### Returns

`void`

***

### supportReason()

```ts
static supportReason(scene, dimensions): string | null;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `scene` | `any` |
| `dimensions` | \[`number`, `number`, `number`\] |

#### Returns

`string` \| `null`

## Properties

### show

```ts
show: boolean = true;
```
