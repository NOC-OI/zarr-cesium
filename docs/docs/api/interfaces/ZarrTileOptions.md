# ZarrTileOptions

Framework-neutral options for the shared 2D Zarr tile renderer.

## Properties

### colormap?

```ts
optional colormap: string;
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

### latIsAscending?

```ts
optional latIsAscending: boolean;
```

***

### maxZoom?

```ts
optional maxZoom: number;
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

Called once when a transformed request returns an expired-credential status.

***

### renderTarget?

```ts
optional renderTarget: "cesium" | "web-map";
```

Rendering convention used by the consuming map framework.

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
optional selectors: ZarrSelectors;
```

***

### store?

```ts
optional store: Readable;
```

Custom Zarrita-compatible store, such as an IcechunkStore.

***

### tileSize?

```ts
optional tileSize: number;
```

***

### transformRequest?

```ts
optional transformRequest: TransformRequest;
```

Dynamically transform each FetchStore request (for auth, proxies, or signed URLs).

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
