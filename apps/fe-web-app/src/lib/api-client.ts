const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_BASE_URL = 'http://localhost:5000/api';

export const apiBaseUrl =
  typeof RAW_BASE_URL === 'string' && RAW_BASE_URL.trim().length > 0
    ? RAW_BASE_URL.replace(/\/+$/, '')
    : DEFAULT_BASE_URL;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

type ApiFetchOptions = RequestInit & {
  skipDefaultHeaders?: boolean;
};

/**
 * Lightweight wrapper around fetch that prefixes the configured API base URL
 * and normalises JSON responses/errors.
 */
export async function apiFetch<TResponse>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { skipDefaultHeaders, headers, ...rest } = options;

  const target =
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(target, {
    ...rest,
    headers: skipDefaultHeaders
      ? headers
      : {
          ...defaultHeaders,
          ...headers,
        },
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}

async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const data = await response.json();
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
    }
  } catch (error) {
    // Ignore JSON parse issues and fall back to status text/message below.
  }

  return response.statusText || fallback;
}
