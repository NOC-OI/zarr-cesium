---
sidebar_position: 6
title: Data Preparation
---

# Data Preparation for Zarr-Cesium

Zarr-Cesium works best when datasets are prepared with **web visualization constraints** in mind:

- Projection
- Chunking
- Multiscale pyramids
- Zarr format

This page summarises the full workflow used for preparing large ocean model datasets for browser-based visualization.

---

# 1. Reprojecting Curvilinear / Rotated-Pole Grids

Many ocean and climate models (e.g., NEMO, MOM6) use curvilinear or rotated-pole grids (`nav_lat`, `nav_lon`).
Browsers expect **EPSG:4326** or **EPSG:3857**.

Use [`iris`](https://scitools-iris.readthedocs.io/) or [`xESMF`](https://xesmf.readthedocs.io/en/) to reproject:

```python
import xesmf as xe

lon_target = np.linspace(-180, 180, 360))
lat_target = np.linspace(-90, 90, 240))

target_grid = xr.Dataset(
    {
        "lon": (["lon"], lon_target),
        "lat": (["lat"], lat_target),
    },
)
regridder = xe.Regridder(
    ds_source,
    target_grid,
    method="bilinear"
)
regridded_ds = regridder(ds_source)
```

---

# 2. Chunking for Web Performance

Chunk size dramatically affects browser speed.

**Best practices:**

| Workflow          | Ideal chunk size   | Why                           |
| ----------------- | ------------------ | ----------------------------- |
| HPC / analysis    | 10–100 MB          | Efficient for Dask            |
| Web visualization | **100–500 KB**     | Fast requests, limits latency |
| Map tiles         | 256×256 or 512×512 | Aligns with screen tiles      |

Avoid chunking across non-spatial dimensions (time, depth):

```python
reprojected_ds = reprojected_ds.chunk({
    "time": 1,
    "latitude": 256,
    "longitude": 256
})
```

This lets the browser fetch only the **visible slice**.

---

# 3. Building Multiscale Pyramids

To support seamless zooming, convert your dataset to a pyramid representation using [`ndpyramid`](https://github.com/carbonplan/ndpyramid):

```python
from ndpyramid import pyramid_resample

pyramid_ds = pyramid_resample(
    reprojected_ds,
    x="longitude",
    y="latitude",
    levels=6,
    resampling="nearest",
)
```

Output structure:

```
multiscale.zarr/
├── 0/    # lowest resolution
├── 1/    # 2× highres
├── 2/    # 4× highres
└── ...
```

Zarr-Cesium’s 2D provider automatically selects levels based on zoom. For the 3D providers, you can specify the desired level.

---

# 4. Zarr Format

If you are using **Zarr v2**, write the final dataset to with consolidated metadata:

```python
pyramid_ds.to_zarr("multiscale.zarr", consolidated=True, zarr_version=2)
```

This ensures compatibility with Zarr-Cesium and efficient loading in the browser.

If you are using **Zarr v3**, ensure your Zarr store is accessible via HTTP(S) and follows the Zarr v3 specification:

```python
pyramid_ds.to_zarr("multiscale.zarr",, zarr_version=3)
```

---

# 5. Example Dataset

This workflow was developed using **approximately 30 GB of NEMO NPD ocean model output** (documentation available at [https://noc-msm.github.io/NOC_Near_Present_Day/](https://noc-msm.github.io/NOC_Near_Present_Day/)). The dataset includes:

- Multiple physical variables
- Depth and time dimensions
- A reprojected rotated-pole grid
- Chunking and multiscale pyramids optimised for web delivery

We also provide a sample atmospheric dataset for testing wind-related visualisations. This dataset contains U/V wind components on a regular latitude–longitude grid, processed with the same workflow, and derived from the ERA5 reanalysis of Hurricane Florence.

A full list of available datasets is provided in the **data information file** on [demo/src/application/data/layers-json.tsx](https://github.com/NOC-OI/zarr-cesium/blob/dev/demo/src/application/data/layers-json.tsx).

A full demo is available:

- GitHub: [https://github.com/NOC-OI/zarr-vis/demo](https://github.com/NOC-OI/zarr-vis/demo)
- Live demo: [https://noc-oi.github.io/zarr-vis/](https://noc-oi.github.io/zarr-vis/)

---

# Summary Workflow

```
Curvilinear Model Output
        ↓
Reproject (iris / xESMF)
        ↓
Rechunk (small spatial chunks)
        ↓
Build pyramids (ndpyramid)
        ↓
Write Zarr v2/v3
        ↓
Load in browser (Zarr-Cesium)
```

This pipeline allows **real-time, fully client-side visualization** of multi-GB geospatial datasets directly in CesiumJS.
