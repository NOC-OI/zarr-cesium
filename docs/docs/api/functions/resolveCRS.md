# resolveCRS()

```ts
function resolveCRS(
   crs, 
   definition?, 
   attrs?, 
   arrAttrs?): ResolvedCRS;
```

Resolve an explicit or metadata-declared rectilinear source CRS.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `crs` | `string` |
| `definition?` | [`CRSDefinition`](../type-aliases/CRSDefinition.md) |
| `attrs?` | `Record`\<`string`, `any`\> |
| `arrAttrs?` | `Record`\<`string`, `any`\> |

## Returns

[`ResolvedCRS`](../interfaces/ResolvedCRS.md)
