# initZarrDataset()

```ts
function initZarrDataset(
   store, 
   root, 
   variable, 
   dimensions, 
   levelMetadata, 
   levelCache, 
   zarrVersion, 
   multiscaleLevel?): Promise<{
  attrs: Record<string, any>;
  dimIndices: DimIndicesProps;
  levelInfos: string[];
  multiscaleLevel?: number;
  zarrArray: Array<any>;
}>;
```

Opens a Zarr variable (single-scale or multiscale pyramid) and prepares its metadata.

- Detects and loads multiscale dataset levels (if present).
- Computes per-level dimension sizes and stores them in `levelMetadata`.
- Scans coordinate variables from `_ARRAY_DIMENSIONS` or consolidated metadata.
- Detects CF/alias-based dimension names (lat/lon/time/elevation).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `store` | `FetchStore` | Zarr store (e.g., `FetchStore`). |
| `root` | `Location`\<`FetchStore`\> | Root Zarr group location. |
| `variable` | `string` | Variable name within the Zarr group. |
| `dimensions` | [`DimensionNamesProps`](../interfaces/DimensionNamesProps.md) | Optional explicit dimension name mapping. See [DimensionNamesProps](../interfaces/DimensionNamesProps.md). |
| `levelMetadata` | `Map`\<`number`, [`ZarrLevelMetadata`](../interfaces/ZarrLevelMetadata.md)\> | Map to populate with per-level metadata (width/height). |
| `levelCache` | `Map`\<`number`, `any`\> | Cache for opened multiscale level arrays. |
| `zarrVersion` | `2` \| `3` \| `null` | Zarr version (2 or 3). |
| `multiscaleLevel?` | `number` | Optional initial multiscale level to open. |

## Returns

`Promise`\<\{
  `attrs`: `Record`\<`string`, `any`\>;
  `dimIndices`: [`DimIndicesProps`](../interfaces/DimIndicesProps.md);
  `levelInfos`: `string`[];
  `multiscaleLevel?`: `number`;
  `zarrArray`: `Array`\<`any`\>;
\}\>

- `zarrArray` — the opened array for the selected multiscale level.
  - `levelInfos` — all multiscale level paths.
  - `dimIndices` — discovered dimension index mapping. See [DimIndicesProps](../interfaces/DimIndicesProps.md).
  - `attrs` — variable or group attributes.
  - `multiscaleLevel` — updated level if adjusted due to missing levels.
