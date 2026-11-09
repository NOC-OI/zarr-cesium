# CubeOptions

## Properties

### bounds?

```ts
bounds?: BoundsProps;
```

Geographic subset. When omitted, coverage is derived from the source X/Y axes.

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

### elevationMode?

```ts
elevationMode?: ElevationMode;
```

Render positive vertical coordinates above sea level or as depths below it.

***

### flipElevation?

```ts
flipElevation?: boolean;
```

Reverse vertical data-plane placement without changing source elevation indices.

***

### latIsAscending?

```ts
latIsAscending?: boolean;
```

Whether latitude coordinate values increase with their array index.

***

### multiscaleFormat?

```ts
multiscaleFormat?: MultiscaleFormat;
```

***

### multiscaleLevel?

```ts
multiscaleLevel?: number;
```

***

### noDataMax?

```ts
noDataMax?: number;
```

Maximum valid decoded value; larger values are treated as no-data.

***

### noDataMin?

```ts
noDataMin?: number;
```

Minimum valid decoded value; smaller values are treated as no-data.

***

### onAuthError?

```ts
onAuthError?: OnAuthError;
```

Called once when a transformed request returns HTTP 400 or 401.

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

Static fetch options for URL-backed stores.

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

### showHorizontalSlices?

```ts
showHorizontalSlices?: boolean;
```

***

### showVerticalSlices?

```ts
showVerticalSlices?: boolean;
```

***

### store?

```ts
store?: Readable;
```

Custom Zarrita-compatible store, including an IcechunkStore.

***

### transformRequest?

```ts
transformRequest?: TransformRequest;
```

Dynamically transform requests for authentication, proxies, or signed URLs.

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

### verticalExaggeration?

```ts
verticalExaggeration?: number;
```

***

### zarrVersion?

```ts
zarrVersion?: 3 | 2 | null;
```

Zarr version. Defaults to null and is detected by trying v3 before v2.
