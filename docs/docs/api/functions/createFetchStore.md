# createFetchStore()

```ts
function createFetchStore(
   url, 
   requestOverrides?, 
   transformedFetch?): FetchStore;
```

Creates a Zarrita FetchStore with optional static and dynamic request settings.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |
| `requestOverrides?` | [`RequestOverrides`](../interfaces/RequestOverrides.md) |
| `transformedFetch?` | (`input`, `init?`) => `Promise`\<`Response`\> |

## Returns

`FetchStore`
