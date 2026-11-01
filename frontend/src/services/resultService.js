import api from './api';

export const resultService = {
  // Get all academic results with optional semester and subjectCode filters
  getAll: async (params = {}) => {
    return await api.get('/results', { params });
  },

  // Get single result by numeric ID
  getById: async (id) => {
    return await api.get(`/results/${id}`);
  },

  // Record a single academic result
  create: async (resultData) => {
    return await api.post('/results', resultData);
  },

  // Alias for create to support existing imports
  addResult: async (resultData) => {
    return await api.post('/results', resultData);
  },

  // Batch record results
  createBatch: async (resultsList) => {
    return await api.post('/results/batch', resultsList);
  },

  // Alias for createBatch to support existing imports
  addBatchResults: async (resultsList) => {
    return await api.post('/results/batch', resultsList);
  },

  // Update existing result by numeric ID
  update: async (id, resultData) => {
    return await api.put(`/results/${id}`, resultData);
  },

  // Delete result by numeric ID
  delete: async (id) => {
    return await api.delete(`/results/${id}`);
  },

  // Get results for a specific student
  getByStudent: async (studentId, semester = null) => {
    const params = semester ? { semester } : {};
    return await api.get(`/results/student/${encodeURIComponent(studentId)}`, { params });
  },

  // Alias for getByStudent
  getResultsByStudentId: async (studentId) => {
    return await api.get(`/results/student/${encodeURIComponent(studentId)}`);
  },

  // Get official semester transcript and cumulative CGPA
  getTranscript: async (studentId) => {
    return await api.get(`/results/student/${encodeURIComponent(studentId)}/transcript`);
  },

  // Aggregate statistics across academic results
  getStats: async () => {
    return await api.get('/results/stats');
  },

  // Student portal: self results
  getMyResults: async (semester = null) => {
    const params = semester ? { semester } : {};
    return await api.get('/results/me', { params });
  },

  // Student portal: self transcript
  getMyTranscript: async () => {
    return await api.get('/results/me/transcript');
  },

  // Health check
  getHealth: async () => {
    return await api.get('/results/health');
  }
};

export default resultService;
