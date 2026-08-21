# calculateHeightMeters()

```ts
function calculateHeightMeters(
   elevationValue,
   elevationArray,
   verticalExaggeration,
   belowSeaLevel,
   flipElevation?): number;
```

Converts elevation index to Cesium height (meters),
applying vertical exaggeration and optional below-sea-level offset.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `elevationValue` | `number` | Scalar elevation value or index. |
| `elevationArray` | `number`[] \| `Float64Array`\<`ArrayBufferLike`\> \| `undefined` | Full elevation coordinate array. |
| `verticalExaggeration` | `number` | Exaggeration multiplier. |
| `belowSeaLevel` | `boolean` \| `undefined` | Whether elevations are below sea level. |
| `flipElevation?` | `boolean` | If true, inverts elevation direction. |

## Returns

`number`

Height in meters for Cesium rendering.
