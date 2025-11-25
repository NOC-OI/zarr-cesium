# VelocityOptions

Configuration for a vector (velocity) visualization layer.

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

### sliceSpacing?

```ts
optional sliceSpacing: number;
```

***

### urls

```ts
urls: object;
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
optional windOptions: Partial<WindLayerOptions>;
```

***

### zarrVersion?

```ts
optional zarrVersion: 2 | 3;
```
