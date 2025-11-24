# detectCRS()

```ts
function detectCRS(
   attrs, 
   arr, 
xyLimits?): Promise<CRS>;
```

Detects the coordinate reference system (CRS) of a Zarr dataset based on metadata or coordinate range.
Defaults to EPSG:4326 (WGS84) if uncertain.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attrs` | `Record`\<`string`, `any`\> | Zarr array or group attributes. |
| `arr` | `Array`\<`any`, `Readable`\> \| `null` | Zarr array (may be null). |
| `xyLimits?` | [`XYLimitsProps`](../interfaces/XYLimitsProps.md) | Optional geographic coordinate limits. See [XYLimitsProps](../interfaces/XYLimitsProps.md). |

## Returns

`Promise`\<[`CRS`](../type-aliases/CRS.md)\>

Detected  CRS as a string (e.g., 'EPSG:4326' or 'EPSG:3857'. See [CRS](../type-aliases/CRS.md)).
