
export const  cubeVertexShaderSource = `
in vec2 st;
in float a_height;

uniform float u_orientation;
uniform vec4 u_bounds;
uniform vec3 u_slice;
uniform float u_horizontalHeight;
uniform float u_latAscending;
uniform float u_flipElevation;
uniform float u_projectedCrs;
uniform vec4 u_crossSection;

out vec3 v_volumePosition;

vec3 lonLatHeightToEcef(vec3 value) {
  const float semiMajor = 6378137.0;
  const float eccentricitySquared = 6.69437999014e-3;
  float longitude = radians(value.x);
  float latitude = radians(value.y);
  float sinLatitude = sin(latitude);
  float normal = semiMajor / sqrt(1.0 - eccentricitySquared * sinLatitude * sinLatitude);
  float cosLatitude = cos(latitude);
  return vec3(
    (normal + value.z) * cosLatitude * cos(longitude),
    (normal + value.z) * cosLatitude * sin(longitude),
    ((1.0 - eccentricitySquared) * normal + value.z) * sinLatitude
  );
}

vec3 lonLatHeightToProjected(vec3 value) {
  const float radius = 6378137.0;
  float longitude = mod(value.x + 180.0, 360.0) - 180.0;
  return vec3(value.z, radians(longitude) * radius, radians(clamp(value.y, -89.999, 89.999)) * radius);
}

float unwrapLongitude(float longitude, float reference) {
  float delta = longitude - reference;
  if (delta > 180.0) longitude -= 360.0;
  if (delta < -180.0) longitude += 360.0;
  return longitude;
}

vec3 lonLatToUnit(vec2 lonLat) {
  float longitude = radians(lonLat.x);
  float latitude = radians(lonLat.y);
  float cosLatitude = cos(latitude);
  return normalize(vec3(
    cosLatitude * cos(longitude),
    cosLatitude * sin(longitude),
    sin(latitude)
  ));
}

vec2 unitToLonLat(vec3 value) {
  value = normalize(value);
  return vec2(degrees(atan(value.y, value.x)), degrees(asin(clamp(value.z, -1.0, 1.0))));
}

vec2 interpolateCrossSection(vec2 start, vec2 end, float fraction) {
  vec3 a = lonLatToUnit(start);
  vec3 b = lonLatToUnit(end);
  float angle = acos(clamp(dot(a, b), -1.0, 1.0));
  if (angle < 1e-6) return mix(start, end, fraction);
  float denominator = sin(angle);
  return unitToLonLat(
    sin((1.0 - fraction) * angle) / denominator * a +
    sin(fraction * angle) / denominator * b
  );
}

float mercatorY(float latitude) {
  float clampedLatitude = clamp(latitude, -85.05112878, 85.05112878);
  return log(tan(0.7853981633974483 + radians(clampedLatitude) * 0.5));
}

void main() {
  float longitude;
  float latitude;
  float height;

  if (u_orientation < 0.5) {
    longitude = mix(u_bounds.x, u_bounds.z, st.x);
    latitude = mix(u_bounds.y, u_bounds.w, st.y);
    height = u_horizontalHeight;
    float dataLatitude = u_latAscending > 0.5 ? st.y : 1.0 - st.y;
    v_volumePosition = vec3(st.x, dataLatitude, u_slice.z);
  } else if (u_orientation < 1.5) {
    longitude = mix(u_bounds.x, u_bounds.z, st.x);
    latitude = u_latAscending > 0.5
      ? mix(u_bounds.y, u_bounds.w, u_slice.x)
      : mix(u_bounds.w, u_bounds.y, u_slice.x);
    height = a_height;
    float dataElevation = u_flipElevation > 0.5 ? 1.0 - st.y : st.y;
    v_volumePosition = vec3(st.x, u_slice.x, dataElevation);
  } else if (u_orientation < 2.5) {
    longitude = mix(u_bounds.x, u_bounds.z, u_slice.y);
    latitude = mix(u_bounds.y, u_bounds.w, st.x);
    height = a_height;
    float dataLatitude = u_latAscending > 0.5 ? st.x : 1.0 - st.x;
    float dataElevation = u_flipElevation > 0.5 ? 1.0 - st.y : st.y;
    v_volumePosition = vec3(u_slice.y, dataLatitude, dataElevation);
  } else {
    vec2 start = u_crossSection.xy;
    vec2 end = u_crossSection.zw;
    vec2 lonLat = interpolateCrossSection(start, end, st.x);
    longitude = unwrapLongitude(lonLat.x, start.x);
    latitude = lonLat.y;
    height = a_height;

    float east = unwrapLongitude(u_bounds.z, u_bounds.x);
    float sampleLongitude = unwrapLongitude(longitude, u_bounds.x);
    float dataLongitude = (sampleLongitude - u_bounds.x) / (east - u_bounds.x);
    float geographicLatitude;
    if (u_projectedCrs > 0.5) {
      float southY = mercatorY(u_bounds.y);
      float northY = mercatorY(u_bounds.w);
      geographicLatitude = (mercatorY(latitude) - southY) / (northY - southY);
    } else {
      geographicLatitude = (latitude - u_bounds.y) / (u_bounds.w - u_bounds.y);
    }
    float dataLatitude = u_latAscending > 0.5
      ? geographicLatitude
      : 1.0 - geographicLatitude;
    float dataElevation = u_flipElevation > 0.5 ? 1.0 - st.y : st.y;
    v_volumePosition = vec3(dataLongitude, dataLatitude, dataElevation);
  }

  vec3 lonLatHeight = vec3(longitude, latitude, height);
  vec3 position = czm_sceneMode == czm_sceneMode3D
    ? lonLatHeightToEcef(lonLatHeight)
    : lonLatHeightToProjected(lonLatHeight);
  gl_Position = czm_viewProjection * vec4(position, 1.0);
}
`;

export const cubeFragmentShaderSource = `
uniform sampler2D u_volume;
uniform sampler2D u_colormap;
uniform vec3 u_dimensions;
uniform vec2 u_colorRange;
uniform vec2 u_transform;
uniform float u_opacity;
uniform float u_useFill;
uniform float u_fillValue;
uniform float u_hasNoDataMin;
uniform float u_noDataMin;
uniform float u_hasNoDataMax;
uniform float u_noDataMax;

in vec3 v_volumePosition;

vec2 atlasValue(float level, vec2 position) {
  vec2 grid = max(u_dimensions.xy - vec2(1.0), vec2(1.0));
  vec2 cell = position * grid;
  vec2 lower = floor(cell);
  vec2 fraction = cell - lower;
  vec2 upper = min(lower + vec2(1.0), grid);
  float atlasHeight = u_dimensions.y * u_dimensions.z;
  float row = level * u_dimensions.y;

  vec2 uv00 = vec2((lower.x + 0.5) / u_dimensions.x, (row + lower.y + 0.5) / atlasHeight);
  vec2 uv10 = vec2((upper.x + 0.5) / u_dimensions.x, (row + lower.y + 0.5) / atlasHeight);
  vec2 uv01 = vec2((lower.x + 0.5) / u_dimensions.x, (row + upper.y + 0.5) / atlasHeight);
  vec2 uv11 = vec2((upper.x + 0.5) / u_dimensions.x, (row + upper.y + 0.5) / atlasHeight);
  vec2 bottom = mix(texture(u_volume, uv00).ra, texture(u_volume, uv10).ra, fraction.x);
  vec2 top = mix(texture(u_volume, uv01).ra, texture(u_volume, uv11).ra, fraction.x);
  return mix(bottom, top, fraction.y);
}

void main() {
  float levelPosition = clamp(v_volumePosition.z, 0.0, 1.0) * max(u_dimensions.z - 1.0, 0.0);
  float lowerLevel = floor(levelPosition);
  float upperLevel = min(lowerLevel + 1.0, u_dimensions.z - 1.0);
  vec2 sampleValue = mix(
    atlasValue(lowerLevel, clamp(v_volumePosition.xy, 0.0, 1.0)),
    atlasValue(upperLevel, clamp(v_volumePosition.xy, 0.0, 1.0)),
    levelPosition - lowerLevel
  );
  if (sampleValue.y < 0.999) {
    discard;
  }
  float raw = sampleValue.x;
  float value = raw * u_transform.x + u_transform.y;
  if (raw != raw || value != value ||
      (u_useFill > 0.5 && raw == u_fillValue) ||
      (u_hasNoDataMin > 0.5 && value < u_noDataMin) ||
      (u_hasNoDataMax > 0.5 && value > u_noDataMax)) {
    discard;
  }
  float range = u_colorRange.y - u_colorRange.x;
  float normalized = range == 0.0 ? 0.5 : clamp((value - u_colorRange.x) / range, 0.0, 1.0);
  vec4 color = texture(u_colormap, vec2(normalized, 0.5));
  out_FragColor = vec4(color.rgb, color.a * u_opacity);
}
`;
