# ResolvedCRS

Validated transformation between WGS84 and a rectilinear source grid.

## Methods

### forward()

```ts
forward(position): [number, number];
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `position` | \[`number`, `number`\] |

#### Returns

\[`number`, `number`\]

***

### inverse()

```ts
inverse(position): [number, number];
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `position` | \[`number`, `number`\] |

#### Returns

\[`number`, `number`\]

## Properties

### code

```ts
code: string;
```

***

### definition?

```ts
optional definition: CRSDefinition;
```

***

### geographic

```ts
geographic: boolean;
```
