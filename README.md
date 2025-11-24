# Zarr-Cesium Visualization Toolkit

![NPM Version](https://img.shields.io/npm/v/zarr-cesium)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://noc-oi.github.io/zarr-cesium/docs)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)

**High-performance CesiumJS providers for interactive 2D and 3D visualization of environmental and atmospheric data stored in Zarr.**

- Documentation: [https://noc-oi.github.io/zarr-cesium/docs](https://noc-oi.github.io/zarr-cesium/docs)
- Demo: [https://noc-oi.github.io/zarr-cesium/](https://noc-oi.github.io/zarr-cesium/)

---

## Overview

The **Zarr-Cesium Visualization Toolkit** provides **CesiumJS data providers** for rendering n-dimensional datasets stored in the [Zarr](https://zarr.dev) format — streamed directly from cloud object stores (HTTP/S3/GCS) without preprocessing, conversion, or a backend server.

### Features

- **Zarr v2 and v3 compatibility**
  Read datasets from any Zarr store, including public cloud object storage.

- **Multiscale or single-scale datasets**
  Automatically handles multi-resolution datasets (from [ndpyramid](https://github.com/carbonplan/ndpyramid)) or standard Zarr datasets.

- **2D & 3D visualization**
  Render gridded scalar, vector, and volumetric data directly in CesiumJS.

- **CRS-aware**
  Supports EPSG:4326 (Geographic) and EPSG:3857 (Web Mercator) coordinate systems with automatic detection and transformation.

- **On-demand streaming**
  Tiles and slices are fetched and decoded dynamically — no conversion to imagery tiles required.

- **GPU-accelerated rendering**
  Uses WebGL and Cesium primitives for fast visualization of large datasets.

- **Style and animation controls**
  Programmatic control of color maps, opacity, scale range, slice spacing, and vertical exaggeration.

---

## Architecture

The toolkit provides **three Cesium provider classes**, each specialized for a different data type:

| Provider Class             | Purpose              | Description                                                                               |
| -------------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `ZarrLayerProvider`        | 2D scalar fields     | Renders single-level variables as Cesium imagery layers (e.g., temperature, chlorophyll). |
| `ZarrCubeProvider`         | 3D volumetric fields | Renders volumetric cubes with horizontal and vertical slices (e.g., ocean temperature).   |
| `ZarrCubeVelocityProvider` | 3D vector fields     | Visualizes vector flow (u/v components) using animated particle advection.                |

---

## Installation

```bash
npm install zarr-cesium
# or
yarn add zarr-cesium
```

## Run the demo website locally

To run the demo website locally, clone the repository:

```bash
git clone https://github.com/noc-oi/zarr-cesium.git
cd zarr-cesium/demo
```

Create a `.env` file in the `demo` directory with your Cesium access token:

```env
NEXT_PUBLIC_CESIUM_TOKEN=your_cesium_access_token_here
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The demo site will be available at `http://localhost:3000`.

If you want to use your own Zarr datasets, you can modify the demo code in `demo/pages/index.tsx` to point to your data URLs. You may need to adjust variable names, bounds, and other parameters accordingly.

---

## Providers

### 1. `ZarrLayerProvider`

Renders **2D scalar fields** as Cesium imagery overlays using WebGL. It supports both single-scale and multiscale Zarr datasets, and provides GPU-accelerated color mapping.

**Example:**

```ts
import { ZarrLayerProvider } from 'zarr-cesium';
import { Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');

const options = {
  url: 'https://example.com/data.zarr',
  variable: 'salinity',
  colormap: 'viridis',
  scale: [30, 40]
};
const layer = await ZarrLayerProvider.createLayer(viewer, options);

viewer.imageryLayers.add(layer);
```

For more details, see the [Zarr-Cesium documentation](https://noc-oi.github.io/zarr-cesium/docs/).

https://github.com/user-attachments/assets/8b066725-c6c7-4b7a-9fc0-d632b623937c

> Example of visualizing a Zarr dataset in a CesiumJS map using Zarr-Cesium. You can easily change the timestamp, colormap, and scale.

---

### 2. `ZarrCubeProvider`

Renders **3D volumetric Zarr cubes** as Cesium primitives — including vertical and horizontal slices. It supports both Zarr v2/v3 and multiscale datasets, with adjustable color mapping and vertical exaggeration.

**Example:**

```ts
import { ZarrCubeProvider } from 'zarr-cesium';
import { Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');

const cube = new ZarrCubeProvider(viewer, {
  url: 'https://example.com/ocean_temp.zarr',
  variable: 'temperature',
  bounds: { west: -20, south: 30, east: 10, north: 60 },
  colormap: 'plasma',
  verticalExaggeration: 50
});

await cube.load();
```

For more details, see the [Zarr-Cesium documentation](https://noc-oi.github.io/zarr-cesium/docs/).

https://github.com/user-attachments/assets/8b066725-c6c7-4b7a-9fc0-d632b623937c

> Example of visualizing a 4D Zarr dataset in a CesiumJS map as a 3D cube using Zarr-Cesium. You can easily change slices and view the cube in different ways, styles, and scales.

---

### 3. `ZarrCubeVelocityProvider`

Renders **3D velocity fields** from U/V components as animated **wind/current layers** using [`cesium-wind-layer`](https://github.com/hongfaqiu/cesium-wind-layer).

It supports both Zarr v2/v3 and multiscale datasets, with configurable slice spacing and particle animation parameters.

**Example:**

```ts
import { ZarrCubeVelocityProvider } from 'zarr-cesium';
import { Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');

const velocity = new ZarrCubeVelocityProvider(viewer, {
  urls: {
    u: 'https://example.com/uo.zarr',
    v: 'https://example.com/vo.zarr'
  },
  variables: { u: 'uo', v: 'vo' },
  bounds: { west: -50, south: -20, east: 10, north: 20 },
  colormap: 'plasma'
});

await velocity.load();
```

For more details, see the [Zarr-Cesium documentation](https://noc-oi.github.io/zarr-cesium/docs/).

https://github.com/user-attachments/assets/a54ddd70-9b00-4a3e-9cb9-41025cceffd0

> Example of visualizing wind-speed vector data from Zarr in a CesiumJS map using Zarr-Cesium. This dataset is from Hurricane Florence, which occurred in 2018. You can easily change the timestamp, colormap, and particle speed.

---

## DEVELOPMENT

For more details on how to contribute to the development of this toolkit, please refer to the [DEV-README.md](DEV-README.md) file.

## Acknowledgements

This tool is built with:

- [CesiumJS](https://cesium.com/)
- [Zarrita](https://zarrita.dev/)
- [cesium-wind-layer](https://github.com/hongfaqiu/cesium-wind-layer)
- [jscolormaps](https://github.com/timothygebhard/js-colormaps)

This work is part of the [Atlantis project](https://atlantis.ac.uk/), a UK initiative supporting long-term ocean observations and marine science in the Atlantic. The project is led by the [National Oceanography Centre (NOC)](https://noc.ac.uk/).
