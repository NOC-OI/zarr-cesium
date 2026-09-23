# updateImgData()

```ts
function updateImgData(
   value, 
   pixelIdx, 
   imgData, 
   colorScale, 
   opacity): ImageData;
```

Updates an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object with a new pixel color
derived from a numeric value and a [ColorScaleProps](../interfaces/ColorScaleProps.md) colormap.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `number` | Numeric data value to visualize. |
| `pixelIdx` | `number` | Byte offset within the `ImageData.data` array. |
| `imgData` | [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) | Target [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object to update. |
| `colorScale` | [`ColorScaleProps`](../interfaces/ColorScaleProps.md) | Colormap definition with `min`, `max`, and `colors` (see [ColorScaleProps](../interfaces/ColorScaleProps.md)). |
| `opacity` | `number` | Global opacity multiplier between 0 and 1. |

## Returns

[`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

The updated [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) with modified pixel values.

## Example

```ts
updateImgData(3.2, idx, imgData, { min: 0, max: 10, colors: viridis }, 0.9);
```
