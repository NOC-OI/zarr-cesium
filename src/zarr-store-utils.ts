import * as zarr from 'zarrita';
import type { OnAuthError, RequestOverrides, TransformRequest } from 'zarr-maps-tiling';

/** Creates a fetch implementation that applies dynamic request configuration. */
export function createTransformedFetch(
  transformRequest: TransformRequest,
  onAuthError?: OnAuthError
): typeof fetch {
  let authErrorReported = false;
  return async (input, init) => {
    const originalUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const transformed = await transformRequest(originalUrl, {
      method: (init?.method as 'GET' | 'HEAD' | undefined) ?? 'GET'
    });
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    new Headers(transformed.headers).forEach((value, key) => headers.set(key, value));
    const response = await fetch(transformed.url, { ...init, ...transformed, headers });
    if (!authErrorReported && onAuthError && (response.status === 400 || response.status === 401)) {
      authErrorReported = true;
      onAuthError(response.status);
    }
    return response;
  };
}

/** Creates a Zarrita FetchStore with optional static and dynamic request settings. */
export function createFetchStore(
  url: string,
  requestOverrides?: RequestOverrides,
  transformedFetch?: typeof fetch
): zarr.FetchStore {
  return new zarr.FetchStore(url, {
    ...(requestOverrides ? { overrides: requestOverrides } : {}),
    ...(transformedFetch ? { fetch: transformedFetch } : {})
  });
}
