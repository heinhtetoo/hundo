export const API_BASE = import.meta.env.VITE_API_URL ?? '';

const AUTH_PATHS = [
  '/api/v1/auth/refresh',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/logout',
];

let refreshPromise = null;

function isAuthPath(path) {
  return AUTH_PATHS.some(authPath => path.startsWith(authPath));
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const requestOptions = { credentials: 'include', ...options };
  const response = await fetch(`${API_BASE}${path}`, requestOptions);

  if (response.status !== 401 || isAuthPath(path)) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    window.dispatchEvent(new Event('auth:expired'));
    return response;
  }

  return fetch(`${API_BASE}${path}`, requestOptions);
}
