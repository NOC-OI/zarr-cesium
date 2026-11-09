# ZarrTileOptions

Framework-neutral options for the shared 2D Zarr tile renderer.

## Properties

### cache?

```ts
cache?: boolean | TileCacheOptions;
```

Decoded numeric tile cache. Enabled by default. Pass `false` to disable it,
or an options object to configure its per-provider byte budget.

***

### colormap?

```ts
colormap?: string;
```

***

### crs?

```ts
crs?: string | null;
```

***

### dimensionNames?

```ts
dimensionNames?: DimensionNamesProps;
```

***

### latIsAscending?

```ts
latIsAscending?: boolean;
```

***

### maxZoom?

```ts
maxZoom?: number;
```

***

### multiscaleFormat?

```ts
multiscaleFormat?: MultiscaleFormat;
```

***

### noDataMax?

```ts
noDataMax?: number;
```

***

### noDataMin?

```ts
noDataMin?: number;
```

***

### onAuthError?

```ts
onAuthError?: OnAuthError;
```

Called once when a transformed request returns an expired-credential status.

***

### proj4?

```ts
proj4?: CRSDefinition;
```

Proj4, WKT2, or PROJJSON definition for a CRS not registered by proj4.

***

### renderTarget?

```ts
renderTarget?: "cesium" | "web-map";
```

Rendering convention used by the consuming map framework.

***

### requestOverrides?

```ts
requestOverrides?: RequestOverrides;
```

***

### scale?

```ts
scale?: [number, number];
```

***

### selectors?

```ts
selectors?: ZarrSelectors;
```

***

### store?

```ts
store?: Readable;
```

Custom Zarrita-compatible store, such as an IcechunkStore.

***

### tileSize?

```ts
tileSize?: number;
```

***

### transformRequest?

```ts
transformRequest?: TransformRequest;
```

Dynamically transform each FetchStore request (for auth, proxies, or signed URLs).

***

### url?

```ts
url?: string;
```

URL to a Zarr store. Required unless `store` is provided.

***

### variable

```ts
variable: string;
```

***

### zarrVersion?

```ts
zarrVersion?: 3 | 2 | null;
```

Zarr version. Defaults to null and is detected by trying v3 before v2.
