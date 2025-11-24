# Zarr-Cesium Visualization Toolkit

**High-performance CesiumJS providers for interactive 2D and 3D visualization of environmental and atmospheric data stored in Zarr**

- [Documentation](https://noc-oi.github.io/zarr-cesium/docs)
- [Demo](https://noc-oi.github.io/zarr-cesium/)

[![CI](https://github.com/noc-oi/zarr-cesium/actions/workflows/main.yml/badge.svg)](https://github.com/noc-oi/zarr-cesium/actions/workflows/main.yml)
![NPM Version](https://img.shields.io/npm/v/@noc-oi/zarr-cesium)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Overview

**Zarr-Cesium** Visualization Toolkit provides **CesiumJS data providers** for rendering scientific datasets stored in the [Zarr](https://zarr.dev) format — streamed directly from cloud object stores (HTTP/S3/GCS) without preprocessing or conversion and without a backend server.

### Features

- **Zarr v2 and v3 compatibility**
  Read datasets from any Zarr store, including public cloud object storage.

- **Multiscale or single-scale datasets**
  Automatically handles multi-resolution datasets (from `ndpyramid`) or standard Zarr cubes (without multiscale).

- **2D & 3D scientific visualization**
  Render gridded scalar, vector, and volumetric data directly in CesiumJS.

- **CRS-aware**
  Supports both EPSG:4326 (Geographic) and EPSG:3857 (Web Mercator) coordinate systems with automatic detection and transformation.

- **On-demand streaming**
  Tiles and slices are fetched and decoded dynamically — no conversion to imagery tiles required.

- **GPU-accelerated rendering**
  Uses WebGL and Cesium primitives for fast visualization of large datasets.

- **Style and animation controls**
  Programmatic control of color maps, opacity, scale range, slice spacing, and vertical exaggeration.

---

## Architecture

The toolkit provides **three Cesium provider classes**, each specialized for a different data type:

| Provider Class             | Purpose              | Description                                                                              |
| -------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `ZarrLayerProvider`        | 2D scalar fields     | Renders single-level variables as Cesium imagery layers (e.g. temperature, chlorophyll). |
| `ZarrCubeProvider`         | 3D volumetric fields | Renders volumetric cubes with horizontal and vertical slices (e.g. ocean temperature).   |
| `ZarrCubeVelocityProvider` | 3D vector fields     | Visualizes vector flow (u/v components) using animated particle advection.               |

---

## Installation

```bash
npm install zarr-cesium
# or
yarn add zarr-cesium
```

---

## Providers

### 1. `ZarrLayerProvider`

Renders **2D scalar fields** as Cesium imagery overlays using WebGL. It supports both single-scale and multiscale Zarr datasets, and has GPU-accelerated color mapping.

When using a **multiscale Zarr dataset** (such as one generated with `ndpyramid` in Python), the `ZarrLayerProvider` automatically determines which pyramid level to use based on the **Cesium zoom level**.

- At higher zoom levels, higher-resolution arrays are fetched.
- At lower zoom levels, coarser pyramid levels are used for faster loading and smaller memory footprint.
- If the dataset does **not** contain multiscale levels, the provider simply reads the single available Zarr array.

This allows seamless zoom-based resolution switching — similar to how image tile pyramids work —
but powered by **Zarr chunked arrays** instead of pre-rendered tiles.

**Example:**

```ts
import { ZarrLayerProvider, ZarrImageryLayer } from './ZarrLayerProvider';
import { Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');

const provider = new ZarrLayerProvider({
  url: 'https://example.com/data.zarr',
  variable: 'temperature',
  colormap: 'viridis',
  scale: [0, 40]
});

const layer = new ZarrImageryLayer(provider);
viewer.imageryLayers.add(layer);
```

---

### 2. `ZarrCubeProvider`

Renders **3D volumetric Zarr cubes** as Cesium primitives — including vertical and horizontal slices. It supports both Zarr v2/v3 and multiscale datasets, and also adjustable color mapping and vertical exaggeration.

**Example:**

```ts
import { ZarrCubeProvider } from './ZarrCubeProvider';
import { Viewer } from 'cesium';

const cube = new ZarrCubeProvider(viewer, {
  url: 'https://example.com/ocean_temp.zarr',
  variable: 'temperature',
  bounds: { west: -20, south: 30, east: 10, north: 60 },
  colormap: 'plasma',
  verticalExaggeration: 50
});

await cube.load();
cube.updateSlices({ latIndex: 10, lonIndex: 10, elevationIndex: 5 });
```

Unlike the 2D provider, **3D visualizations** don’t automatically switch resolution.
You can explicitly specify which **multiscale level** to load using the `multiscaleLevel` option.

This gives you full control over the performance vs. fidelity trade-off when rendering 3D volumetric cubes or velocity fields.

---

### 3. `ZarrCubeVelocityProvider`

Renders **3D velocity fields** from U/V components as animated **wind/current layers** using [`cesium-wind-layer`](https://github.com/hongfaqiu/cesium-wind-layer).

It supports both Zarr v2/v3 and multiscale datasets, with configurable slice spacing and particle animation parameters.

**Example:**

```ts
import { ZarrCubeVelocityProvider } from './ZarrCubeVelocityProvider';
import { Viewer } from 'cesium';

const velocity = new ZarrCubeVelocityProvider(viewer, {
  urls: {
    u: 'https://example.com/uo.zarr',
    v: 'https://example.com/vo.zarr'
  },
  variables: { u: 'uo', v: 'vo' },
  bounds: { west: -50, south: -20, east: 10, north: 20 },
  colormap: 'plasma',
  sliceSpacing: 2
});

await velocity.load();
```

Unlike the 2D provider, **3D visualizations** don’t automatically switch resolution.
You can explicitly specify which **multiscale level** to load using the `multiscaleLevel` option.

This gives you full control over the performance vs. fidelity trade-off when rendering 3D volumetric cubes or velocity fields.

---

## Supported Coordinate Systems

The toolkit supports and automatically detects the following spatial reference systems:

### EPSG:4326 — Geographic (Lat/Lon)

- Latitude and longitude in degrees
- Suitable for global datasets such as ERA5 or satellite data
- Uses Cesium’s `GeographicTilingScheme` for projection

### EPSG:3857 — Web Mercator

- Projected coordinates in meters
- Compatible with web mapping services (Google Maps, OpenStreetMap, etc.)
- Uses Cesium’s `WebMercatorTilingScheme` internally
- Coordinates are automatically transformed to/from geographic space

If a CRS is not explicitly provided, the toolkit attempts automatic detection from Zarr metadata attributes (e.g., `crs`, `spatial_ref`, or CF conventions).

---

## Dimension Selectors (Non-Spatial Dimensions)

All providers support **dimension selectors**, allowing you to select slices of non-spatial dimensions such as `time`, `level`, or `ensemble`.

You can use the `selectors` option to specify which index or value to select from these dimensions.

```ts
const provider = new ZarrLayerProvider({
  url: 'https://example.com/temperature.zarr',
  variable: 'temperature',
  selectors: {
    time: { selected: 0, type: 'index' }, // First timestep
    level: { selected: 10, type: 'index' } // 11th pressure level
  },
  colormap: 'viridis',
  scale: [0, 30]
});
```

Supported selector fields:

| Key        | Type                 | Description                                                                         |
| ---------- | -------------------- | ----------------------------------------------------------------------------------- |
| `selected` | `number \| string`   | The index or coordinate value to extract.                                           |
| `type`     | `'index' \| 'value'` | Whether to interpret `selected` as a numerical index or an actual coordinate value. |

These selectors apply when loading slices or generating tiles, letting you visualize **specific time steps, vertical levels, or ensemble members** within your Zarr dataset.

---

## Dependencies

- **CesiumJS** – 3D visualization engine
- **zarrita** – Zarr v3 client for JavaScript
- **cesium-wind-layer** – Particle-based vector field rendering
- **ndarray** – Efficient N-dimensional array operations

---

## Example Datasets

You can test using open datasets like:

- ERA5 wind components:
  `https://storage.googleapis.com/weatherbench2/datasets/era5/...`
- NEMO ocean data:
  `https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/...`

---

## 📸 Screenshots

![Map with a plot of salinity map for the date 2000–01–01T12:00:00. The data is related to the outputs of NEMO NPD](public/sos_abs.png)

> Visualizing a 10GB dataset in the browser using a dynamic backend tile server. As you can see, you can easily change the timestamp, colormap, and map scale.

![Video with a map with a plot of salinity map for the date 2000–01–01T12:00:00. The data is related to the outputs of NEMO NPD](public/carbonplan.gif)

> Example of visualizing a 10GB dataset in the browser using a carbonplan/maps adapted code. As you can see, you can easily change the timestamp, colormap, and map scale

![Animated video showing velocity data from a zarr file being rendered as particle animation canvas in a map.](public/currents.gif)

> Accessing Zarr data using `zarrita` and converting it into a canvas layer to represent the animated current fields on a map. You can interact with the dimensions of the data (time and depth).

![Interact with the data by creating time series and spatial charts.](public/charts.gif)

> Accessing Zarr data using `zarrita` for pixel-level inspection and creating time series and spatial charts.

## Acknowledgements

This tool is built with:

- [CesiumJS](https://cesium.com/)
- [Zarr](https://zarr.dev/)
- [cesium-wind-layer](https://github.com/marcofugaro/cesium-wind)

This work is part of the [Atlantis project](https://atlantis.ac.uk/), a UK initiative supporting long-term ocean observations and marine science in the Atlantic. This project is led by the [National Oceanography Centre (NOC)](https://noc.ac.uk/).
