import axios from 'axios';

// Normalize base URL to ensure /api prefix is present and not duplicated
const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
let baseURL = '/api';

if (rawBase) {
  const trimmed = rawBase.replace(/\/+$/, '');
  baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edupulse_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors & 401 session expiry
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Auto-logout on 401
      if (status === 401) {
        localStorage.removeItem('edupulse_token');
        localStorage.removeItem('edupulse_user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login?expired=true';
        }
      }

      let message = data?.message || data?.error;
      if (!message && typeof data === 'object' && data !== null) {
        const values = Object.values(data).filter((v) => typeof v === 'string');
        if (values.length > 0) message = values.join(', ');
      }
      if (!message) {
        message = typeof data === 'string' && data.length < 200 ? data : `Request failed with status ${status}`;
      }

      const customErr = new Error(message);
      customErr.status = status;
      customErr.data = data;
      return Promise.reject(customErr);
    } else if (error.request) {
      return Promise.reject(
        new Error(`Network error: Unable to communicate with the Gateway at ${baseURL}. Please verify services are running.`)
      );
    }
    return Promise.reject(error);
  }
);

export { baseURL };
export default api;
