# lonDegToMercX()

```ts
function lonDegToMercX(lonDeg): number;
```

Converts a longitude in degrees into a Web Mercator X coordinate (meters).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `lonDeg` | `number` | Longitude in degrees. |

## Returns

`number`

Web Mercator X in meters.

## Remarks

Unlike geographic imagery providers, this function does not clamp
the longitude range — values outside [-180, 180] are permitted,
which is useful for wrapped global grids (e.g. 0…360).

Cesium's `Cartographic` stores angles in radians, so the input is
internally converted using `Math.toRadians`.
