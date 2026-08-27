// Clean API client configuration for Handoverly AI

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Token storage in memory to avoid XSS token theft via localStorage.
// The refresh token is securely stored in an HttpOnly cookie by the backend.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const apiClient = {
    async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...((options.headers as Record<string, string>) || {})
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
            credentials: 'omit', // Default omit, will be overridden for auth routes
        };

        let response;
        try {
            response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        } catch (error: any) {
            // Silently throw to avoid polluting console when backend is offline
            throw new Error('Backend unavailable');
        }
        
        // Handle 401 Unauthorized globally (e.g., refresh token flow could be added here)
        if (response.status === 401 && endpoint !== '/accounts/login/') {
            // Note: simple implementation, could emit an event to context to log out
            setAccessToken(null);
        }

        if (!response.ok) {
            throw response;
        }

        // 204 No Content has no body
        if (response.status === 204 || response.status === 205) {
            return null;
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            throw new Error('API returned an unexpected response. Check the API URL.');
        }
    },

    async get(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    async post(endpoint: string, data: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

export const checkHealth = async () => {
    return await apiClient.get('/health/');
};
