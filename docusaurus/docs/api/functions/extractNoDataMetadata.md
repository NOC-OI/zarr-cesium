# extractNoDataMetadata()

```ts
function extractNoDataMetadata(zarrArray): object;
```

Extracts no-data related metadata from a Zarr array's attributes.

Looks for standard NetCDF attributes (`valid_min`, `valid_max`, `_FillValue`, `missing_value`).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `zarrArray` | `Array`\<`any`\> | Zarr array to extract metadata from. |

## Returns

`object`

An object containing:
  - `metadataMin`: Valid minimum value (if any).
  - `metadataMax`: Valid maximum value (if any).
  - `fillValue`: Exact fill/missing value (if any).
  - `useFillValue`: Whether to apply exact masking based on fill value.

### fillValue

```ts
fillValue: number | undefined;
```

### metadataMax

```ts
metadataMax: number | undefined;
```

### metadataMin

```ts
metadataMin: number | undefined;
```

### useFillValue

```ts
useFillValue: boolean;
```
