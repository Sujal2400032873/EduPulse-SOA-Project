import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
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
      
      // Auto-logout on token expiration
      if (status === 401) {
        localStorage.removeItem('edupulse_token');
        localStorage.removeItem('edupulse_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login?expired=true';
        }
      }

      const message = 
        data?.error || 
        data?.message || 
        (typeof data === 'string' && data.length < 150 ? data : `Request failed with status code ${status}`);
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error: Unable to communicate with the academic server.'));
    }
    return Promise.reject(error);
  }
);

export default api;
