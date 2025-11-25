# calculateSliceArgs()

```ts
function calculateSliceArgs(
   shape, 
   dataSlice, 
   dimIndices, 
   selectors, 
   dimensionValues, 
   root, 
   levelInfo, 
   zarrVersion, 
   updateDimensionValues): Promise<{
  dimensionValues: {
   [key: string]: number[] | Float64Array<ArrayBufferLike>;
  };
  selectors: {
   [key: string]: ZarrSelectorsProps;
  };
  sliceArgs: SliceArgs;
}>;
```

Constructs Zarr slice arguments for extracting a subregion of a multidimensional array.

This function:
- Converts geographic / elevation slice ranges into Zarr slice objects.
- Converts value-based selectors (e.g. `{type: "value", selected: 2020}`) into nearest index selectors.
- Optionally loads dimension coordinate arrays for the selected slice.
- Produces a *new* selector map describing index-based selections.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `shape` | `number`[] | `undefined` | Full array shape. |
| `dataSlice` | [`DataSliceProps`](../interfaces/DataSliceProps.md) | `undefined` | Pixel-space slice ranges `{ startX, endX, startY, endY, startElevation?, endElevation? }` (see [DataSliceProps](../interfaces/DataSliceProps.md)). |
| `dimIndices` | [`DimIndicesProps`](../interfaces/DimIndicesProps.md) | `undefined` | Mapping of dimension names → indices as returned by `identifyDimensionIndices` (see [DimIndicesProps](../interfaces/DimIndicesProps.md)). |
| `selectors` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | `undefined` | User-provided selection map (lat/lon/elevation/time/etc.). See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md). |
| `dimensionValues` | \{ \[`key`: `string`\]: `number`[] \| `Float64Array`\<`ArrayBufferLike`\>; \} | `undefined` | Cache of already-loaded coordinate arrays (mutated by this function). |
| `root` | `Location`\<`FetchStore`\> | `undefined` | Root Zarr group location. |
| `levelInfo` | `string` \| `null` | `undefined` | Optional multiscale subpath. |
| `zarrVersion` | `2` \| `3` \| `null` | `undefined` | Zarr version (2 or 3). |
| `updateDimensionValues` | `boolean` | `false` | If true, rewrites dimensionValues only for the selected ranges. |

## Returns

`Promise`\<\{
  `dimensionValues`: \{
   \[`key`: `string`\]: `number`[] \| `Float64Array`\<`ArrayBufferLike`\>;
  \};
  `selectors`: \{
   \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md);
  \};
  `sliceArgs`: [`SliceArgs`](../type-aliases/SliceArgs.md);
\}\>

An object containing:
  - `sliceArgs`: Array of slice objects/indexes matching the array's dimensions. See [SliceArgs](../type-aliases/SliceArgs.md).
  - `dimensionValues`: Possibly updated coordinate arrays.
  - `selectors`: Updated index-based selectors. See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md).
