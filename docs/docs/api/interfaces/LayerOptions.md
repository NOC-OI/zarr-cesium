# LayerOptions

## Properties

### cache?

```ts
optional cache: boolean | TileCacheOptions;
```

Decoded numeric tile cache. Enabled by default and scoped to this layer.

***

### colormap?

```ts
optional colormap: string;
```

***

### colorScale?

```ts
optional colorScale: [number, number, number][];
```

***

### crs?

```ts
optional crs: string | null;
```

***

### dimensionNames?

```ts
optional dimensionNames: DimensionNamesProps;
```

***

### latIsAscending?

```ts
optional latIsAscending: boolean;
```

***

### maximumLevel?

```ts
optional maximumLevel: number;
```

***

### minimumLevel?

```ts
optional minimumLevel: number;
```

***

### multiscaleFormat?

```ts
optional multiscaleFormat: MultiscaleFormat;
```

***

### noDataMax?

```ts
optional noDataMax: number;
```

***

### noDataMin?

```ts
optional noDataMin: number;
```

***

### onAuthError?

```ts
optional onAuthError: OnAuthError;
```

***

### opacity?

```ts
optional opacity: number;
```

***

### proj4?

```ts
optional proj4: string | Record<string, unknown>;
```

Proj4, WKT2, or PROJJSON definition for an arbitrary rectilinear source CRS.

***

### requestOverrides?

```ts
optional requestOverrides: RequestOverrides;
```

***

### scale?

```ts
optional scale: [number, number];
```

***

### selectors?

```ts
optional selectors: Record<string, ZarrSelectorsProps>;
```

***

### store?

```ts
optional store: Readable;
```

Custom Zarrita-compatible store, including an IcechunkStore.

***

### tileHeight?

```ts
optional tileHeight: number;
```

***

### tileWidth?

```ts
optional tileWidth: number;
```

***

### transformRequest?

```ts
optional transformRequest: TransformRequest;
```

***

### url?

```ts
optional url: string;
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
optional zarrVersion: 3 | 2;
```
