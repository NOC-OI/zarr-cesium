# limitStoreRequests()

```ts
function limitStoreRequests(store, concurrency): AsyncReadable;
```

Wrap a Zarrita store so all reads share one request-concurrency budget.

Requests waiting for a slot honour their abort signal and never reach the
underlying store when cancelled.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `store` | `Readable` |
| `concurrency` | `number` |

## Returns

`AsyncReadable`
