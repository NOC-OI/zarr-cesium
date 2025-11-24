# getCubeDimensions()

```ts
function getCubeDimensions(cubeDimensions, dimIndices): object;
```

Computes cube dimension ordering and strides based on dimension indices.
Useful for reshaping 3D Zarr arrays into Cesium-renderable layouts.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `cubeDimensions` | \[`number`, `number`, `number`\] | Original cube dimensions [nx, ny, nz]. |
| `dimIndices` | [`DimIndicesProps`](../interfaces/DimIndicesProps.md) | Dimension index mapping. See [DimIndicesProps](../interfaces/DimIndicesProps.md). |

## Returns

`object`

An object containing:
  - `nx`, `ny`, `nz`: Original cube dimensions.
  - `indicesOrder`: Ordered dimension names.
  - `strides`: Stride values for each dimension.

### indicesOrder

```ts
indicesOrder: string[];
```

### nx

```ts
nx: number;
```

### ny

```ts
ny: number;
```

### nz

```ts
nz: number;
```

### strides

```ts
strides: Record<string, number>;
```
