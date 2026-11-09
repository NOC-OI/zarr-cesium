# resolveValueMetadata()

```ts
function resolveValueMetadata(
   attributeSources, 
   userMin?, 
   userMax?
): ResolvedValueMetadata;
```

Resolves numeric packing and no-data metadata from an ordered attribute hierarchy.

Later attribute sources override earlier ones, so callers can pass store,
group, and array attributes in increasing order of specificity. Fill values
apply to raw packed samples; valid ranges apply after scale/offset decoding.
User no-data bounds retain the precedence rules of [resolveNoDataRange](resolveNoDataRange.md).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attributeSources` | (`Record`\<`string`, `unknown`\> \| `undefined`)[] | Attribute objects ordered from least to most specific. |
| `userMin?` | `number` | Optional user-defined minimum valid decoded value. |
| `userMax?` | `number` | Optional user-defined maximum valid decoded value. |

## Returns

[`ResolvedValueMetadata`](../interfaces/ResolvedValueMetadata.md)
