# loadDimensionValues()

```ts
function loadDimensionValues(
   dimensionValues, 
   levelInfo, 
   dimIndices, 
   root, 
   zarrVersion, 
slice?): Promise<number[] | Float64Array<ArrayBufferLike>>;
```

Loads the coordinate values for a specific dimension.

Behavior:
- Uses cached values if available (does not reload unless the caller resets the cache).
- Resolves the correct multiscale level if `levelInfo` is provided.
- Converts Zarr buffers into plain JavaScript number arrays.
- Converts bigint values to number.
- If a slice `[start, end]` is supplied, only a sub-range is returned.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dimensionValues` | `Record`\<`string`, `Float64Array` \| `number`[]\> | Cache of already-loaded coordinate arrays. |
| `levelInfo` | `string` \| `null` | Optional multiscale subpath. |
| `dimIndices` | \{ `array`: `Array`\<`any`, `Readable`\> \| `null`; `index`: `number`; `name`: `string`; \} | Dimension index info. See [DimIndicesProps](../interfaces/DimIndicesProps.md). |
| `dimIndices.array` | `Array`\<`any`, `Readable`\> \| `null` | - |
| `dimIndices.index` | `number` | - |
| `dimIndices.name` | `string` | - |
| `root?` | `Location`\<`FetchStore`\> | Root Zarr group location. |
| `zarrVersion?` | `2` \| `3` \| `null` | Zarr version (2 or 3). |
| `slice?` | \[`number`, `number`\] | Optional index range `[start, end]` to slice the loaded values. |

## Returns

`Promise`\<`number`[] \| `Float64Array`\<`ArrayBufferLike`\>\>

The loaded coordinate array for the dimension.
