# identifyDimensionIndices()

```ts
function identifyDimensionIndices(
   dimNames, 
   dimensionNames?, 
   coordinates?): DimIndicesProps;
```

Identify the indices of common dimensions (lat, lon, time, elevation)
in a Zarr array, optionally using CF-compliant standard names or custom dimension mappings.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dimNames` | `string`[] | Names of the array dimensions. |
| `dimensionNames?` | [`DimensionNamesProps`](../interfaces/DimensionNamesProps.md) | Optional explicit mapping of dimension names (see [DimensionNamesProps](../interfaces/DimensionNamesProps.md)). |
| `coordinates?` | `Record`\<`string`, `any`\> | Optional coordinate variable dictionary. |

## Returns

[`DimIndicesProps`](../interfaces/DimIndicesProps.md)

A [DimIndicesProps](../interfaces/DimIndicesProps.md) object describing each dimension’s index and name.
