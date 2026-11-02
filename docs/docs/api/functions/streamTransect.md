# streamTransect()

```ts
function streamTransect(
   backend,
   start,
   end,
   selectors?,
   options?
): AsyncGenerator<TransectStreamChunk>;
```

Streams ordered chunks of a one-level transect.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `backend` | [`QueryBackend`](../interfaces/QueryBackend.md) |
| `start` | [`QueryPosition`](../type-aliases/QueryPosition.md) |
| `end` | [`QueryPosition`](../type-aliases/QueryPosition.md) |
| `selectors?` | [`ZarrSelectors`](../interfaces/ZarrSelectors.md) |
| `options?` | [`TransectQueryOptions`](../interfaces/TransectQueryOptions.md) & `object` |

## Returns

`AsyncGenerator`\<[`TransectStreamChunk`](../interfaces/TransectStreamChunk.md)\>
