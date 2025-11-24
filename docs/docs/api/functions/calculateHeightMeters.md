# calculateHeightMeters()

```ts
function calculateHeightMeters(
   elevationValue, 
   elevationArray, 
   verticalExaggeration, 
   belowSeaLevel, 
   flipElevation): number;
```

Converts elevation index to Cesium height (meters),
applying vertical exaggeration and optional below-sea-level offset.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `elevationValue` | `number` | `undefined` | Scalar elevation value or index. |
| `elevationArray` | `number`[] \| `Float64Array`\<`ArrayBufferLike`\> \| `undefined` | `undefined` | Full elevation coordinate array. |
| `verticalExaggeration` | `number` | `undefined` | Exaggeration multiplier. |
| `belowSeaLevel` | `boolean` \| `undefined` | `undefined` | Whether elevations are below sea level. |
| `flipElevation` | `boolean` | `false` | If true, inverts elevation direction. |

## Returns

`number`

Height in meters for Cesium rendering.
