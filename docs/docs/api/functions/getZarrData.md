# getZarrData()

```ts
function getZarrData(
   arr,
   selection?,
options?): Promise<any>;
```

Reads an array with the same Zarrita module instance that opened it.
Zarrita 0.7 keeps array decoding context module-local, so consumers must not
call a separately resolved copy of `zarrita.get` on arrays returned here.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `arr` | `Array`\<`any`\> |
| `selection?` | `any` |
| `options?` | `any` |

## Returns

`Promise`\<`any`\>
