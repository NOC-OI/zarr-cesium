---
sidebar_position: 6
title: Data Preparation
---

# Data Preparation for Zarr-Cesium

Although Zarr-Cesium can work with any Zarr dataset, it works best when datasets are prepared with **web visualization constraints** in mind:

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

lon_target = np.linspace(-180, 180, 360)
lat_target = np.linspace(-90, 90, 240)

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

| Workflow          | Ideal chunk size            | Why                           |
| ----------------- | --------------------------- | ----------------------------- |
| HPC / analysis    | 10–100 MB                   | Efficient for Dask            |
| Web visualization | **100–500 KB**              | Fast requests, limits latency |
| Map tiles         | 128×128, 256×256 or 512×512 | Aligns with screen tiles      |

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

To support seamless zooming, convert your dataset to a pyramid representation using
[`topozarr`](https://github.com/carbonplan/topozarr). TopoZarr writes metadata following
the [GeoZarr conventions](https://github.com/zarr-developers/geozarr-spec), including
the multiscales, projection, and spatial conventions. This is the recommended format
for new datasets.

```python
import xproj  # registers the Xarray .proj accessor
from topozarr import create_pyramid

pyramid_input = reprojected_ds.proj.assign_crs(spatial_ref="EPSG:4326")

pyramid = create_pyramid(
    pyramid_input,
    levels=6,
    x_dim="longitude",
    y_dim="latitude",
    method="nearest",
)

pyramid.write("multiscale.zarr")
```

`levels` includes the original dataset. Level `0` is the original, highest-resolution
level; each subsequent level is coarser. Choose the aggregation method to match the
data: `nearest` is useful for categorical values, while `mean`, `min`, `max`, or `sum`
may be more appropriate for continuous variables.

Output structure:

```
multiscale.zarr/
├── 0/    # original, highest resolution
├── 1/    # 2× coarser in each spatial dimension
├── 2/    # 4× coarser in each spatial dimension
└── ...
```

Zarr-Cesium’s 2D provider automatically selects levels based on zoom. For the 3D providers, you can specify the desired level.

[`ndpyramid`](https://github.com/carbonplan/ndpyramid) remains supported for existing
stores, but its legacy metadata layout is not recommended for new datasets. If the
data needs reprojection or regridding, perform that step before passing it to TopoZarr.

# 4. Zarr Format

TopoZarr writes the pyramid and its GeoZarr metadata with `pyramid.write(...)`, as
shown above. Ensure the resulting store is accessible via HTTP(S). For web delivery,
use small spatial chunks and avoid consolidating Zarr v3 metadata; TopoZarr provides
chunking and sharding recommendations for this workflow.

Zarr-Cesium also supports existing Zarr v2 stores. These should use consolidated
metadata to reduce the number of browser requests.

---

# 5. Example Dataset

The example dataset used in the demo and documentation is prepared using the above workflow.
We used **approximately 30 GB of NEMO NPD ocean model output** (documentation available at [https://noc-msm.github.io/NOC_Near_Present_Day/](https://noc-msm.github.io/NOC_Near_Present_Day/)). The dataset includes:

- Multiple physical variables
- Depth and time dimensions
- A reprojected rotated-pole grid
- Chunking and multiscale pyramids optimised for web delivery

We also provide a sample atmospheric dataset for testing wind-related visualisations. This dataset contains U/V wind components on a regular latitude–longitude grid, processed with the same workflow, and derived from the ERA5 reanalysis of Hurricane Florence.

A full list of available datasets is provided in the **data information file** on [demo/src/application/data/layers-json.ts](https://github.com/NOC-OI/zarr-cesium/blob/dev/demo/src/application/data/layers-json.ts).

A full demo is available:

- GitHub: [https://github.com/NOC-OI/zarr-cesium/demo](https://github.com/NOC-OI/zarr-cesium/demo)
- Live demo: [https://noc-oi.github.io/zarr-cesium/](https://noc-oi.github.io/zarr-cesium/)

---

# Summary Workflow

```
Curvilinear Model Output
        ↓
Reproject (iris / xESMF)
        ↓
Rechunk (small spatial chunks)
        ↓
Build a GeoZarr pyramid with TopoZarr
        ↓
Write Zarr v2/v3
        ↓
Load in browser (Zarr-Cesium)
```

This pipeline allows **real-time, fully client-side visualization** of multi-GB geospatial datasets directly in CesiumJS.
