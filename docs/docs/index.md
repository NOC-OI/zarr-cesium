---
sidebar_position: 1
title: Introduction
---

# Zarr-Cesium

**High-performance CesiumJS providers for interactive 2D and 3D visualization of environmental and atmospheric data stored in Zarr.**

- **Demo:** https://noc-oi.github.io/zarr-cesium/

Zarr-Cesium enables **direct, client-side visualization of scientific datasets** stored in the [Zarr](https://zarr.dev) format. No preprocessing. No tile servers. No backend.

It provides a set of **CesiumJS data providers** that stream and render multidimensional geospatial datasets directly from HTTP/S3/GCS object storage.

## Why Zarr-Cesium?

Traditional NetCDF/GeoTIFF-based visualization pipelines require:

- preprocessing,
- tile generation,
- custom server infrastructure.

**Zarr-Cesium removes all of that**, streaming chunked scientific arrays directly into WebGL shaders for real-time exploration.

## Screenshots

<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <video
    src="https://github.com/NOC-OI/zarr-cesium/releases/download/0.1.0/official_zarrcesium.mp4"
    loop
    controls
    muted
    style={{ width: "100%", borderRadius: "8px" }}
  />
</div>
<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <video
    src="https://github.com/NOC-OI/zarr-cesium/releases/download/0.1.0/layer_provider.mp4"
    loop
    controls
    muted
    style={{ width: "100%", borderRadius: "8px" }}
  />
</div>
<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <video
    src="https://github.com/NOC-OI/zarr-cesium/releases/download/0.1.0/cube_globe.mp4"
    loop
    controls
    muted
    style={{ width: "100%", borderRadius: "8px" }}
  />
</div>

---

## Features

- **Zarr v2 and v3 support**
- **Single-scale and multiscale datasets** (using [ndpyramid](https://github.com/carbonplan/ndpyramid))
- **2D scalar, 3D volumetric, and 3D vector field visualization**
- **Automatic resolution selection** for multiscale datasets
- **CRS-aware** (EPSG:4326 & EPSG:3857)
- **WebGL-accelerated rendering**
- **Dynamic styling** (colormap, opacity, scaling, slices, animation)

---

## Provider Overview

| Provider                     | Purpose             | Description                                                |
| ---------------------------- | ------------------- | ---------------------------------------------------------- |
| **ZarrLayerProvider**        | 2D scalar fields    | Renders imagery layers from single/multiscale Zarr arrays. |
| **ZarrCubeProvider**         | 3D volumetric cubes | Renders 3D slices (horizontal & vertical).                 |
| **ZarrCubeVelocityProvider** | 3D vector fields    | Animated particle advection from U/V components.           |

---

## Architecture Diagram (High-level)

```

Zarr Store (HTTP / S3 / GCS)
↓
zarrita.js (Zarr client)
↓
Zarr-Cesium Providers
↓
CesiumJS (WebGL)
↓
2D/3D Interactive Visualization

```

---

## Acknowledgements

Built with:

- CesiumJS
- Zarr / zarrita
- cesium-wind-layer
- ndpyramid

**Developed at the `National Oceanography Centre (NOC)` as part of the `Atlantis` project.**
