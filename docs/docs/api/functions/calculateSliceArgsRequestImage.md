# calculateSliceArgsRequestImage()

```ts
function calculateSliceArgsRequestImage(
   shape, 
   dataSlice, 
   dimIndices, 
   selectors): SliceArgs;
```

Constructs Zarr slice arguments for extracting a subregion of a multidimensional array.

This function:
- Converts geographic / elevation slice ranges into Zarr slice objects.
- Converts value-based selectors (e.g. `{type: "value", selected: 2020}`) into nearest index selectors.
- Optionally loads dimension coordinate arrays for the selected slice.
- Produces a *new* selector map describing index-based selections.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `shape` | `number`[] | Full array shape. |
| `dataSlice` | [`DataSliceProps`](../interfaces/DataSliceProps.md) | Pixel-space slice ranges `{ startX, endX, startY, endY, startElevation?, endElevation? }` (see [DataSliceProps](../interfaces/DataSliceProps.md)). |
| `dimIndices` | [`DimIndicesProps`](../interfaces/DimIndicesProps.md) | Mapping of dimension names → indices as returned by `identifyDimensionIndices` (see [DimIndicesProps](../interfaces/DimIndicesProps.md)). |
| `selectors` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | User-provided selection map (lat/lon/elevation/time/etc.). See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md). |

## Returns

[`SliceArgs`](../type-aliases/SliceArgs.md)

An object containing:
  - `sliceArgs`: Array of slice objects/indexes matching the array's dimensions. See [SliceArgs](../type-aliases/SliceArgs.md).
  - `dimensionValues`: Possibly updated coordinate arrays.
  - `selectors`: Updated index-based selectors. See [ZarrSelectorsProps](../interfaces/ZarrSelectorsProps.md).
