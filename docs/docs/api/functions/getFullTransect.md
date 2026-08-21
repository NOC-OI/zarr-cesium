# getFullTransect()

```ts
function getFullTransect(
   backend,
   start,
   end,
   selectors?,
options?): Promise<FullTransectResult>;
```

Queries all elevation levels along a line between two WGS84 positions.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) | Provider implementing the query backend contract. |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) | Start `[longitude, latitude]` in degrees. |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) | End `[longitude, latitude]` in degrees. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Selectors applied to dimensions other than elevation. |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) | Sample count, concurrency, resolution, and cancellation options. |

## Returns

`Promise`\<[`FullTransectResult`](../interfaces/FullTransectResult.md)\>

## Throws

If the dataset has no queryable elevation dimension.
