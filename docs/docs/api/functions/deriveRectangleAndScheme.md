# deriveRectangleAndScheme()

```ts
function deriveRectangleAndScheme(
   crs, 
   xyLimits, 
   levelMetadata, 
   zarrArray, 
   dimIndices): object;
```

Computes a Cesium [Rectangle](https://cesium.com/learn/cesiumjs/ref-doc/Rectangle.html) and [TilingScheme](https://cesium.com/learn/cesiumjs/ref-doc/TilingScheme.html) for a Zarr dataset.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `crs` | [`CRS`](../type-aliases/CRS.md) | CRS code (`EPSG:4326` or `EPSG:3857`). See [CRS](../type-aliases/CRS.md). |
| `xyLimits` | [`XYLimitsProps`](../interfaces/XYLimitsProps.md) | Min/max X/Y values in the dataset's CRS. See [XYLimitsProps](../interfaces/XYLimitsProps.md). |
| `levelMetadata` | `Map`\<`number`, [`ZarrLevelMetadata`](../interfaces/ZarrLevelMetadata.md)\> | Per-resolution metadata (width/height). |
| `zarrArray` | `Array`\<`any`\> | The Zarr array containing the data. |
| `dimIndices` | [`DimIndicesProps`](../interfaces/DimIndicesProps.md) | Mapping of dimension keys to their array indices. See [DimIndicesProps](../interfaces/DimIndicesProps.md). |

## Returns

`object`

`{ rectangle, tilingScheme }`

### rectangle

```ts
rectangle: Rectangle;
```

### tilingScheme

```ts
tilingScheme: TilingScheme;
```

## Remarks

Behavior notes:
- The rectangle is expanded by half a pixel in all directions to avoid edge clipping.
- Pixel resolution is estimated from either `levelMetadata.get(0)` or the Zarr array shape.
- For EPSG:3857, the function interprets `xyLimits` as Web Mercator meters and uses
  `WebMercatorProjection.unproject` to obtain geographic radians.
- If any computation fails, the function falls back to a full-world tiling scheme
  (WebMercator or Geographic).
- If latitude limits are reversed, they are swapped automatically.
