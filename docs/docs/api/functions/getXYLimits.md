# getXYLimits()

```ts
function getXYLimits(
   root, 
   dimIndices, 
   levelInfos, 
   multiscale, 
zarrVersion): Promise<XYLimitsProps>;
```

Retrieve the geographic coordinate limits (min/max latitude/longitude) for a Zarr array.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `root` | `Location`\<`FetchStore`\> | Zarr group root. |
| `dimIndices` | [`DimIndicesProps`](../interfaces/DimIndicesProps.md) | Dimension mapping. See [DimIndicesProps](../interfaces/DimIndicesProps.md). |
| `levelInfos` | `string`[] | Multiscale level paths. |
| `multiscale` | `boolean` | Whether the dataset is multiscale. |
| `zarrVersion` | `2` \| `3` \| `null` | Zarr version (2 or 3). |

## Returns

`Promise`\<[`XYLimitsProps`](../interfaces/XYLimitsProps.md)\>

A [XYLimitsProps](../interfaces/XYLimitsProps.md) object describing the coordinate bounds.
