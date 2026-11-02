# streamFullTransect()

```ts
function streamFullTransect(
   backend,
   start,
   end,
   selectors?,
   options?
): AsyncGenerator<FullTransectStreamChunk>;
```

Streams full-depth transect rows as they are read from the backend.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) & `object` |

## Returns

`AsyncGenerator`\<[`FullTransectStreamChunk`](../interfaces/FullTransectStreamChunk.md)\>
