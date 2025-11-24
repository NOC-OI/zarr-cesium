# validateBounds()

```ts
function validateBounds(bounds): boolean;
```

Validates whether geographic bounds are logically consistent.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bounds` | [`BoundsProps`](../interfaces/BoundsProps.md) | Geographic bounding box. See [BoundsProps](../interfaces/BoundsProps.md). |

## Returns

`boolean`

Whether the bounds satisfy a strict WGS84 interpretation.

## Remarks

This check is strict and only accepts WGS84-style longitude ranges
in [-180, 180] and latitude ranges in [-90, 90].

Bounds used in Zarr datasets may legitimately exceed these ranges
(e.g., wrapped 0–360 grids), in which case this function will return `false`.
