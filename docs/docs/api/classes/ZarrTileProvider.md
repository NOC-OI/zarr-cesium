# ZarrTileProvider

Provides Zarr dataset access and rendering capabilities for web-map layers.

## Accessors

### cacheKey

#### Get Signature

```ts
get cacheKey(): string;
```

Stable selector-derived key that map adapters can use to invalidate tile caches.

##### Returns

`string`

***

### ready

#### Get Signature

```ts
get ready(): boolean;
```

Whether initialization completed successfully and the provider has not been destroyed.

##### Returns

`boolean`

***

### readyPromise

#### Get Signature

```ts
get readyPromise(): Promise<boolean>;
```

Promise that resolves with the result of asynchronous dataset initialization.

##### Returns

`Promise`\<`boolean`\>

## Constructors

### Constructor

```ts
new ZarrTileProvider(options): ZarrTileProvider;
```

Creates the framework-independent Zarr tile renderer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ZarrTileOptions`](../interfaces/ZarrTileOptions.md) | Dataset, rendering, request, and selector configuration. |

#### Returns

`ZarrTileProvider`

#### Throws

If neither `options.url` nor `options.store` is provided.

#### Remarks

Initialization starts immediately. Await [readyPromise](#readypromise) before rendering or querying.

## Methods

### abortTile()

```ts
abortTile(key): void;
```

Aborts an in-flight tile request.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Tile key originally passed to [renderTile](#rendertile). |

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Aborts outstanding tile requests and prevents further rendering work.

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

Samples every vertical level along a line between two WGS84 positions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Start `[longitude, latitude]` in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | End `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Selectors used for dimensions other than elevation. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sampling, concurrency, and cancellation options. |

#### Returns

`Promise`\<[`FullTransectResult`](../interfaces/FullTransectResult.md)\>

***

### getTimeSeries()

```ts
getTimeSeries(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries every time coordinate at a WGS84 position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Optional selectors for dimensions other than time. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query level, coordinate, and cancellation options. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Values and their time coordinates.

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
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Start `[longitude, latitude]` in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | End `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Selectors used for non-spatial dimensions. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sampling, concurrency, and cancellation options. |

#### Returns

`Promise`\<[`TransectResult`](../interfaces/TransectResult.md)\>

***

### getVerticalProfile()

```ts
getVerticalProfile(
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries every vertical coordinate at a WGS84 position.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Optional selectors for dimensions other than elevation. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Query level, coordinate, and cancellation options. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Values and their vertical coordinates.

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
| `geometry` | [`QueryGeometry`](../type-aliases/QueryGeometry.md) | Query geometry. Point queries are currently supported. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Optional per-query selectors merged over the provider selectors. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Resolution, coordinate output, and cancellation options. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Sampled values, dimension names, and coordinate arrays.

#### Throws

If the geometry is unsupported, a selector is invalid, or initialization failed.

#### Remarks

One ranged non-spatial selector produces a profile or time series.

***

### queryPoints()

```ts
queryPoints(
   positions,
   selectors?,
options?): Promise<QueryResult[]>;
```

Queries several WGS84 points using the same selectors and array level.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `positions` | [`QueryPosition`](../type-aliases/QueryPosition.md)[] | Positions as `[longitude, latitude]` pairs. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Selectors shared by every point. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Resolution, concurrency, coordinate, and cancellation options. |

#### Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)[]\>

One query result per input position, preserving input order.

#### Remarks

Source chunks are deduplicated so transects do not fetch and decode a chunk per sample.

***

### renderTile()

```ts
renderTile(
   boundsDeg,
   z,
key): Promise<HTMLCanvasElement | ImageBitmap>;
```

Fetches and renders a geographic tile into a canvas.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `boundsDeg` | [`BoundsProps`](../interfaces/BoundsProps.md) | WGS84 tile bounds in degrees. |
| `z` | `number` | Map zoom used to choose a multiscale level. |
| `key` | `string` | Unique request key used for cancellation. |

#### Returns

`Promise`\<`HTMLCanvasElement` \| `ImageBitmap`\>

A canvas or transferable image bitmap containing the rendered tile.

#### Throws

If initialization failed, the provider was destroyed, or rendering cannot complete.

***

### updateSelectors()

```ts
updateSelectors(selectors): boolean;
```

Merges new dimension selectors into the current selection.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selectors` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Selectors expressed as indices, values, or ranges. |

#### Returns

`boolean`

`true` when the effective selection changed and consumers should redraw.

***

### updateStyle()

```ts
updateStyle(opts): boolean;
```

Updates the data scale or colormap without reopening the dataset.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `colormap?`: `string`; `scale?`: \[`number`, `number`\]; \} | Partial style update. |
| `opts.colormap?` | `string` | - |
| `opts.scale?` | \[`number`, `number`\] | - |

#### Returns

`boolean`

`true` when the effective style changed and consumers should redraw.

## Properties

### coverageBoundsDeg

```ts
coverageBoundsDeg:
  | {
  east: number;
  north: number;
  south: number;
  west: number;
}
  | null;
```

***

### coverageBoundsMerc

```ts
coverageBoundsMerc:
  | {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
}
  | null;
```

***

### crs

```ts
crs: CRS | null;
```

Detected or configured coordinate reference system.

***

### dimensionValues

```ts
dimensionValues: DimensionValues;
```

Coordinate values keyed by canonical dimension name. Available after [readyPromise](#readypromise) resolves.

***

### selectors

```ts
selectors: ZarrSelectors;
```

Selectors currently used to slice non-spatial dimensions.
