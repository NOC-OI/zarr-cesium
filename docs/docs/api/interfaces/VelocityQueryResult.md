# VelocityQueryResult

Values and coordinates returned from a shared Zarr query.

## Extends

- [`QueryResult`](QueryResult.md)

## Properties

### components

```ts
components: object;
```

Vector components aligned with `values` (which contains speed).

#### u

```ts
u: number[];
```

#### v

```ts
v: number[];
```

***

### coordinates

```ts
coordinates: Record<string, (number | string)[]>;
```

Coordinate values keyed by the dataset's dimension names.

#### Inherited from

[`QueryResult`](QueryResult.md).[`coordinates`](QueryResult.md#coordinates)

***

### dimensions

```ts
dimensions: string[];
```

Dataset dimension names represented by the result.

#### Inherited from

[`QueryResult`](QueryResult.md).[`dimensions`](QueryResult.md#dimensions)

***

### values

```ts
values: number[];
```

Variable values. Scalar point queries contain at most one value; profile and
time-series values align with the ranged coordinate after no-data filtering.

#### Inherited from

[`QueryResult`](QueryResult.md).[`values`](QueryResult.md#values)

***

### variable

```ts
variable: string;
```

Name of the queried Zarr variable.

#### Inherited from

[`QueryResult`](QueryResult.md).[`variable`](QueryResult.md#variable)
