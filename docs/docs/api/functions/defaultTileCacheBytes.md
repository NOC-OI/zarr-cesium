# defaultTileCacheBytes()

```ts
function defaultTileCacheBytes(): number;
```

Selects a conservative per-layer budget while allowing up to five active
layers. `deviceMemory` is deliberately treated as a hint, not an allowance.

## Returns

`number`
