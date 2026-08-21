# QueryBackend

Minimal interface required by the framework-neutral convenience queries.

## Methods

### queryData()

```ts
queryData(
   geometry,
   selectors?,
options?): Promise<QueryResult>;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `geometry` | [`QueryPointGeometry`](QueryPointGeometry.md) |
| `selectors?` | [`ZarrSelectors`](ZarrSelectors.md) |
| `options?` | [`QueryOptions`](QueryOptions.md) |

#### Returns

`Promise`\<[`QueryResult`](QueryResult.md)\>

***

### queryPoints()?

```ts
optional queryPoints(
   positions,
   selectors?,
options?): Promise<QueryResult[]>;
```

Optional chunk-aware batch lookup used by transects.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `positions` | [`QueryPosition`](../type-aliases/QueryPosition.md)[] |
| `selectors?` | [`ZarrSelectors`](ZarrSelectors.md) |
| `options?` | [`TransectQueryOptions`](TransectQueryOptions.md) |

#### Returns

`Promise`\<[`QueryResult`](QueryResult.md)[]\>

## Properties

### dimensionValues

```ts
dimensionValues: DimensionValues;
```

***

### queryIndexOffsets?

```ts
readonly optional queryIndexOffsets: Record<string, number>;
```

Global index represented by local coordinate index zero, for subset-backed providers.

***

### selectors

```ts
selectors: ZarrSelectors;
```
