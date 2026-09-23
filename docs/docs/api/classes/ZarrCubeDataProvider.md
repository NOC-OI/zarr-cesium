# ZarrCubeDataProvider

Loads and spatially subsets a three-dimensional Zarr variable without rendering it.

## Constructors

### Constructor

```ts
new ZarrCubeDataProvider(options): ZarrCubeDataProvider;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ZarrCubeDataOptions`](../interfaces/ZarrCubeDataOptions.md) |

#### Returns

`ZarrCubeDataProvider`

## Methods

### load()

```ts
load(): Promise<ZarrCubeData>;
```

#### Returns

`Promise`\<[`ZarrCubeData`](../interfaces/ZarrCubeData.md)\>
