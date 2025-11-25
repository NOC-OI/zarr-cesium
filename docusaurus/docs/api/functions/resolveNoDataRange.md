# resolveNoDataRange()

```ts
function resolveNoDataRange(
   userMin, 
   userMax, 
   metadataMin, 
   metadataMax): object;
```

Resolves the no-data value range for masking dataset values.

Priority order:
1. User-specified min/max
2. Dataset metadata min/max
3. Hardcoded fallback (-9999 to 9999)

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `userMin` | `number` \| `undefined` | User-defined no-data minimum value. |
| `userMax` | `number` \| `undefined` | User-defined no-data maximum value. |
| `metadataMin` | `number` \| `undefined` | Metadata-defined valid minimum value. |
| `metadataMax` | `number` \| `undefined` | Metadata-defined valid maximum value. |

## Returns

`object`

An object containing:
 - `noDataMin`: Resolved no-data minimum value.
 - `noDataMax`: Resolved no-data maximum value.

### noDataMax

```ts
noDataMax: number;
```

### noDataMin

```ts
noDataMin: number;
```
