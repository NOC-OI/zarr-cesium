# detectBrowser()

```ts
function detectBrowser(): BrowserName;
```

Detects the current browser based on the user agent string.

## Returns

[`BrowserName`](../type-aliases/BrowserName.md)

The detected browser name as a [BrowserName](../type-aliases/BrowserName.md) type.

## Example

```ts
const browser = detectBrowser();
console.log(`Running in browser: ${browser}`);
```
