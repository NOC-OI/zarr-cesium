# QueryResult

Values and coordinates returned from a shared Zarr query.

## Extended by

- [`VelocityQueryResult`](VelocityQueryResult.md)

## Properties

### coordinates

```ts
coordinates: Record<string, (number | string)[]>;
```

Coordinate values keyed by the dataset's dimension names.

***

### dimensions

```ts
dimensions: string[];
```

Dataset dimension names represented by the result.

***

### values

```ts
values: number[];
```

Variable values. Scalar point queries contain at most one value; profile and
time-series values align with the ranged coordinate after no-data filtering.

***

### variable

```ts
variable: string;
```

Name of the queried Zarr variable.
