# createTransformedFetch()

```ts
function createTransformedFetch(transformRequest, onAuthError?): (input, init?) => Promise<Response>;
```

Creates a fetch implementation that applies dynamic request configuration.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `transformRequest` | [`TransformRequest`](../type-aliases/TransformRequest.md) |
| `onAuthError?` | [`OnAuthError`](../type-aliases/OnAuthError.md) |

## Returns

```ts
(input, init?): Promise<Response>;
```

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `URL` \| `RequestInfo` |
| `init?` | `RequestInit` |

### Returns

`Promise`\<`Response`\>
