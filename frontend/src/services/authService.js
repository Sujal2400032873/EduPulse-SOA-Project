import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  verifyToken: async () => {
    return await api.get('/auth/verify');
  },

  getCurrentUserFromServer: async () => {
    return await api.get('/auth/me');
  },

  getAllUsers: async (params = {}) => {
    return await api.get('/auth/users', { params });
  },

  createUserByAdmin: async (userData) => {
    return await api.post('/auth/users', userData);
  },

  getHealth: async () => {
    return await api.get('/auth/health');
  },

  logout: () => {
    localStorage.removeItem('edupulse_token');
    localStorage.removeItem('edupulse_user');
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('edupulse_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('edupulse_token');
  },

  setSession: (token, user) => {
    if (token) localStorage.setItem('edupulse_token', token);
    if (user) localStorage.setItem('edupulse_user', JSON.stringify(user));
  }
};

export default authService;
