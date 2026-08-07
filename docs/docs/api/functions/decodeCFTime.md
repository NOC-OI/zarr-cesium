# decodeCFTime()

```ts
function decodeCFTime(
   values, 
   units, 
   calendar): string[];
```

Decodes CF-compliant time coordinate values into ISO date strings.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `values` | `number`[] | `undefined` | Array of numeric time values to decode. |
| `units` | `string` | `undefined` | CF time units string (e.g., "days since 2000-01-01"). |
| `calendar` | [`CFCalendar`](../type-aliases/CFCalendar.md) | `'standard'` | CF calendar type (default is "standard"). |

## Returns

`string`[]

Array of ISO date strings corresponding to the input time values.

## Example

```ts
const times = decodeCFTime([0, 1, 2], 'days since 2000-01-01', 'standard');
// ['2000-01-01T00:00:00Z', '2000-01-02T00:00:00Z', '2000-01-03T00:00:00Z']
```
