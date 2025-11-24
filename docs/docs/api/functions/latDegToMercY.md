# latDegToMercY()

```ts
function latDegToMercY(latDeg): number;
```

Converts a latitude value (in degrees) to Web Mercator Y coordinate (in meters).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `latDeg` | `number` | Latitude in degrees (range -90 → 90). |

## Returns

`number`

The corresponding Y coordinate in Web Mercator projection.

## Remarks

Latitude is clamped to the valid Web Mercator range of ±85.05112878°.

## Example

```ts
const y = latDegToMercY(51.5);
```
