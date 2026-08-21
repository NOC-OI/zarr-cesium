# getVerticalProfile()

```ts
function getVerticalProfile(
   backend,
   position,
   selectors?,
options?): Promise<QueryResult>;
```

Queries every elevation coordinate at one point and the selected time.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) | Provider implementing the query backend contract. |
| `position` | [`QueryPosition`](../type-aliases/QueryPosition.md) | WGS84 `[longitude, latitude]` position. |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) | Optional selections for dimensions other than elevation. |
| `options?` | [`QueryOptions`](../interfaces/QueryOptions.md) | Resolution, coordinate output, and cancellation options. |

## Returns

`Promise`\<[`QueryResult`](../interfaces/QueryResult.md)\>

Values and coordinates returned by the backend.

## Throws

If the dataset has no queryable elevation dimension.
