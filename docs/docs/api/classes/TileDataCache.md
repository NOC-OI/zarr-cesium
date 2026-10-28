# TileDataCache

A simple LRU cache for tile data. The cache is keyed by a string, which is
typically a combination of the layer ID and tile coordinates.

## Accessors

### stats

#### Get Signature

```ts
get stats(): TileCacheStats;
```

##### Returns

[`TileCacheStats`](../interfaces/TileCacheStats.md)

## Constructors

### Constructor

```ts
new TileDataCache(maxBytes): TileDataCache;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `maxBytes` | `number` |

#### Returns

`TileDataCache`

## Methods

### clear()

```ts
clear(): void;
```

#### Returns

`void`

***

### get()

```ts
get(key): CachedTileData | undefined;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |

#### Returns

`CachedTileData` \| `undefined`

***

### set()

```ts
set(key, entry): void;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `entry` | `CachedTileData` |

#### Returns

`void`

## Properties

### maxBytes

```ts
readonly maxBytes: number;
```
