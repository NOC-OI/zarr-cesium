# QueryOptions

Controls a shared Zarr data query.

## Extended by

- [`TransectQueryOptions`](TransectQueryOptions.md)

## Properties

### includeSpatialCoordinates?

```ts
optional includeSpatialCoordinates: boolean;
```

Include the queried WGS84 position in the result. Defaults to true.

***

### level?

```ts
optional level: number | "finest";
```

Map zoom to query. The finest available resolution is used by default.

***

### signal?

```ts
optional signal: AbortSignal;
```

Cancels both the remote Zarr read and result processing.
