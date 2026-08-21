# TransectQueryOptions

Sampling controls for one-level and full-depth transects.

## Extends

- [`QueryOptions`](QueryOptions.md)

## Properties

### concurrency?

```ts
optional concurrency: number;
```

Maximum point queries in flight. Defaults to 6.

***

### includeSpatialCoordinates?

```ts
optional includeSpatialCoordinates: boolean;
```

Include the queried WGS84 position in the result. Defaults to true.

#### Inherited from

[`QueryOptions`](QueryOptions.md).[`includeSpatialCoordinates`](QueryOptions.md#includespatialcoordinates)

***

### level?

```ts
optional level: number | "finest";
```

Map zoom to query. The finest available resolution is used by default.

#### Inherited from

[`QueryOptions`](QueryOptions.md).[`level`](QueryOptions.md#level)

***

### samples?

```ts
optional samples: number;
```

Number of evenly spaced points, including both endpoints. Defaults to 64.

***

### signal?

```ts
optional signal: AbortSignal;
```

Cancels both the remote Zarr read and result processing.

#### Inherited from

[`QueryOptions`](QueryOptions.md).[`signal`](QueryOptions.md#signal)
