# VelocityOptions

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

Static fetch options shared by URL-backed U and V stores.

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

### sliceSpacing?

```ts
optional sliceSpacing: number;
```

***

### stores?

```ts
optional stores: object;
```

Custom Zarrita-compatible stores for U and V, including IcechunkStore instances.

#### u?

```ts
optional u: Readable;
```

#### v?

```ts
optional v: Readable;
```

***

### transformRequest?

```ts
optional transformRequest: TransformRequest;
```

Dynamically transform U and V requests for authentication, proxies, or signed URLs.

***

### urls?

```ts
optional urls: object;
```

URLs for the U and V stores. Each may be omitted when its custom store is supplied.

#### u?

```ts
optional u: string;
```

#### v?

```ts
optional v: string;
```

***

### variables

```ts
variables: object;
```

#### u

```ts
u: string;
```

#### v

```ts
v: string;
```

***

### verticalExaggeration?

```ts
optional verticalExaggeration: number;
```

***

### windOptions?

```ts
optional windOptions: VelocityWindOptions;
```

Particle styling; height is derived from the selected Zarr elevation.

***

### zarrVersion?

```ts
optional zarrVersion: 3 | 2;
```
