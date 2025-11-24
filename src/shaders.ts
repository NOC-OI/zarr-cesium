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

  uniform float u_noDataMin;
  uniform float u_noDataMax;

  uniform bool  u_useFillValue;
  uniform float u_fillValue;

  uniform float u_scaleFactor;
  uniform float u_addOffset;

  out vec4 fragColor;

  void main() {
      float raw = texture(u_dataTexture, vec2(v_texCoord.x, 1.0 - v_texCoord.y)).r;

      // Convert stored_value → real_value using CF conventions
      float value = raw * u_scaleFactor + u_addOffset;

      // Mask invalid values
      bool isNaN = (value != value);
      bool isNoData = (value < u_noDataMin || value > u_noDataMax);
      bool isFill = (u_useFillValue && abs(value - u_fillValue) < 1e-6);

      if (isNaN || isNoData || isFill) {
          discard;
      }

      // Normalize
      float normalized = clamp((value - u_min) / (u_max - u_min), 0.0, 1.0);

      fragColor = texture(u_colorRamp, vec2(normalized, 0.5));
  }
`;
