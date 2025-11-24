# CubeOptions

Configuration for a 3D cube visualization (volumetric rendering).

## Properties

### belowSeaLevel?

```ts
optional belowSeaLevel: boolean;
```

***

### bounds

```ts
bounds: object;
```

#### east

```ts
east: number;
```

#### north

```ts
north: number;
```

#### south

```ts
south: number;
```

#### west

```ts
west: number;
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

### multiscaleLevel?

```ts
optional multiscaleLevel: number;
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

### verticalExaggeration?

```ts
optional verticalExaggeration: number;
```

***

### zarrVersion?

```ts
optional zarrVersion: 2 | 3;
```
