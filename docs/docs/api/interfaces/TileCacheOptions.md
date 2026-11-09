# TileCacheOptions

Controls the in-memory cache used to recolor tiles without reading Zarr data again.

## Properties

### enabled?

```ts
enabled?: boolean;
```

Enable decoded tile caching. Defaults to `true`.

***

### maxBytes?

```ts
maxBytes?: number;
```

Maximum decoded bytes retained by one provider. When omitted, a device-aware
budget between 8 and 64 MiB is selected, assuming at most five active layers.
