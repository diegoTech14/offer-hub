/**
 * Authenticated fetch utility with automatic token refresh
 * Use this for API calls that require authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Refresh the access token using the refresh token
 * @returns true if refresh was successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  const authMethod = localStorage.getItem("authMethod");

  if (authMethod === "cookie") {
    return true; // Cookie auth handles refresh server-side
  }

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const tokens = data.data?.tokens || data.tokens;

    if (tokens?.accessToken && tokens?.refreshToken) {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Clear authentication data and redirect to sign-in
 */
function clearAuthAndRedirect(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authMethod");
  window.location.href = "/onboarding/sign-in";
}

/**
 * Build fetch options with authentication headers
 */
function buildAuthHeaders(options: AuthFetchOptions = {}): RequestInit {
  const authMethod = localStorage.getItem("authMethod");
  const accessToken = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (authMethod === "cookie") {
    fetchOptions.credentials = "include";
  } else if (accessToken && accessToken !== "cookie-auth") {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetchOptions;
}

/**
 * Fetch with automatic token refresh on 401 errors
 *
 * @param url - The URL to fetch (can be relative to API_BASE_URL or absolute)
 * @param options - Fetch options with optional skipAuth flag
 * @returns The fetch response
 *
 * @example
 * // GET request
 * const response = await authFetch('/users/me');
 * const data = await response.json();
 *
 * @example
 * // POST request
 * const response = await authFetch('/posts', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'Hello' }),
 * });
 */
export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;

  // Build full URL
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // If skipping auth, just do a regular fetch
  if (skipAuth) {
    return fetch(fullUrl, fetchOptions);
  }

  // Build options with auth headers
  let authOptions = buildAuthHeaders(fetchOptions);

  // First attempt
  let response = await fetch(fullUrl, authOptions);

  // If 401 and using token auth, try to refresh
  if (response.status === 401 && localStorage.getItem("authMethod") === "token") {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry with new token
      authOptions = buildAuthHeaders(fetchOptions);
      response = await fetch(fullUrl, authOptions);
    }

    // If still 401 after refresh attempt, clear auth and redirect
    if (response.status === 401) {
      clearAuthAndRedirect();
    }
  }

  return response;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const authApi = {
  get: (url: string, options?: AuthFetchOptions) =>
    authFetch(url, { ...options, method: "GET" }),

  post: (url: string, body?: unknown, options?: AuthFetchOptions) =>
    authFetch(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (url: string, body?: unknown, options?: AuthFetchOptions) =>
    authFetch(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (url: string, body?: unknown, options?: AuthFetchOptions) =>
    authFetch(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (url: string, options?: AuthFetchOptions) =>
    authFetch(url, { ...options, method: "DELETE" }),
};
