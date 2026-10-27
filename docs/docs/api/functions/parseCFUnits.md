# parseCFUnits()

```ts
function parseCFUnits(units): object;
```

Parses a CF-compliant units string into its components.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `units` | `string` | The CF units string (e.g., "days since 2000-01-01"). |

## Returns

`object`

An object containing the time unit and reference date.

### ref

```ts
ref: string;
```

### unit

```ts
unit: string;
```

## Example

```ts
const { unit, ref } = parseCFUnits('days since 2000-01-01');
// unit: 'days', ref: '2000-01-01'
```
