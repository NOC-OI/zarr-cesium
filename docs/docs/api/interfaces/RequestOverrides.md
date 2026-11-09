# RequestOverrides

Serializable static fetch options suitable for application state and FetchStore.

## Extends

- `Omit`\<`RequestInit`, `"body"` \| `"headers"` \| `"signal"`\>

## Properties

### cache?

```ts
cache?: RequestCache;
```

A string indicating how the request will interact with the browser's cache to set request's cache.

#### Inherited from

`Omit.cache`

***

### credentials?

```ts
credentials?: RequestCredentials;
```

A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials.

#### Inherited from

`Omit.credentials`

***

### headers?

```ts
headers?: Record<string, string>;
```

***

### integrity?

```ts
integrity?: string;
```

A cryptographic hash of the resource to be fetched by request. Sets request's integrity.

#### Inherited from

`Omit.integrity`

***

### keepalive?

```ts
keepalive?: boolean;
```

A boolean to set request's keepalive.

#### Inherited from

`Omit.keepalive`

***

### method?

```ts
method?: string;
```

A string to set request's method.

#### Inherited from

`Omit.method`

***

### mode?

```ts
mode?: RequestMode;
```

A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode.

#### Inherited from

`Omit.mode`

***

### priority?

```ts
priority?: RequestPriority;
```

#### Inherited from

`Omit.priority`

***

### redirect?

```ts
redirect?: RequestRedirect;
```

A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect.

#### Inherited from

`Omit.redirect`

***

### referrer?

```ts
referrer?: string;
```

A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer.

#### Inherited from

`Omit.referrer`

***

### referrerPolicy?

```ts
referrerPolicy?: ReferrerPolicy;
```

A referrer policy to set request's referrerPolicy.

#### Inherited from

`Omit.referrerPolicy`

***

### window?

```ts
window?: null;
```

Can only be null. Used to disassociate request from any Window.

#### Inherited from

`Omit.window`
