# RequestOverrides

Serializable static fetch options suitable for application state and FetchStore.

## Extends

- `Omit`\<`RequestInit`, `"body"` \| `"headers"` \| `"signal"`\>

## Properties

### cache?

```ts
optional cache: RequestCache;
```

A string indicating how the request will interact with the browser's cache to set request's cache.

#### Inherited from

```ts
Omit.cache
```

***

### credentials?

```ts
optional credentials: RequestCredentials;
```

A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials.

#### Inherited from

```ts
Omit.credentials
```

***

### headers?

```ts
optional headers: Record<string, string>;
```

***

### integrity?

```ts
optional integrity: string;
```

A cryptographic hash of the resource to be fetched by request. Sets request's integrity.

#### Inherited from

```ts
Omit.integrity
```

***

### keepalive?

```ts
optional keepalive: boolean;
```

A boolean to set request's keepalive.

#### Inherited from

```ts
Omit.keepalive
```

***

### method?

```ts
optional method: string;
```

A string to set request's method.

#### Inherited from

```ts
Omit.method
```

***

### mode?

```ts
optional mode: RequestMode;
```

A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode.

#### Inherited from

```ts
Omit.mode
```

***

### priority?

```ts
optional priority: RequestPriority;
```

#### Inherited from

```ts
Omit.priority
```

***

### redirect?

```ts
optional redirect: RequestRedirect;
```

A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect.

#### Inherited from

```ts
Omit.redirect
```

***

### referrer?

```ts
optional referrer: string;
```

A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer.

#### Inherited from

```ts
Omit.referrer
```

***

### referrerPolicy?

```ts
optional referrerPolicy: ReferrerPolicy;
```

A referrer policy to set request's referrerPolicy.

#### Inherited from

```ts
Omit.referrerPolicy
```

***

### window?

```ts
optional window: null;
```

Can only be null. Used to disassociate request from any Window.

#### Inherited from

```ts
Omit.window
```
