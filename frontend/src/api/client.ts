import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
        const refreshResponse = await axios.post(`${baseURL}/accounts/refresh/`, {}, { withCredentials: true });
        const refreshedAccessToken = refreshResponse.data.access;
        if (!refreshedAccessToken) {
          throw new Error('Refresh response did not include an access token');
        }
        localStorage.setItem('access_token', refreshedAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
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
