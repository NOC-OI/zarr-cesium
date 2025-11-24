# createProgram()

```ts
function createProgram(
   gl, 
   vertexShader, 
   fragmentShader): 
  | WebGLProgram
  | null;
```

Creates and links a WebGL program using the specified vertex and fragment shaders.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gl` | `WebGL2RenderingContext` | The WebGL2 rendering context. |
| `vertexShader` | [`WebGLShader`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader) | Compiled vertex shader. |
| `fragmentShader` | [`WebGLShader`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader) | Compiled fragment shader. |

## Returns

  \| [`WebGLProgram`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram)
  \| `null`

The linked [WebGLProgram](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram), or `null` if linking failed.

## Example

```ts
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);
```
