# colorScaleByName()

```ts
function colorScaleByName(color): (x) => number[];
```

Returns a color scale function for a given colormap name.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `color` | `string` | Name of the color scale (e.g., `'viridis'`, `'coolwarm_r'`). |

## Returns

A callable function that accepts a normalized value `x ∈ [0, 1]` and returns an RGB array.

```ts
(x): number[];
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `x` | `number` |

### Returns

`number`[]

## Remarks

This function is automatically generated for every color map and its reversed counterpart.
For instance, both `viridis` and `viridis_r` can be used to generate forward or reversed
colormap interpolators.

## Example

```ts
const viridis = colorScaleByName('viridis');
const rgb = viridis(0.5); // [r, g, b]
```
