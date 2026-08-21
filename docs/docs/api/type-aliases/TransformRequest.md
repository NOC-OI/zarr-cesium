# TransformRequest()

```ts
type TransformRequest = (url, options?) =>
  | RequestParameters
| Promise<RequestParameters>;
```

## Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |
| `options?` | \{ `method?`: `"GET"` \| `"HEAD"`; \} |
| `options.method?` | `"GET"` \| `"HEAD"` |

## Returns

  \| [`RequestParameters`](../interfaces/RequestParameters.md)
  \| `Promise`\<[`RequestParameters`](../interfaces/RequestParameters.md)\>
