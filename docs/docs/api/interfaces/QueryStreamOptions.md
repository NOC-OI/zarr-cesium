# QueryStreamOptions

Controls how many coordinates are returned by each streamed query chunk.

## Extends

- [`QueryOptions`](QueryOptions.md)

## Properties

### chunkSize?

```ts
chunkSize?: number;
```

Number of ranged coordinates or transect positions per chunk. Defaults to 32.

***

### includeSpatialCoordinates?

```ts
includeSpatialCoordinates?: boolean;
```

Include the queried WGS84 position in the result. Defaults to true.

#### Inherited from

[`QueryOptions`](QueryOptions.md).[`includeSpatialCoordinates`](QueryOptions.md#includespatialcoordinates)

***

### level?

```ts
level?: number | "finest";
```

Map zoom to query. The finest available resolution is used by default.

#### Inherited from

[`QueryOptions`](QueryOptions.md).[`level`](QueryOptions.md#level)

***

### signal?

```ts
signal?: AbortSignal;
```

Cancels both the remote Zarr read and result processing.

#### Inherited from

[`QueryOptions`](QueryOptions.md).[`signal`](QueryOptions.md#signal)
