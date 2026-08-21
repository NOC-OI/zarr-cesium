# ZarrLayerProvider

Thin Cesium adapter around the framework-independent Zarr tile renderer.
Dataset loading, slicing, styling, caching, and WebGL rendering live in
`zarr-maps-tiling`; this class only translates Cesium tile requests.

## Implements

- [`ImageryProvider`](https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html)

## Accessors

### credit

#### Get Signature

```ts
get credit(): Credit;
```

Dataset attribution exposed to Cesium.

##### Returns

`Credit`

#### Implementation of

```ts
ImageryProvider.credit
```

***

### dimensionValues

#### Get Signature

```ts
get dimensionValues(): DimensionValues;
```

Coordinate values keyed by normalized dimension name.

##### Returns

[`DimensionValues`](../interfaces/DimensionValues.md)

***

### errorEvent

#### Get Signature

```ts
get errorEvent(): Event;
```

Cesium imagery-provider error event.

##### Returns

`Event`

#### Implementation of

```ts
ImageryProvider.errorEvent
```

***

### hasAlphaChannel

#### Get Signature

```ts
get hasAlphaChannel(): boolean;
```

Whether rendered tiles contain alpha values. Always `true`.

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

Maximum imagery level requested by Cesium.

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

Minimum imagery level requested by Cesium.

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

Whether metadata initialization completed and the provider is usable.

##### Returns

`boolean`

***

### readyPromise

#### Get Signature

```ts
get readyPromise(): Promise<boolean>;
```

Promise resolving to the provider readiness state.

##### Returns

`Promise`\<`boolean`\>

***

### rectangle

#### Get Signature

```ts
get rectangle(): Rectangle;
```

Geographic coverage of the dataset.

##### Returns

[`Rectangle`](https://cesium.com/learn/cesiumjs/ref-doc/Rectangle.html)

#### Implementation of

```ts
ImageryProvider.rectangle
```

***

### selectors

#### Get Signature

```ts
get selectors(): Record<string, ZarrSelectorsProps>;
```

Current index-based selectors used for tile rendering and queries.

##### Returns

`Record`\<`string`, [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md)\>

***

### tileHeight

#### Get Signature

```ts
get tileHeight(): number;
```

Height of rendered imagery tiles in pixels.

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

Width of rendered imagery tiles in pixels.

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

Cesium tiling scheme selected from the detected dataset CRS.

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

Creates a Cesium imagery provider backed by a URL or custom Zarrita store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`LayerOptions`](../interfaces/LayerOptions.md) | Dataset, tiling, selection, style, and request options. |

#### Returns

`ZarrLayerProvider`

#### Remarks

Prefer [createLayer](#createlayer) when adding the result to a viewer.

## Methods

### destroy()

```ts
destroy(): void;
```

Aborts pending reads and releases tile-renderer resources.

#### Returns

`void`

***

### getFullTransect()

```ts
getFullTransect(
   start,
   end,
   selectors?,
options?): Promise<FullTransectResult>;
```

Samples all elevation levels along a line between two WGS84 positions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Starting `[longitude, latitude]` coordinate in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Ending `[longitude, latitude]` coordinate in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than elevation. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sample count, concurrency, cancellation, and resolution controls. |

#### Returns

`Promise`\<[`FullTransectResult`](../interfaces/FullTransectResult.md)\>

A distance-by-elevation value matrix.

***

### getTileCredits()

```ts
getTileCredits(): Credit[];
```

#### Returns

`Credit`[]

Credit entries associated with every rendered tile.

#### Implementation of

```ts
ImageryProvider.getTileCredits
```

***

### getTimeSeries()

```ts
getTimeSeries(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Reads every time value at one WGS84 position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than time. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query controls, including cancellation and resolution. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

A query result ordered by the time coordinate.

***

### getTransect()

```ts
getTransect(
   start,
   end,
   selectors?,
options?): Promise<TransectResult>;
```

Samples one selected level along a line between two WGS84 positions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Starting `[longitude, latitude]` coordinate in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Ending `[longitude, latitude]` coordinate in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Dimension selectors applied to every sample. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sample count, concurrency, cancellation, and resolution controls. |

#### Returns

`Promise`\<[`TransectResult`](../interfaces/TransectResult.md)\>

Distances, positions, and scalar values along the transect.

***

### getVerticalProfile()

```ts
getVerticalProfile(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Reads every elevation value at one WGS84 position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Fixed selectors for dimensions other than elevation. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query controls, including cancellation and resolution. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

A query result ordered by the elevation coordinate.

***

### pickFeatures()

```ts
pickFeatures(
   _x,
   _y,
   level,
   longitude,
latitude): Promise<ImageryLayerFeatureInfo[]>;
```

Queries the feature underneath a Cesium imagery pick position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `_x` | `number` | Tile column; the point query uses the supplied longitude instead. |
| `_y` | `number` | Tile row; the point query uses the supplied latitude instead. |
| `level` | `number` | Resolution level used by the query. |
| `longitude` | `number` | Longitude in radians. |
| `latitude` | `number` | Latitude in radians. |

#### Returns

`Promise`\<[`ImageryLayerFeatureInfo`](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayerFeatureInfo.html)[]\>

Zero or one feature containing the queried value and coordinates.

#### Implementation of

```ts
ImageryProvider.pickFeatures
```

***

### queryData()

```ts
queryData(
   geometry,
   selectors?,
options?): Promise<QueryResult>;
```

Queries the nearest raster cell for a WGS84 GeoJSON point.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `geometry` | [`QueryGeometry`](../type-aliases/QueryGeometry.md) | Point geometry in `[longitude, latitude]` degrees. |
| `selectors?` | `Record`\<`string`, [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md)\> | Optional selector overrides for this query only. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Abort, resolution-level, and coordinate-output controls. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Values and coordinate labels for the selected cell or profile.

#### Throws

For unsupported geometries, invalid selectors, or failed reads.

***

### requestImage()

```ts
requestImage(
   x,
   y,
   level,
_request?): Promise<HTMLCanvasElement | ImageBitmap>;
```

Renders one Cesium imagery tile.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `number` | Tile column. |
| `y` | `number` | Tile row. |
| `level` | `number` | Cesium imagery level. |
| `_request?` | `Request` | Cesium request metadata; currently unused. |

#### Returns

`Promise`\<`HTMLCanvasElement` \| `ImageBitmap`\>

A vertically oriented canvas or image bitmap suitable for Cesium.

#### Implementation of

```ts
ImageryProvider.requestImage
```

***

### updateSelectors()

```ts
updateSelectors(selectors): boolean;
```

Updates dimension selectors used for subsequent renders and queries.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selectors` | `Record`\<`string`, [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md)\> | Selectors keyed by normalized dimension name. |

#### Returns

`boolean`

`true` when at least one selector changed.

***

### updateStyle()

```ts
updateStyle(options): boolean;
```

Updates tile color mapping without recreating the provider.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `colormap?`: `string`; `scale?`: \[`number`, `number`\]; \} | New scale and/or colormap. |
| `options.colormap?` | `string` | - |
| `options.scale?` | \[`number`, `number`\] | - |

#### Returns

`boolean`

`true` when the rendered tile output changed.

***

### createLayer()

```ts
static createLayer(viewer, options): Promise<ZarrImageryLayer>;
```

Creates and initializes a [ZarrImageryLayer](ZarrImageryLayer.md) ready to add to Cesium.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `viewer` | [`CesiumHost`](../type-aliases/CesiumHost.md) | Viewer or widget that will host the layer. |
| `options` | [`LayerOptions`](../interfaces/LayerOptions.md) | Zarr dataset and visualization options. |

#### Returns

`Promise`\<[`ZarrImageryLayer`](ZarrImageryLayer.md)\>

A fully initialized imagery layer. Its provider is available as
`layer.imageryProvider`.

#### Throws

If metadata, dimensions, CRS, or coverage cannot be initialized.

#### Example

```ts
const layer = await ZarrLayerProvider.createLayer(viewer, {
  url: 'https://example.com/data.zarr',
  variable: 'temperature',
  scale: [0, 30]
});
viewer.imageryLayers.add(layer);
```

## Properties

### proxy

```ts
readonly proxy: DefaultProxy;
```

Gets the proxy used by this provider.

#### Implementation of

```ts
ImageryProvider.proxy
```

***

### tileDiscardPolicy

```ts
readonly tileDiscardPolicy: NeverTileDiscardPolicy;
```

Gets the tile discard policy.  If not undefined, the discard policy is responsible
for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
returns undefined, no tiles are filtered.

#### Implementation of

```ts
ImageryProvider.tileDiscardPolicy
```
