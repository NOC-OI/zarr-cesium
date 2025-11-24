---
sidebar_position: 1
title: Introduction
---

# Zarr-Cesium Visualization Toolkit

**High-performance CesiumJS providers for interactive 2D and 3D visualization of environmental and atmospheric data stored in Zarr.**

- **Documentation:** https://noc-oi.github.io/zarr-cesium/docs
- **Demo:** https://noc-oi.github.io/zarr-cesium/

Zarr-Cesium enables **direct, client-side visualization of scientific datasets** stored in the [Zarr](https://zarr.dev) format. No preprocessing. No tile servers. No backend.

It provides a set of **CesiumJS data providers** that stream and render multidimensional geospatial datasets directly from HTTP/S3/GCS object storage.

## Why Zarr-Cesium?

Traditional NetCDF/GeoTIFF-based visualization pipelines require:

- preprocessing,
- tile generation,
- custom server infrastructure.

**Zarr-Cesium removes all of that**, streaming chunked scientific arrays directly into WebGL shaders for real-time exploration.

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

## Screenshots

ADD_INFO_HERE
Add screenshots using the `/static/img` folder, e.g.:

```md
![Example: 2D salinity data](../static/img/sos_abs.png)
```

---

## Acknowledgements

Built with:

- CesiumJS
- Zarr / zarrita
- cesium-wind-layer
- ndpyramid

**Developed at the `National Oceanography Centre (NOC)` as part of the `Atlantis` project.**
