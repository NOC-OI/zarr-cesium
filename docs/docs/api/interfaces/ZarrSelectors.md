# ZarrSelectors

Describes a selector for a Zarr dataset dimension.

## Example

```ts
{ selected: 0, type: 'index' }
{ selected: 1000, type: 'value' }
{ selected: [0, 10], type: 'index' }
```

## Indexable

```ts
[key: string]: ZarrSelectorsProps
```
