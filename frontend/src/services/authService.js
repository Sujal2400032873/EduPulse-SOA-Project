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

  getAllUsers: async () => {
    return await api.get('/auth/users');
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
  }
};
