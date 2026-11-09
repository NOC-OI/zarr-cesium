# VelocityOptions

## Properties

### bounds?

```ts
bounds?: BoundsProps;
```

Geographic subset shared by U/V. When omitted, source coverage is derived.

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

Maximum valid decoded component value; larger U/V values are no-data.

***

### noDataMin?

```ts
noDataMin?: number;
```

Minimum valid decoded component value; smaller U/V values are no-data.

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

Proj4, WKT2, or PROJJSON definition shared by the U and V source grids.

***

### requestOverrides?

```ts
requestOverrides?: RequestOverrides;
```

Static fetch options shared by URL-backed U and V stores.

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

### sliceSpacing?

```ts
sliceSpacing?: number;
```

***

### stores?

```ts
stores?: object;
```

Custom Zarrita-compatible stores for U and V, including IcechunkStore instances.

#### u?

```ts
u?: Readable;
```

#### v?

```ts
v?: Readable;
```

***

### transformRequest?

```ts
transformRequest?: TransformRequest;
```

Dynamically transform U and V requests for authentication, proxies, or signed URLs.

***

### urls?

```ts
urls?: object;
```

URLs for the U and V stores. Each may be omitted when its custom store is supplied.

#### u?

```ts
u?: string;
```

#### v?

```ts
v?: string;
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
verticalExaggeration?: number;
```

***

### windOptions?

```ts
windOptions?: VelocityWindOptions;
```

Particle styling; height is derived from the selected Zarr elevation.

***

### zarrVersion?

```ts
zarrVersion?: 3 | 2 | null;
```

Zarr version. Defaults to null and is detected by trying v3 before v2.
