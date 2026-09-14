import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/** Hard ceiling for any single API call — failures must surface, never hang. */
export const API_TIMEOUT_MS = 15_000;

export const apiClient = axios.create({
  baseURL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Turn axios/network failures into Errors with a meaningful message while
// keeping `error.response` intact so existing callers that inspect the status
// (404 checks, access-guard logic, …) keep working.
function toMeaningfulError(error: any): Error {
  const response = error?.response;
  if (response) {
    const status: number = response.status;
    let message = '';
    const data = response.data;
    // DRF validation payloads: {field: [msg]} or {detail: msg}
    if (data) {
      if (typeof data === 'string') message = data;
      else if (data.detail) message = String(data.detail);
      else if (typeof data === 'object') {
        message = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : String(msgs)}`)
          .join('; ');
      }
    }
    if (status === 400) return Object.assign(new Error(message || 'Invalid request. Please check the submitted values.'), { response });
    if (status === 401) return Object.assign(new Error(message || 'Your session has expired. Please log in again.'), { response });
    if (status === 403) return Object.assign(new Error(message || 'You do not have permission to perform this action.'), { response });
    if (status === 404) return Object.assign(new Error(message || 'Not found.'), { response });
    if (status >= 500) return Object.assign(new Error(message || 'Server error. Please try again later.'), { response });
    return Object.assign(new Error(message || `Request failed (${status}).`), { response });
  }
  const code = error?.code || '';
  const isTimeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT'
    || /timeout( of)? \d+ms/i.test(error?.message || '');
  if (isTimeout) {
    return Object.assign(new Error(`Request timed out after ${API_TIMEOUT_MS / 1000}s. The server did not respond in time.`), { code });
  }
  return Object.assign(new Error('Network error — could not reach the server. Check your connection and try again.'), { code });
}

apiClient.interceptors.request.use((config) => {
  const isAuthEndpoint = /\/accounts\/(login|refresh)\/?$/.test(config.url || '');
  const token = localStorage.getItem('access_token');
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let axios auto-set Content-Type for FormData (includes multipart boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = /\/accounts\/(login|refresh|logout)\/?$/.test(originalRequest?.url || '');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${baseURL}/accounts/refresh/`, {}, { withCredentials: true, timeout: API_TIMEOUT_MS });
        const refreshedAccessToken = refreshResponse.data.access;
        if (!refreshedAccessToken) {
          throw new Error('Refresh response did not include an access token');
        }
        localStorage.setItem('access_token', refreshedAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Only hard-redirect to /login from protected routes.
        // Public pages (/, /services) must NOT be redirected on expired/missing sessions.
        const publicPaths = ['/', '/services', '/login', '/forgot-password', '/reset-password'];
        const currentPath = window.location.pathname;
        const isPublicPage = publicPaths.includes(currentPath) || currentPath === '/';
        if (!isPublicPage && currentPath !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(toMeaningfulError(error));
  }
);

export const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiCall = async <T>(operation: () => T, customDelay?: number): Promise<T> => {
  await delay(customDelay);
  try {
    const result = operation();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};
