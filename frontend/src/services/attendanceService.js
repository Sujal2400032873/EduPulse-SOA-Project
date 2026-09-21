import api from './api';

export const attendanceService = {
  getStudentSummary: async (studentId) => {
    return await api.get(`/attendance/student/${studentId}`);
  },

  getStudentRecords: async (studentId) => {
    return await api.get(`/attendance/student/${studentId}/records`);
  },

  recordSingle: async (record) => {
    return await api.post('/attendance', record);
  },

  recordBatch: async (records) => {
    return await api.post('/attendance/batch', records);
  },

  getStats: async () => {
    return await api.get('/attendance/stats');
  },

  getRecordsByDate: async (date) => {
    return await api.get(`/attendance/date/${date}`);
  }
};
