# MultiscaleFormat

```ts
type MultiscaleFormat = "auto" | "legacy" | "geozarr" | "topozarr";
```

Supported multiscale metadata layouts.

- `auto` detects the layout from the dataset metadata.
- `legacy` uses the original ndpyramid-style level ordering.
- `geozarr` and `topozarr` use GeoZarr-style level ordering.
