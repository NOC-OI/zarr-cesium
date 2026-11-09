# LayerOptions

## Properties

### cache?

```ts
cache?: boolean | TileCacheOptions;
```

Decoded numeric tile cache. Enabled by default and scoped to this layer.

***

### colormap?

```ts
colormap?: string;
```

***

### colorScale?

```ts
colorScale?: [number, number, number][];
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

### maximumLevel?

```ts
maximumLevel?: number;
```

***

### minimumLevel?

```ts
minimumLevel?: number;
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

***

### opacity?

```ts
opacity?: number;
```

***

### proj4?

```ts
proj4?: string | Record<string, unknown>;
```

Proj4, WKT2, or PROJJSON definition for an arbitrary rectilinear source CRS.

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
selectors?: Record<string, ZarrSelectorsProps>;
```

***

### store?

```ts
store?: Readable;
```

Custom Zarrita-compatible store, including an IcechunkStore.

***

### tileHeight?

```ts
tileHeight?: number;
```

***

### tileWidth?

```ts
tileWidth?: number;
```

***

### transformRequest?

```ts
transformRequest?: TransformRequest;
```

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
