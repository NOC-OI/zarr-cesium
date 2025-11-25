# vertexShaderSource

```ts
const vertexShaderSource: "#version 300 es\n  in vec2 a_position;\n  in vec2 a_texCoord;\n  out vec2 v_texCoord;\n\n  void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n  }\n";
```
