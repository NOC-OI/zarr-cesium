import { ColorScaleProps } from './types';

export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function createColorRampTexture(
  gl: WebGL2RenderingContext,
  colors: number[][]
): WebGLTexture | null {
  const colorData = new Uint8Array(colors.length * 4);
  colors.forEach((rgbArray, i) => {
    colorData[i * 4] = rgbArray[0];
    colorData[i * 4 + 1] = rgbArray[1];
    colorData[i * 4 + 2] = rgbArray[2];
    colorData[i * 4 + 3] = 255;
  });

  const colorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, colorTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    colors.length,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    colorData
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return colorTexture;
}

export function updateImgData(
  value: number,
  pixelIdx: number,
  imgData: ImageData,
  colorScale: ColorScaleProps,
  opacity: number
): ImageData {
  if (isNaN(value) || value === null || value === undefined) {
    imgData.data[pixelIdx + 0] = 0;
    imgData.data[pixelIdx + 1] = 0;
    imgData.data[pixelIdx + 2] = 0;
    imgData.data[pixelIdx + 3] = 0;
  } else {
    const normalized = (value - colorScale.min) / (colorScale.max - colorScale.min);
    const [r, g, b, a] = addColor(normalized, colorScale, opacity);
    imgData.data[pixelIdx + 0] = Math.floor(r);
    imgData.data[pixelIdx + 1] = Math.floor(g);
    imgData.data[pixelIdx + 2] = Math.floor(b);
    imgData.data[pixelIdx + 3] = Math.floor(a * 255);
  }
  return imgData;
}

function addColor(
  value: number,
  colorScale: ColorScaleProps,
  opacity: number
): [number, number, number, number] {
  const clamped = Math.min(Math.max(value, 0), 1);

  const colors = colorScale.colors;
  const n = colors.length;

  if (n === 0) {
    return [1, 1, 1, opacity];
  }

  const scaled = clamped * (n - 1);
  const idx = Math.floor(scaled);
  const t = scaled - idx;

  const [r1, g1, b1] = colors[idx];
  const [r2, g2, b2] = colors[Math.min(idx + 1, n - 1)];

  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  return [r, g, b, opacity];
}
