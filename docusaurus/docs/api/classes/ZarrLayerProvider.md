# ZarrLayerProvider

Imagery provider for rendering Zarr datasets as Cesium imagery tiles.

## Remarks

This class implements the Cesium `ImageryProvider` interface and manages
reading, slicing, and WebGL rendering of Zarr-based raster data.

## Example

```ts
const provider = new ZarrLayerProvider({
  url: 'https://example.com/my.zarr',
  variable: 'temperature',
  scale: [0, 40],
  colormap: 'jet'
});
const imageryLayer = new ZarrImageryLayer(provider);
viewer.imageryLayers.add(imageryLayer);
```

## See

[ZarrImageryLayer](ZarrImageryLayer.md)

## Implements

- [`ImageryProvider`](https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html)

## Accessors

### credit

#### Get Signature

```ts
get credit(): Credit;
```

Credit information for the imagery provider.

##### Returns

`Credit`

#### Implementation of

```ts
ImageryProvider.credit
```

***

### hasAlphaChannel

#### Get Signature

```ts
get hasAlphaChannel(): boolean;
```

Indicates whether the imagery has an alpha channel.

##### Returns

`boolean`

#### Implementation of

```ts
ImageryProvider.hasAlphaChannel
```

***

### maximumLevel

#### Get Signature

```ts
get maximumLevel(): number;
```

Maximum zoom level supported by the provider.

##### Returns

`number`

#### Implementation of

```ts
ImageryProvider.maximumLevel
```

***

### minimumLevel

#### Get Signature

```ts
get minimumLevel(): number;
```

Minimum zoom level supported by the provider.

##### Returns

`number`

#### Implementation of

```ts
ImageryProvider.minimumLevel
```

***

### ready

#### Get Signature

```ts
get ready(): boolean;
```

Indicates whether the provider is fully initialized and ready.

##### Returns

`boolean`

***

### readyPromise

#### Get Signature

```ts
get readyPromise(): Promise<boolean>;
```

Promise that resolves when the provider is fully initialized.

##### Returns

`Promise`\<`boolean`\>

***

### rectangle

#### Get Signature

```ts
get rectangle(): Rectangle;
```

Geographic coverage rectangle of the imagery provider.

##### Returns

[`Rectangle`](https://cesium.com/learn/cesiumjs/ref-doc/Rectangle.html)

#### Implementation of

```ts
ImageryProvider.rectangle
```

***

### tileHeight

#### Get Signature

```ts
get tileHeight(): number;
```

Height of each tile, in pixels.

##### Returns

`number`

#### Implementation of

```ts
ImageryProvider.tileHeight
```

***

### tileWidth

#### Get Signature

```ts
get tileWidth(): number;
```

Width of each tile, in pixels.

##### Returns

`number`

#### Implementation of

```ts
ImageryProvider.tileWidth
```

***

### tilingScheme

#### Get Signature

```ts
get tilingScheme(): TilingScheme;
```

Tiling scheme used by the imagery provider.

##### Returns

[`TilingScheme`](https://cesium.com/learn/cesiumjs/ref-doc/TilingScheme.html)

#### Implementation of

```ts
ImageryProvider.tilingScheme
```

## Constructors

### Constructor

```ts
new ZarrLayerProvider(options): ZarrLayerProvider;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`LayerOptions`](../interfaces/LayerOptions.md) |

#### Returns

`ZarrLayerProvider`

## Methods

### getTileCredits()

```ts
getTileCredits(
   x, 
   y, 
   level): Credit[];
```

Retrieves the credits for a specific tile.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `number` | Tile x coordinate. |
| `y` | `number` | Tile y coordinate. |
| `level` | `number` | Zoom level. |

#### Returns

`Credit`[]

An array of credits associated with the tile.

#### Implementation of

```ts
ImageryProvider.getTileCredits
```

***

### pickFeatures()

```ts
pickFeatures(): undefined;
```

Picks features at a given geographic location.

#### Returns

`undefined`

#### Implementation of

```ts
ImageryProvider.pickFeatures
```

***

### requestImage()

```ts
requestImage(
   x, 
   y, 
level): Promise<HTMLCanvasElement | ImageBitmap>;
```

Requests a rendered image tile from the Zarr dataset.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `number` | Tile x coordinate. |
| `y` | `number` | Tile y coordinate. |
| `level` | `number` | Zoom level. |

#### Returns

`Promise`\<`HTMLCanvasElement` \| `ImageBitmap`\>

A rendered tile as an HTMLCanvasElement or ImageBitmap.

#### Implementation of

```ts
ImageryProvider.requestImage
```

***

### updateSelectors()

```ts
updateSelectors(selectors): boolean;
```

Updates the selectors for slicing dimensions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selectors` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | New selectors mapping. See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md). |

#### Returns

`boolean`

`true` if any changes were applied, otherwise `false`.

***

### updateStyle()

```ts
updateStyle(options): boolean;
```

Updates the visualization style for the imagery provider.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `colormap?`: `string`; `scale?`: \[`number`, `number`\]; \} | Parameters to update. |
| `options.colormap?` | `string` | New colormap name. See [ColorMapName](../type-aliases/ColorMapName.md). |
| `options.scale?` | \[`number`, `number`\] | New [min, max] scale range. |

#### Returns

`boolean`

`true` if any changes were applied, otherwise `false`.

***

### createLayer()

```ts
static createLayer(viewer, options): Promise<ZarrImageryLayer>;
```

Creates a Cesium imagery layer from the given viewer and Zarr options.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `viewer` | `Viewer` | Cesium viewer instance. |
| `options` | [`LayerOptions`](../interfaces/LayerOptions.md) | Layer options (see [LayerOptions](../interfaces/LayerOptions.md)). |

#### Returns

`Promise`\<[`ZarrImageryLayer`](ZarrImageryLayer.md)\>

A promise that resolves to a [ZarrImageryLayer](ZarrImageryLayer.md).

## Properties

### dimensionValues

```ts
dimensionValues: object = {};
```

Values of the data coordinate dimensions (latitude, longitude, elevation, etc.).

#### Index Signature

```ts
[key: string]: number[] | Float64Array<ArrayBufferLike>
```

***

### errorEvent

```ts
errorEvent: Event<(...args) => void>;
```

Gets an event that is raised when the imagery provider encounters an asynchronous error.  By subscribing
to the event, you will be notified of the error and can potentially recover from it.  Event listeners
are passed an instance of [TileProviderError](https://cesium.com/learn/cesiumjs/ref-doc/TileProviderError.html).

#### Implementation of

```ts
ImageryProvider.errorEvent
```

***

### proxy

```ts
proxy: DefaultProxy;
```

Gets the proxy used by this provider.

#### Implementation of

```ts
ImageryProvider.proxy
```

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

***

### tileDiscardPolicy

```ts
tileDiscardPolicy: NeverTileDiscardPolicy;
```

Gets the tile discard policy.  If not undefined, the discard policy is responsible
for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
returns undefined, no tiles are filtered.

#### Implementation of

```ts
ImageryProvider.tileDiscardPolicy
```
