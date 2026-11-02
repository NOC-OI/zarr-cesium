# QueryOptions

Controls a shared Zarr data query.

## Extended by

- [`QueryStreamOptions`](QueryStreamOptions.md)
- [`TransectQueryOptions`](TransectQueryOptions.md)

## Properties

### includeSpatialCoordinates?

```ts
includeSpatialCoordinates?: boolean;
```

Include the queried WGS84 position in the result. Defaults to true.

***

### level?

```ts
level?: number | "finest";
```

Map zoom to query. The finest available resolution is used by default.

***

### signal?

```ts
signal?: AbortSignal;
```

Cancels both the remote Zarr read and result processing.
