# streamTimeSeries()

```ts
function streamTimeSeries(
   backend,
   position,
   selectors?,
   options?
): AsyncGenerator<QueryResult>;
```

Streams time-series chunks as they are read from the backend.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) |
| `options?` | [`QueryStreamOptions`](../interfaces/QueryStreamOptions.md) |

## Returns

`AsyncGenerator`\<[`QueryResult`](../interfaces/QueryResult.md)\>
