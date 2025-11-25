# calculateXYFromBounds()

```ts
function calculateXYFromBounds(
   bounds, 
   width, 
   height, 
   crs): object;
```

Converts geographic bounds (lat/lon) to pixel-space indices for slicing Zarr arrays.
Supports both EPSG:4326 and EPSG:3857 projections.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bounds` | \{ `east`: `number`; `north`: `number`; `south`: `number`; `west`: `number`; \} | Geographic bounding box. |
| `bounds.east` | `number` | - |
| `bounds.north` | `number` | - |
| `bounds.south` | `number` | - |
| `bounds.west` | `number` | - |
| `width` | `number` | Array width (longitude dimension). |
| `height` | `number` | Array height (latitude dimension). |
| `crs` | [`CRS`](../type-aliases/CRS.md) \| `null` | Coordinate reference system. See [CRS](../type-aliases/CRS.md). |

## Returns

`object`

Start and end pixel indices for X and Y axes.

### x

```ts
x: [number, number];
```

### y

```ts
y: [number, number];
```
