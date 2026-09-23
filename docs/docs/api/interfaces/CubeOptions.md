# CubeOptions

## Properties

### belowSeaLevel?

```ts
optional belowSeaLevel: boolean;
```

***

### bounds

```ts
bounds: BoundsProps;
```

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
optional crs: CRS | null;
```

***

### dimensionNames?

```ts
optional dimensionNames: DimensionNamesProps;
```

***

### flipElevation?

```ts
optional flipElevation: boolean;
```

***

### latIsAscending?

```ts
optional latIsAscending: boolean;
```

Whether latitude coordinate values increase with their array index.

***

### multiscaleFormat?

```ts
optional multiscaleFormat: MultiscaleFormat;
```

***

### multiscaleLevel?

```ts
optional multiscaleLevel: number;
```

***

### onAuthError?

```ts
optional onAuthError: OnAuthError;
```

Called once when a transformed request returns HTTP 400 or 401.

***

### opacity?

```ts
optional opacity: number;
```

***

### requestOverrides?

```ts
optional requestOverrides: RequestOverrides;
```

Static fetch options for URL-backed stores.

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

### showHorizontalSlices?

```ts
optional showHorizontalSlices: boolean;
```

***

### showVerticalSlices?

```ts
optional showVerticalSlices: boolean;
```

***

### store?

```ts
optional store: Readable;
```

Custom Zarrita-compatible store, including an IcechunkStore.

***

### transformRequest?

```ts
optional transformRequest: TransformRequest;
```

Dynamically transform requests for authentication, proxies, or signed URLs.

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

### verticalExaggeration?

```ts
optional verticalExaggeration: number;
```

***

### zarrVersion?

```ts
optional zarrVersion: 3 | 2;
```
