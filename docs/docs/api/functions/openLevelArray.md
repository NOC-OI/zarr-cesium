# openLevelArray()

```ts
function openLevelArray(
   root,
   levelPath,
   variable,
   levelCache,
zarrVersion?): Promise<Array<any, Readable>>;
```

Opens and caches a specific multiscale level array.
Keeps a small LRU-style cache of up to three levels.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `root` | `Location`\<`Readable`\> | Zarr group root. |
| `levelPath` | `string` | Path to the multiscale level. |
| `variable` | `string` | Variable name within the level (if any). |
| `levelCache` | `Map`\<`number`, `any`\> | Cache of opened level arrays. |
| `zarrVersion?` | `3` \| `2` \| `null` | Zarr version (2 or 3). |

## Returns

`Promise`\<`Array`\<`any`, `Readable`\>\>

The opened Zarr array for the specified level.
