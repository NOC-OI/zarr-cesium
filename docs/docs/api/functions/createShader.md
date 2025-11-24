# createShader()

```ts
function createShader(
   gl, 
   type, 
   source): 
  | WebGLShader
  | null;
```

Creates and compiles a WebGL shader from source code.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gl` | `WebGL2RenderingContext` | The WebGL2 rendering context. |
| `type` | `number` | Shader type (`gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`). |
| `source` | `string` | GLSL source code for the shader. |

## Returns

  \| [`WebGLShader`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader)
  \| `null`

The compiled [WebGLShader](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader) instance, or `null` if compilation failed.

## Example

```ts
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
```
