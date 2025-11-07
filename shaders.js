
// Vertex shader
export const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  in vec2 a_texCoord;
  out vec2 v_texCoord;

  void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
  }
`;

// Fragment shader
export const fragmentShaderSource = `#version 300 es
  precision highp float;

  in vec2 v_texCoord;
  uniform sampler2D u_dataTexture;
  uniform sampler2D u_colorRamp;
  uniform float u_min;
  uniform float u_max;

  out vec4 fragColor;

  void main() {
    // float value = texture(u_dataTexture, v_texCoord).r;
    float value = texture(u_dataTexture, vec2(v_texCoord.x, 1.0 - v_texCoord.y)).r;

    if (value != value || value < -9998.0 || value > 9998.0) {
        discard;
    }

    float normalized = clamp((value - u_min) / (u_max - u_min), 0.0, 1.0);
    fragColor = texture(u_colorRamp, vec2(normalized, 0.5));
  }
`;
