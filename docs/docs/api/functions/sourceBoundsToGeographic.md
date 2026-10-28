# sourceBoundsToGeographic()

```ts
function sourceBoundsToGeographic(
   bounds, 
   projection, 
   segments?): BoundsProps;
```

Transform a source rectangle to WGS84 by sampling a regular interior grid.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `bounds` | [`XYLimitsProps`](../interfaces/XYLimitsProps.md) |
| `projection` | [`ResolvedCRS`](../interfaces/ResolvedCRS.md) |
| `segments?` | `number` |

## Returns

[`BoundsProps`](../interfaces/BoundsProps.md)
