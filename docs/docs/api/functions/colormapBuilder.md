# colormapBuilder()

```ts
function colormapBuilder(
   color, 
   convertTo, 
   n, 
   opacity): number[][] | string[];
```

Builds a color ramp (discrete or continuous) from a specified colormap.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `color` | `string` | `undefined` | Name of the colormap to use (e.g. `'viridis'`, `'RdBu_r'`). |
| `convertTo` | `string` | `''` | Optional output format (`'hex'` or `'css'`). Default is raw RGB arrays. |
| `n` | `number` | `255` | Number of color steps to generate (default: 255). |
| `opacity` | `number` | `1` | Opacity factor from 0 to 1 (default: 1). |

## Returns

`number`[][] \| `string`[]

Array of colors in the selected format.

## Example

```ts
// Generate a viridis ramp as CSS rgba() strings
const colors = colormapBuilder('viridis', 'css', 10, 0.8);
console.log(colors[0]); // "rgba(68,1,84,0.8)"
```
