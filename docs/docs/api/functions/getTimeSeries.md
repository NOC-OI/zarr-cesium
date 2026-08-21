# getTimeSeries()

```ts
function getTimeSeries(
   backend,
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries every time coordinate at one point and the selected elevation.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) | Provider implementing the query backend contract. |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | WGS84 `[longitude, latitude]` position. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Optional selections for dimensions other than time. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Resolution, coordinate output, and cancellation options. |

## Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Values and coordinates returned by the backend.

## Throws

If the dataset has no queryable time dimension.
