---
sidebar_position: 4
title: ZarrCubeProvider
---

# ZarrCubeProvider

The **ZarrCubeProvider** renders **3D volumetric (cube) Zarr datasets** as Cesium primitives.
It allows you to explore scalar volumes (e.g., temperature, salinity, density, chlorophyll, etc.) by slicing:

- **Horizontal slices** (constant elevation)
- **Vertical longitude slices**
- **Vertical latitude slices**

Each slice is rendered using a **GPU-accelerated colormap shader** and draped as a Cesium `Primitive` at the correct geographic position and height.

This provider supports:

- Multiscale Zarr pyramids
- CRS detection (EPSG:4326 / EPSG:3857)
- Dynamic dimension slicing
- Vertical exaggeration
- Below-sea-level rendering
- Interactive styling (opacity, scale, colormap)
- High-resolution GPU-based rendering of 2D slices from 3D arrays

Use this provider when you need to visualize **3D fields** rather than 2D rasters.

## When to Use ZarrCubeProvider

Use **ZarrCubeProvider** when your dataset:

- Contains **three spatial dimensions** (lon × lat × elevation)
- Represents a **scalar volume**
- Needs **slice-based visualisation**
- Is stored as **Zarr (v2 or v3)**
- Possibly includes **multiscale levels**

Typical use cases:

- Oceanography (temperature, salinity, density cubes)
- Atmospheric models
- Scientific 3D rasters
- Volumetric scalar fields

If your dataset is:

- **2D raster** → Use `ZarrLayerProvider`
- **3D + time** → Use `ZarrCubeProvider` and drive time externally
- **3D vector fields** → Use `ZarrCubeVelocityProvider`

---

## Basic Example

```ts
import { Viewer } from 'cesium';
import { ZarrCubeProvider } from '@noc-oi/zarr-cesium';

const viewer = new Viewer('cesiumContainer');

const options = {
  url: 'https://example.com/cube.zarr',
  variable: 'temperature',
  bounds: { west: -30, south: 20, east: 20, north: 60 },
  showHorizontalSlices: true,
  showVerticalSlices: true,
  colormap: 'viridis',
  scale: [0, 25]
};

const cube = new ZarrCubeProvider(viewer, options);

await cube.load();

// Move slices interactively
cube.updateSlices({
  latIndex: 20,
  lonIndex: 15,
  elevationIndex: 5
});
```

---

## Options

```ts
interface CubeOptions {
  url: string; // Public Zarr store
  variable: string; // Zarr array name
  bounds: BoundsProps; // geographic rectangle
  selectors?: { [key: string]: ZarrSelectorsProps }; // Initial dimension slices
  dimensionNames?: DimensionNamesProps; // Custom dimension names. If not provided, defaults will be used or identified automatically based on CF conventions.
  multiscaleLevel?: number; // If the dataset is multiscale, which level to load. Default is the lowest resolution (0)
  zarrVersion?: 2 | 3; // Zarr version (auto-detected if not set)
  colormap?: ColorMapName; // Name from jsColormaps, based on matplotlib colormaps
  scale?: [number, number]; // Min/max for color scaling
  opacity?: number; // Slice opacity (0–1)
  verticalExaggeration?: number; // Vertical exaggeration factor
  showHorizontalSlices?: boolean; // Show horizontal (XY) slice
  showVerticalSlices?: boolean; // Show vertical (XZ and YZ) slices
  belowSeaLevel?: boolean; // If true, allows rendering below sea level
  flipElevation?: boolean; // If true, flips the elevation axis
  crs?: CRS; // Force CRS (auto-detected if not set)
}
```

---

## Loading a Volume

```ts
await cube.load();
```

This step performs:

1. Load Zarr metadata
2. Detect CRS (unless user-set)
3. Determine cube dimension order
4. Load coordinate arrays (lat/lon/height)
5. Apply dimension selectors
6. Apply bounds windowing
7. Read the 3D data slice into an in-memory `ndarray`
8. Initialize default slice positions (first index of each dimension)

Once loaded, the cube can render immediately.

---

## Slice Types

### Horizontal Slice (XY plane at constant elevation)

Rendered as a textured Cesium `RectangleGeometry`:

- Full resolution nx × ny
- Positioned at correct height above ellipsoid
- Height computed from elevation coordinate values

```ts
// Cube options
showHorizontalSlices: true;
```

---

### Vertical Longitude (XZ plane) and Latitude (YZ plane) Slices

A vertical wall following a **constant latitude** or **constant longitude**.

- Height varies across elevation dimension
- Surface extrudes between bottom and top

```ts
// Cube options
showVerticalSlices: true;
```

---

## Runtime API

### Update Slices

Move the slices along each dimension:

```ts
cube.updateSlices({
  latIndex: 12,
  lonIndex: 8,
  elevationIndex: 5
});
```

All parameters are optional:

```ts
cube.updateSlices({ elevationIndex: 20 });
```

Internally this updates:

- Horizontal z-slice
- Vertical lon slice
- Vertical lat slice
- Height model
- GPU textures for each slice

The number represents the **index** along that dimension. To get the current index values, use:

```ts
const latIndex = cube.latSliceIndex;
const lonIndex = cube.lonSliceIndex;
const elevationIndex = cube.elevationSliceIndex;
```

To get the total number of indices along each dimension, use:

```ts
const cubeDimensions = cube.cubeDimensions; // [nx, ny, nz]
```

And with that, you can build UI controls (sliders, dropdowns) to update the slices dynamically.

---

### Update Selectors / Bounds / Multiscale Level

Switch dimension values or switch to a different resolution:

```ts
cube.updateSelectors({
  selectors: {
    time: { type: 'index', selected: 3 }
  },
  multiscaleLevel: 1,
  bounds: { west: -40, south: 20, east: 10, north: 65 }
});
```

This triggers a full reload of the cube.

All the parameters are optional. If not provided, the current value is retained.

To get the current selectors, multiscale level, all multiscale levels, and dimensions values, use:

```ts
const selectors = cube.selectors;
const multiscaleLevel = cube.multiscaleLevel;
const allMultiscaleLevels = cube.levelInfos;
const dimNames = cube.dimensionValues;
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

### Update Style

Change color scale, vertical exaggeration, opacity, etc.

```ts
cube.updateStyle({
  verticalExaggeration: 8,
  opacity: 0.85,
  scale: [5, 15], // data min/max
  colormap: 'inferno'
});
```

The provider automatically re-renders all slice primitives, but without reloading data.

---

### Multiscale Support

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

---

### Supported CRS

Zarr datasets may store coordinate values in:

- `EPSG:4326` (lat, lon degrees)
- `EPSG:3857` (Web Mercator meters)

The provider detects the CRS automatically using:

- Zarr metadata
- consolidated metadata
- coordinate ranges (West/East > 360 → Web Mercator)

---

### Clearing & Destroying

Remove all slice primitives:

```ts
cube.clear();
```

Destroy and free resources:

```ts
cube.destroy();
```

---

## Performance Features

- GPU-accelerated pixel shading
- Concurrency throttling (4 parallel Zarr reads)
- Windowed 3D slicing based on bounds
- Efficient `ndarray` stride-based lookup
- Reuse of Cesium textures
- Only changed slices rerender

---

# Summary

| Feature                   | Supported |
| ------------------------- | --------- |
| 3D Zarr volume            | ✔️        |
| Zarr v2 and v3            | ✔️        |
| Horizontal slices         | ✔️        |
| Vertical latitude slices  | ✔️        |
| Vertical longitude slices | ✔️        |
| Multiscale pyramids       | ✔️        |
| Dynamic dimension slicing | ✔️        |
| GPU colormap rendering    | ✔️        |
| Vertical exaggeration     | ✔️        |
| Below-sea-level display   | ✔️        |

---

## Next Steps

- **[ZarrLayerProvider](./zarr-layer-provider.md)** – 2D raster rendering
- **[ZarrCubeVelocityProvider](./zarr-cube-velocity-provider.md)** – 3D vector fields
- **[Data Preparation](../data.md)** – Preparing Zarr datasets for browser visualization
