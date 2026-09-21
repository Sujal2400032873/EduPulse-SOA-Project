import api from './api';

export const studentService = {
  getAll: async (params = {}) => {
    return await api.get('/students', { params });
  },

  getById: async (studentId) => {
    return await api.get(`/students/${studentId}`);
  },

  checkExists: async (studentId) => {
    return await api.get(`/students/${studentId}/exists`);
  },

  create: async (studentData) => {
    return await api.post('/students', studentData);
  },

  update: async (studentId, studentData) => {
    return await api.put(`/students/${studentId}`, studentData);
  },

  delete: async (studentId) => {
    return await api.delete(`/students/${studentId}`);
  },

  getStats: async () => {
    return await api.get('/students/stats');
  }
};
