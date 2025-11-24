# LayerOptions

Configuration for a 2D raster (image) layer visualization.

## Properties

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

### opacity?

```ts
optional opacity: number;
```

***

### scale?

```ts
optional scale: [number, number];
```

***

### selectors?

```ts
optional selectors: object;
```

#### Index Signature

```ts
[key: string]: ZarrSelectorsProps
```

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

### url

```ts
url: string;
```

***

### variable

```ts
variable: string;
```

***

### zarrVersion?

```ts
optional zarrVersion: 2 | 3;
```
