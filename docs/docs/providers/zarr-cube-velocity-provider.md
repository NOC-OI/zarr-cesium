---
sidebar_position: 5
title: ZarrCubeVelocityProvider
---

# ZarrCubeVelocityProvider

The **ZarrCubeVelocityProvider** loads and visualizes **3D vector fields** (U, V components) from Zarr datasets as animated particle layers in Cesium using the `WindLayer` from [`cesium-wind-layer`](https://github.com/hongfaqiu/cesium-wind-layer)

This provider enables real-time visualization of:

- **Ocean currents**
- **Atmospheric wind fields**
- **Depth/height-sliced velocity maps**
- **Animated flow patterns through depth**

It supports:

- Zarr v2 and v3
- Multiscale pyramids
- GPU-accelerated particle animations
- Dynamic elevation slicing
- Vertical exaggeration
- Colormap-based speed visualization
- Flexible WindLayer configuration

## When to Use ZarrCubeVelocityProvider

Use this provider when you have:

- **Vector fields** stored in Zarr
- **3D volumes** representing velocity over depth or height
- Two variables: **u** (zonal) and **v** (meridional)
- Desire to visualize with animated particles

Typical datasets:

- Ocean model outputs (NEMO, ROMS, HYCOM)
- Atmospheric reanalysis winds
- Climate simulation velocity cubes
- Any Zarr-based U/V dataset

If you want:

- 2D rendering → use [**ZarrLayerProvider**](./zarr-layer-provider.md)
- 3D rendering → use [**ZarrCubeProvider**](./zarr-cube-provider.md)
- 3D vector fields + time → use [**ZarrCubeVelocityProvider**](./zarr-cube-velocity-provider.md) and drive time externally

---

## Basic Example

```ts
import { Viewer } from 'cesium';
import { ZarrCubeVelocityProvider } from 'zarr-cesium';

const viewer = new Viewer('cesiumContainer');

const options = {
  urls: {
    u: 'https://example.com/uo.zarr',
    v: 'https://example.com/vo.zarr'
  },
  variables: { u: 'uo', v: 'vo' },
  bounds: { west: -10, south: 30, east: 10, north: 45 }
};
const windCube = new ZarrCubeVelocityProvider(viewer, options);

await windCube.load();
```

This creates a **stack of animated particle layers**, one per elevation slice.

---

## Options

```ts
interface VelocityOptions {
  urls: { u: string; v: string }; // Public Zarr stores for U and V components
  variables: { u: string; v: string }; // Zarr array names for U and V
  bounds: BoundsProps; // geographic rectangle
  dimensionNames?: DimensionNamesProps; // Custom dimension names. If not provided, defaults will be used or identified automatically based on CF conventions.
  selectors?: Record<string, ZarrSelectorsProps>; // Initial dimension slices
  multiscaleLevel?: number; // If the dataset is multiscale, which level to load. Default is the lowest resolution (0)
  zarrVersion?: 2 | 3; // Zarr version (auto-detected if not set)
  sliceSpacing?: number; // Vertical sampling interval
  verticalExaggeration?: number; // Vertical exaggeration factor
  belowSeaLevel?: boolean; // Whether to render layers below sea level
  flipElevation?: boolean; // Flip elevation axis
  opacity?: number; // Layer opacity (0–1)
  colormap?: ColorMapName; // Name from jsColormaps, based on matplotlib colormaps
  scale?: [number, number]; // Min/max for color scaling
  windOptions?: Partial<WindLayerOptions>; // Additional WindLayer configuration
  crs?: CRS; // Force CRS (auto-detected if not set)
}
```

---

## Loading Data

```ts
await windCube.load();
```

This loads:

- `u` velocity cube
- `v` velocity cube
- Multiscale metadata
- Dimension values (lon, lat, elevation)
- Windowed spatial slice (based on bounds)
- Elevation slice ranges and spacing

Then it automatically creates Cesium `WindLayer` instances (one per elevation slice) and adds them to the viewer.

---

## How It Renders the Data

The provider generates **one WindLayer per elevation slice**, spaced by `sliceSpacing`:

- `sliceSpacing = 1` → one layer per model level
- `sliceSpacing = 2` → one layer every two levels
- `sliceSpacing = n` → coarse vertical sampling

Each level has:

- a 2D U-field
- a 2D V-field
- a computed **altitude**
- a WindLayer placed at the correct height

Particles animate based on u/v speed and direction.

### WindLayer Integration

Each layer receives a `windData` structure:

```ts
{
  u: { array: Float32Array, min: -0.5, max: 0.5 },
  v: { array: Float32Array, min: -0.5, max: 0.5 },
  width,
  height,
  unit: 'm s-1',
  bounds: this.bounds
}
```

Plus user-configurable **particle system settings**:

```ts
{
  speedFactor,
  lineWidth,
  lineLength,
  particlesTextureSize,
  flipY
  ...
}
```

---

## Supported CRS

Zarr datasets may store coordinate values in:

- `EPSG:4326` (lat, lon degrees)
- `EPSG:3857` (Web Mercator meters)

The provider detects the CRS automatically using:

- Zarr metadata
- consolidated metadata
- coordinate ranges (West/East > 360 → Web Mercator)

For example, you can set the CRS explicitly:

```ts
// set CRS to Web Mercator in LayerOptions
crs: 'EPSG:3857';
```

---

## Multiscale Support

If the dataset defines Zarr multiscale pyramids, e.g.:

```json
"multiscales": [
  { "datasets": [ {"path": "0"}, {"path": "1"}, {"path": "2"} ] }
]
```

Then:

- The provider loads the requested `multiscaleLevel`
- Resolution, W×H×Z, and bounding box adapt
- Switching levels triggers a reload

For example, you can set the desired level (default is `0`, the lowest resolution):

```ts
// set multiscale level in CubeOptions
multiscaleLevel: 1; // loads level "1"
```

---

## Runtime API

### Update Dimension Selectors

```ts
await windCube.updateSelectors({
  selectors: { time: { type: 'index', selected: 5 } },
  multiscaleLevel: 1,
  bounds: { west: -20, south: 25, east: 20, north: 60 }
});
```

This **reloads U and V cubes**, destroys old wind layers, and creates new ones.

All the parameters are optional. If not provided, the current value is retained.

To get the current selectors, multiscale level, all multiscale levels, and dimensions values, use:

```ts
const selectors = windCube.selectors;
const multiscaleLevel = windCube.multiscaleLevel;
const allMultiscaleLevels = windCube.levelInfos;
const dimNames = windCube.dimensionValues;
```

This returns a mapping of dimension names to their list of values, e.g.:

```ts
dimNames = {
  time: ['2020-01-01T00:00Z', '2020-01-02T00:00Z', ...],
  elevation: [0, 10, 20, 30, ...]
}
```

And the current selector values, e.g.:

```ts
selectors = {
  time: { type: 'index', selected: 3 },
  depth: { type: 'index', selected: [0, 50] }
};
```

And the multiscale level information:

```ts
levelInfos = ["0", "1", "2", ...];
multiscaleLevel = 1; // index of current level. In this case, that level would be "1"
```

And with that, you can build UI controls (sliders, dropdowns) to update the layer dynamically.

---

### Update Slice Rendering

Control vertical sampling or exaggeration:

```ts
await windCube.updateSlices({
  sliceSpacing: 2,
  verticalExaggeration: 8,
  belowSeaLevel: true
});
```

This:

- Removes all current WindLayers
- Recomputes heights
- Rebuilds wind layers with new parameters

All the parameters are optional. If not provided, the current value is retained.

---

### Update Style

Adjust how particles are visualized:

```ts
windCube.updateStyle({
  opacity: 0.4,
  scale: [-1, 1],
  colormap: 'plasma',
  windOptions: {
    particleDensity: 5,
    particleScale: 2.0,
    maxParticles: 20000
  }
});
```

This applies instantly to all existing layers.

The full list of supported colormaps is available in the [Colormaps section](../api/type-aliases/ColorMapName.md).

The `windOptions` allows fine-tuning of particle system parameters. For more info, see the [`WindLayerOptions` information on cesium-wind-layer github repo](https://github.com/hongfaqiu/cesium-wind-layer)

---

### Remove Layers, Clearing & Destroying

Remove all velocity layers:

```ts
windCube.destroy();
```

Used internally when:

- Bounds change
- Multiscale level changes
- Slice spacing changes
- Elevation selectors change
- Vertical exaggeration changes

---

# Summary

| Feature                      | Supported |
| ---------------------------- | --------- |
| 3D U/V cube rendering        | ✔️        |
| Zarr v2 and v3               | ✔️        |
| Animated WindLayer particles | ✔️        |
| Multiscale pyramids          | ✔️        |
| Vertical slicing             | ✔️        |
| Time dimension               | ✔️        |
| Colormap styling             | ✔️        |
| Vertical exaggeration        | ✔️        |
| Below sea level              | ✔️        |
| Dynamic bounds               | ✔️        |

---

# Next Steps

- **[ZarrLayerProvider](./zarr-layer-provider.md)** – 2D rasters
- **[ZarrCubeProvider](./zarr-cube-provider.md)** – 3D scalar fields
- **[Data Preparation](../data.md)** – preparing Zarr stores for GPU rendering

```

```
