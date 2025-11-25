# createColorRampTexture()

```ts
function createColorRampTexture(
   gl, 
   colors, 
   opacity): 
  | WebGLTexture
  | null;
```

Creates a flexible 1D color-ramp texture supporting either normalized (0–1)
or integer (0–255) color definitions.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gl` | `WebGL2RenderingContext` | The WebGL2 rendering context. |
| `colors` | `number`[][] | Array of RGB colors in normalized `[0–1]` or integer `[0–255]` format. |
| `opacity` | `number` | Opacity multiplier between 0 and 1. |

## Returns

  \| [`WebGLTexture`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLTexture)
  \| `null`

A [WebGLTexture](https://developer.mozilla.org/en-US/docs/Web/API/WebGLTexture) representing the color ramp, or `null` if creation failed.

## Example

```ts
const texture = createColorRampTexture(gl, [[1, 0, 0], [0, 0, 1]], 0.8);
```
