# sampleTransectPositions()

```ts
function sampleTransectPositions(
   start,
   end,
   samples?): QueryPosition[];
```

Builds evenly spaced WGS84 samples along the shortest longitude path.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Start `[longitude, latitude]` in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | End `[longitude, latitude]` in degrees. |
| `samples?` | `number` | Number of positions to return; values below two are clamped to two. |

## Returns

[`QueryPosition`](../type-aliases/QueryPosition.md)[]
