---
sidebar_position: 2
title: Getting Started
---

# Getting Started

## Installation

```bash
npm install @noc-oi/zarr-cesium
# or
yarn add @noc-oi/zarr-cesium
```

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
import { ZarrLayerProvider } from '@noc-oi/zarr-cesium';

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

ADD_INFO_HERE

More details on this provider can be found in the [ZarrLayerProvider documentation](./providers/zarr-layer-provider.md).

---

## Rendering 3D Volumes (ZarrCubeProvider)

```ts
import { ZarrCubeProvider } from '@noc-oi/zarr-cesium';

const cube = new ZarrCubeProvider(viewer, {
  url: 'https://example.com/ocean_temp.zarr',
  variable: 'temperature',
  bounds: { west: -20, south: 30, east: 10, north: 60 },
  colormap: 'plasma',
  verticalExaggeration: 50
});

await cube.load();
```

ADD_INFO_HERE

More details on this provider can be found in the [ZarrCubeProvider documentation](./providers/zarr-cube-provider.md).

---

## Rendering 3D Vector Fields (ZarrCubeVelocityProvider)

```ts
import { ZarrCubeVelocityProvider } from '@noc-oi/zarr-cesium';

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

This uses [`cesium-wind-layer`](https://github.com/hongfaqiu/cesium-wind-layer) for GPU-accelerated particle flow animations.

ADD_INFO_HERE

More details on this provider can be found in the [ZarrCubeVelocityProvider documentation](./providers/zarr-cube-velocity-provider.md).

---

## Next Steps

- Learn about how to prepare and transform data for the browser: **[Data](./data.md)**
- Explore available providers: **[ZarrLayerProvider](./providers/zarr-layer-provider.md)** | **[ZarrCubeProvider](./providers/zarr-cube-provider.md)** | **[ZarrCubeVelocityProvider](./providers/zarr-cube-velocity-provider.md)**
