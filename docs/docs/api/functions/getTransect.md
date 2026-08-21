# getTransect()

```ts
function getTransect(
   backend,
   start,
   end,
   selectors?,
options?): Promise<TransectResult>;
```

Queries one scalar level along a line between two WGS84 positions.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) | Provider implementing the query backend contract. |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Start `[longitude, latitude]` in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | End `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Scalar selectors applied to every sampled position. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sample count, concurrency, resolution, and cancellation options. |

## Returns

`Promise`\<[`TransectResult`](../interfaces/TransectResult.md)\>
