# ResolvedValueMetadata

Fully resolved packing and no-data metadata for a numeric Zarr variable.

## Properties

### addOffset

```ts
addOffset: number;
```

Offset added after applying [scaleFactor](#scalefactor).

***

### fillValue

```ts
fillValue: number | undefined;
```

Exact raw packed value representing missing data.

***

### noDataMax

```ts
noDataMax: number;
```

Maximum valid decoded value.

***

### noDataMin

```ts
noDataMin: number;
```

Minimum valid decoded value.

***

### scaleFactor

```ts
scaleFactor: number;
```

Multiplier used to decode a packed value.

***

### useFillValue

```ts
useFillValue: boolean;
```

Whether [fillValue](#fillvalue) should be compared with raw values.
