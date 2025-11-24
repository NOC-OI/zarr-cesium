# ZarrSelectorsProps

Describes a selector for a Zarr dataset dimension.

## Example

```ts
{ selected: 0, type: 'index' }
{ selected: 1000, type: 'value' }
{ selected: [0, 10], type: 'index' }
```

## Properties

### selected

```ts
selected: string | number | [number, number];
```

Selected index, value, or range.

***

### type?

```ts
optional type: "index" | "value";
```

Selection mode: by index or by physical value.
