---
sidebar_position: 2
title: Getting Started
---

# Getting Started

## Installation

```bash
npm install zarr-cesium
```

`zarr-cesium` supports CesiumJS 1.119 and newer, including CesiumJS 1.142+.

---

## Basic Usage

### 1. Initialize Cesium

```ts
import { Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');
```

---

## Rendering 2D Scalar Data (ZarrLayerProvider)

```ts
import { ZarrLayerProvider } from 'zarr-cesium';

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

<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <video
    src="https://github.com/user-attachments/assets/33fc6dd2-38fa-4b20-a346-0a175f90eba1"
    loop
    controls
    muted
    style={{ width: "100%", borderRadius: "8px" }}
  />
</div>

> Example of visualizing a Zarr dataset in a CesiumJS map using Zarr-Cesium. You can easily change the timestamp, colormap, and scale.

More details on this provider can be found in the [ZarrLayerProvider documentation](./providers/zarr-layer-provider.md).

### Icechunk and custom stores

The 2D provider also accepts any Zarrita-compatible readable store. Install the
backend client in your application and pass the opened store instead of a URL:

The Icechunk and private Zarr integrations were directly inspired by CarbonPlan's
[`zarr-layer`](https://github.com/carbonplan/zarr-layer) implementation.

```ts
import { IcechunkStore } from 'icechunk-js';
import { ZarrLayerProvider } from 'zarr-cesium';

const store = await IcechunkStore.open('https://example.com/data.icechunk', {
  branch: 'main',
  formatVersion: 'v1'
});

const layer = await ZarrLayerProvider.createLayer(viewer, {
  store,
  variable: 'temperature',
  colormap: 'viridis',
  scale: [0, 30]
});
viewer.imageryLayers.add(layer);
```

### Querying rendered data

All providers support point queries and convenience methods for common
scientific profiles. The 2D and scalar-cube providers also support transects:

```ts
const point = await layer.imageryProvider.queryData({
  type: 'Point',
  coordinates: [-4.2, 50.1]
});

const series = await layer.imageryProvider.getTimeSeries([-4.2, 50.1]);
const profile = await cube.getVerticalProfile([-4.2, 50.1]);
const transect = await cube.getTransect([-5, 50], [-3, 51], undefined, {
  samples: 100
});
```

Input positions use WGS84 longitude/latitude. Pass an `AbortSignal` through
query options to cancel long-running reads.

---

## Rendering 3D Volumes (ZarrCubeProvider)

```ts
import { ZarrCubeProvider } from 'zarr-cesium';

const cube = new ZarrCubeProvider(viewer, {
  url: 'https://example.com/ocean_temp.zarr',
  variable: 'temperature',
  bounds: { west: -20, south: 30, east: 10, north: 60 },
  colormap: 'plasma',
  verticalExaggeration: 50
});

await cube.load();
```

<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <video
    src="https://github.com/user-attachments/assets/8b066725-c6c7-4b7a-9fc0-d632b623937c"
    loop
    controls
    muted
    style={{ width: "100%", borderRadius: "8px" }}
  />
</div>

> Example of visualizing a 4D Zarr dataset in a CesiumJS map as a 3D cube using Zarr-Cesium. You can easily change slices and view the cube in different ways, styles, and scales.

More details on this provider can be found in the [ZarrCubeProvider documentation](./providers/zarr-cube-provider.md).

---

## Rendering 3D Vector Fields (ZarrCubeVelocityProvider)

```ts
import { ZarrCubeVelocityProvider } from 'zarr-cesium';

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

This uses the [NOC-OI fork of `cesium-wind-layer`](https://github.com/NOC-OI/cesium-wind-layer) for GPU-accelerated particle flow animations. Its `minVisibleRatio` option prevents particle width, trail length, and speed from shrinking below a configured fraction while zooming.

<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <video
    src="https://github.com/user-attachments/assets/a54ddd70-9b00-4a3e-9cb9-41025cceffd0"
    loop
    controls
    muted
    style={{ width: "100%", borderRadius: "8px" }}
  />
</div>

> Example of visualizing wind-speed vector data from Zarr in a CesiumJS map using Zarr-Cesium. This dataset is from Hurricane Florence, which occurred in 2018. You can easily change the timestamp, colormap, and particle speed.

More details on this provider can be found in the [ZarrCubeVelocityProvider documentation](./providers/zarr-cube-velocity-provider.md).

Both 3D providers support the same private-store request hooks as the 2D provider. `ZarrCubeProvider` accepts `store`, while `ZarrCubeVelocityProvider` accepts `stores.u` and `stores.v` for Zarrita-compatible stores such as Icechunk. URL-backed stores accept `requestOverrides`, `transformRequest`, and `onAuthError`.

---

## Next Steps

- Explore available providers: **[ZarrLayerProvider](./providers/zarr-layer-provider.md)** | **[ZarrCubeProvider](./providers/zarr-cube-provider.md)** | **[ZarrCubeVelocityProvider](./providers/zarr-cube-velocity-provider.md)**
- Learn about how to prepare and transform data for the browser: **[Data](./data.md)**
