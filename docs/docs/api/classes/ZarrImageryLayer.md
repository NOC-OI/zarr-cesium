# ZarrImageryLayer

Custom Cesium imagery layer for Zarr datasets.

## Remarks

Extends Cesium's `ImageryLayer` to support real-time updates to
visualization style (opacity, color map, scale) from Zarr-based data.

## Param

Instance of [ZarrLayerProvider](ZarrLayerProvider.md).

## Param

Cesium viewer instance.

## Extends

- `ImageryLayer`

## Constructors

### Constructor

```ts
new ZarrImageryLayer(imageryProvider?, options?): ZarrImageryLayer;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `imageryProvider?` | [`ImageryProvider`](https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html) |
| `options?` | `ConstructorOptions` |

#### Returns

`ZarrImageryLayer`

#### Inherited from

```ts
ImageryLayer.constructor
```

## Methods

### destroy()

```ts
destroy(): void;
```

Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
release of WebGL resources, instead of relying on the garbage collector to destroy this object.
<br /><br />
Once an object is destroyed, it should not be used; calling any function other than
<code>isDestroyed</code> will result in a [DeveloperError](https://cesium.com/learn/cesiumjs/ref-doc/DeveloperError.html) exception.  Therefore,
assign the return value (<code>undefined</code>) to the object as done in the example.

#### Returns

`void`

#### Example

```ts
imageryLayer = imageryLayer && imageryLayer.destroy();
```

#### Inherited from

```ts
ImageryLayer.destroy
```

***

### getImageryRectangle()

```ts
getImageryRectangle(): Rectangle;
```

Computes the intersection of this layer's rectangle with the imagery provider's availability rectangle,
producing the overall bounds of imagery that can be produced by this layer.

#### Returns

[`Rectangle`](https://cesium.com/learn/cesiumjs/ref-doc/Rectangle.html)

A rectangle which defines the overall bounds of imagery that can be produced by this layer.

#### Example

```ts
// Zoom to an imagery layer.
const imageryRectangle = imageryLayer.getImageryRectangle();
scene.camera.flyTo({
    destination: rectangle
});
```

#### Inherited from

```ts
ImageryLayer.getImageryRectangle
```

***

### isBaseLayer()

```ts
isBaseLayer(): boolean;
```

Gets a value indicating whether this layer is the base layer in the
[ImageryLayerCollection](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayerCollection.html).  The base layer is the one that underlies all
others.  It is special in that it is treated as if it has global rectangle, even if
it actually does not, by stretching the texels at the edges over the entire
globe.

#### Returns

`boolean`

true if this is the base layer; otherwise, false.

#### Inherited from

```ts
ImageryLayer.isBaseLayer
```

***

### isDestroyed()

```ts
isDestroyed(): boolean;
```

Returns true if this object was destroyed; otherwise, false.
<br /><br />
If this object was destroyed, it should not be used; calling any function other than
<code>isDestroyed</code> will result in a [DeveloperError](https://cesium.com/learn/cesiumjs/ref-doc/DeveloperError.html) exception.

#### Returns

`boolean`

True if this object was destroyed; otherwise, false.

#### Inherited from

```ts
ImageryLayer.isDestroyed
```

***

### softRefreshCurrentView()

```ts
softRefreshCurrentView(): void;
```

Forces a re-render of the current view to reflect updated imagery.

#### Returns

`void`

***

### updateSelectors()

```ts
updateSelectors(selectors): void;
```

Update the selectors used for slicing the Zarr dataset.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selectors` | \{ \[`key`: `string`\]: [`ZarrSelectorsProps`](../interfaces/ZarrSelectorsProps.md); \} | New selectors to apply. |

#### Returns

`void`

***

### updateStyle()

```ts
updateStyle(opts): void;
```

Update the visual style of the imagery layer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `colormap?`: `string`; `opacity?`: `number`; `scale?`: \[`number`, `number`\]; \} | Style options to update. |
| `opts.colormap?` | `string` | Colormap name. |
| `opts.opacity?` | `number` | Layer opacity. |
| `opts.scale?` | \[`number`, `number`\] | [min, max] range for data scaling. |

#### Returns

`void`

***

### fromProviderAsync()

```ts
static fromProviderAsync(imageryProviderPromise, options?): ImageryLayer;
```

Create a new imagery layer from an asynchronous imagery provider. The layer will handle any asynchronous loads or errors, and begin rendering the imagery layer once ready.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `imageryProviderPromise` | `Promise`\<[`ImageryProvider`](https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html)\> | A promise which resolves to a imagery provider |
| `options?` | `ConstructorOptions` | An object describing initialization options |

#### Returns

`ImageryLayer`

The created imagery layer.

#### Examples

```ts
// Create a new base layer
const viewer = new Cesium.Viewer("cesiumContainer", {
  baseLayer: Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(3812));
});
```

```ts
// Add a new transparent layer
const imageryLayer = Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(3812));
imageryLayer.alpha = 0.5;
viewer.imageryLayers.add(imageryLayer);
```

```ts
// Handle loading events
const imageryLayer = Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(3812));
viewer.imageryLayers.add(imageryLayer);

imageryLayer.readyEvent.addEventListener(provider => {
  imageryLayer.provider.errorEvent.addEventListener(error => {
    alert(`Encountered an error while loading imagery tiles! ${error}`);
  });
});

imageryLayer.errorEvent.addEventListener(error => {
  alert(`Encountered an error while creating an imagery layer! ${error}`);
});
```

#### Inherited from

```ts
ImageryLayer.fromProviderAsync
```

***

### fromWorldImagery()

```ts
static fromWorldImagery(options): ImageryLayer;
```

Create a new imagery layer for ion's default global base imagery layer, currently Bing Maps. The layer will handle any asynchronous loads or errors, and begin rendering the imagery layer once ready.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `ConstructorOptions` | An object describing initialization options |

#### Returns

`ImageryLayer`

The created imagery layer.

*

#### Examples

```ts
// Add a new transparent layer
const imageryLayer = Cesium.ImageryLayer.fromWorldImagery();
imageryLayer.alpha = 0.5;
viewer.imageryLayers.add(imageryLayer);
```

```ts
// Handle loading events
const imageryLayer = Cesium.ImageryLayer.fromWorldImagery();
viewer.imageryLayers.add(imageryLayer);

imageryLayer.readyEvent.addEventListener(provider => {
  imageryLayer.provider.errorEvent.addEventListener(error => {
    alert(`Encountered an error while loading imagery tiles! ${error}`);
  });
});

imageryLayer.errorEvent.addEventListener(error => {
  alert(`Encountered an error while creating an imagery layer! ${error}`);
});
```

```ts
// Create a new base layer
const viewer = new Cesium.Viewer("cesiumContainer", {
  baseLayer: Cesium.ImageryLayer.fromWorldImagery();
});
```

#### Inherited from

```ts
ImageryLayer.fromWorldImagery
```

## Properties

### alpha

```ts
alpha: number;
```

The alpha blending value of this layer, with 0.0 representing fully transparent and
1.0 representing fully opaque.

#### Inherited from

```ts
ImageryLayer.alpha
```

***

### brightness

```ts
brightness: number;
```

The brightness of this layer.  1.0 uses the unmodified imagery color.  Less than 1.0
makes the imagery darker while greater than 1.0 makes it brighter.

#### Inherited from

```ts
ImageryLayer.brightness
```

***

### colorToAlpha

```ts
colorToAlpha: Color;
```

Color value that should be set to transparent.

#### Inherited from

```ts
ImageryLayer.colorToAlpha
```

***

### colorToAlphaThreshold

```ts
colorToAlphaThreshold: number;
```

Normalized (0-1) threshold for color-to-alpha.

#### Inherited from

```ts
ImageryLayer.colorToAlphaThreshold
```

***

### contrast

```ts
contrast: number;
```

The contrast of this layer.  1.0 uses the unmodified imagery color.  Less than 1.0 reduces
the contrast while greater than 1.0 increases it.

#### Inherited from

```ts
ImageryLayer.contrast
```

***

### cutoutRectangle

```ts
cutoutRectangle: Rectangle;
```

Rectangle cutout in this layer of imagery.

#### Inherited from

```ts
ImageryLayer.cutoutRectangle
```

***

### dayAlpha

```ts
dayAlpha: number;
```

The alpha blending value of this layer on the day side of the globe, with 0.0 representing fully transparent and
1.0 representing fully opaque. This only takes effect when [Globe#enableLighting](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html#enableLighting) is <code>true</code>.

#### Inherited from

```ts
ImageryLayer.dayAlpha
```

***

### gamma

```ts
gamma: number;
```

The gamma correction to apply to this layer.  1.0 uses the unmodified imagery color.

#### Inherited from

```ts
ImageryLayer.gamma
```

***

### hue

```ts
hue: number;
```

The hue of this layer in radians. 0.0 uses the unmodified imagery color.

#### Inherited from

```ts
ImageryLayer.hue
```

***

### id

```ts
id: string = '';
```

Unique identifier for the cube provider instance.

***

### imageryProvider

```ts
imageryProvider: ZarrLayerProvider;
```

Gets the imagery provider for this layer. This should not be called before [ImageryLayer#ready](#ready) returns true.

#### Overrides

```ts
ImageryLayer.imageryProvider
```

***

### magnificationFilter

```ts
magnificationFilter: TextureMagnificationFilter;
```

The [TextureMagnificationFilter](https://cesium.com/learn/cesiumjs/ref-doc/TextureMagnificationFilter.html) to apply to this layer.
Possible values are [TextureMagnificationFilter.LINEAR](https://cesium.com/learn/cesiumjs/ref-doc/TextureMagnificationFilter.html#linear) (the default)
and [TextureMagnificationFilter.NEAREST](https://cesium.com/learn/cesiumjs/ref-doc/TextureMagnificationFilter.html#nearest).

To take effect, this property must be set immediately after adding the imagery layer.
Once a texture is loaded it won't be possible to change the texture filter used.

#### Inherited from

```ts
ImageryLayer.magnificationFilter
```

***

### minificationFilter

```ts
minificationFilter: TextureMinificationFilter;
```

The [TextureMinificationFilter](https://cesium.com/learn/cesiumjs/ref-doc/TextureMinificationFilter.html) to apply to this layer.
Possible values are [TextureMinificationFilter.LINEAR](https://cesium.com/learn/cesiumjs/ref-doc/TextureMinificationFilter.html#linear) (the default)
and [TextureMinificationFilter.NEAREST](https://cesium.com/learn/cesiumjs/ref-doc/TextureMinificationFilter.html#nearest).

To take effect, this property must be set immediately after adding the imagery layer.
Once a texture is loaded it won't be possible to change the texture filter used.

#### Inherited from

```ts
ImageryLayer.minificationFilter
```

***

### nightAlpha

```ts
nightAlpha: number;
```

The alpha blending value of this layer on the night side of the globe, with 0.0 representing fully transparent and
1.0 representing fully opaque. This only takes effect when [Globe#enableLighting](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html#enableLighting) is <code>true</code>.

#### Inherited from

```ts
ImageryLayer.nightAlpha
```

***

### ready

```ts
readonly ready: boolean;
```

Returns true when the terrain provider has been successfully created. Otherwise, returns false.

#### Inherited from

```ts
ImageryLayer.ready
```

***

### readyEvent

```ts
readonly readyEvent: Event<ReadyEventCallback>;
```

Gets an event that is raised when the imagery provider has been successfully created. Event listeners
are passed the created instance of [ImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html).

#### Inherited from

```ts
ImageryLayer.readyEvent
```

***

### rectangle

```ts
readonly rectangle: Rectangle;
```

Gets the rectangle of this layer.  If this rectangle is smaller than the rectangle of the
[ImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html), only a portion of the imagery provider is shown.

#### Inherited from

```ts
ImageryLayer.rectangle
```

***

### saturation

```ts
saturation: number;
```

The saturation of this layer. 1.0 uses the unmodified imagery color. Less than 1.0 reduces the
saturation while greater than 1.0 increases it.

#### Inherited from

```ts
ImageryLayer.saturation
```

***

### show

```ts
show: boolean;
```

Determines if this layer is shown.

#### Inherited from

```ts
ImageryLayer.show
```

***

### splitDirection

```ts
splitDirection: SplitDirection;
```

The [SplitDirection](https://cesium.com/learn/cesiumjs/ref-doc/SplitDirection.html) to apply to this layer.

#### Inherited from

```ts
ImageryLayer.splitDirection
```

***

### viewer?

```ts
optional viewer: Viewer;
```

***

### DEFAULT\_APPLY\_COLOR\_TO\_ALPHA\_THRESHOLD

```ts
static DEFAULT_APPLY_COLOR_TO_ALPHA_THRESHOLD: number;
```

This value is used as the default threshold for color-to-alpha if one is not provided
during construction or by the imagery provider.

#### Inherited from

```ts
ImageryLayer.DEFAULT_APPLY_COLOR_TO_ALPHA_THRESHOLD
```

***

### DEFAULT\_BRIGHTNESS

```ts
static DEFAULT_BRIGHTNESS: number;
```

This value is used as the default brightness for the imagery layer if one is not provided during construction
or by the imagery provider. This value does not modify the brightness of the imagery.

#### Inherited from

```ts
ImageryLayer.DEFAULT_BRIGHTNESS
```

***

### DEFAULT\_CONTRAST

```ts
static DEFAULT_CONTRAST: number;
```

This value is used as the default contrast for the imagery layer if one is not provided during construction
or by the imagery provider. This value does not modify the contrast of the imagery.

#### Inherited from

```ts
ImageryLayer.DEFAULT_CONTRAST
```

***

### DEFAULT\_GAMMA

```ts
static DEFAULT_GAMMA: number;
```

This value is used as the default gamma for the imagery layer if one is not provided during construction
or by the imagery provider. This value does not modify the gamma of the imagery.

#### Inherited from

```ts
ImageryLayer.DEFAULT_GAMMA
```

***

### DEFAULT\_HUE

```ts
static DEFAULT_HUE: number;
```

This value is used as the default hue for the imagery layer if one is not provided during construction
or by the imagery provider. This value does not modify the hue of the imagery.

#### Inherited from

```ts
ImageryLayer.DEFAULT_HUE
```

***

### DEFAULT\_MAGNIFICATION\_FILTER

```ts
static DEFAULT_MAGNIFICATION_FILTER: TextureMagnificationFilter;
```

This value is used as the default texture magnification filter for the imagery layer if one is not provided
during construction or by the imagery provider.

#### Inherited from

```ts
ImageryLayer.DEFAULT_MAGNIFICATION_FILTER
```

***

### DEFAULT\_MINIFICATION\_FILTER

```ts
static DEFAULT_MINIFICATION_FILTER: TextureMinificationFilter;
```

This value is used as the default texture minification filter for the imagery layer if one is not provided
during construction or by the imagery provider.

#### Inherited from

```ts
ImageryLayer.DEFAULT_MINIFICATION_FILTER
```

***

### DEFAULT\_SATURATION

```ts
static DEFAULT_SATURATION: number;
```

This value is used as the default saturation for the imagery layer if one is not provided during construction
or by the imagery provider. This value does not modify the saturation of the imagery.

#### Inherited from

```ts
ImageryLayer.DEFAULT_SATURATION
```

***

### DEFAULT\_SPLIT

```ts
static DEFAULT_SPLIT: SplitDirection;
```

This value is used as the default split for the imagery layer if one is not provided during construction
or by the imagery provider.

#### Inherited from

```ts
ImageryLayer.DEFAULT_SPLIT
```
