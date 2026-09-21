import api from './api';

export const resultService = {
  getTranscript: async (studentId, semester) => {
    const params = semester ? { semester } : {};
    return await api.get(`/results/student/${studentId}/transcript`, { params });
  },

  getResultsByStudentId: async (studentId) => {
    return await api.get(`/results/student/${studentId}`);
  },

  getAllResults: async () => {
    return await api.get('/results');
  },

  addResult: async (resultData) => {
    return await api.post('/results', resultData);
  },

  addBatchResults: async (resultsList) => {
    return await api.post('/results/batch', resultsList);
  },

  getStats: async () => {
    return await api.get('/results/stats');
  }
};
