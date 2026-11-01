import api from './api';

export const attendanceService = {
  // Get all attendance records with optional studentId, subject, date filters
  getAll: async (params = {}) => {
    return await api.get('/attendance', { params });
  },

  // Get attendance by numeric ID
  getById: async (id) => {
    return await api.get(`/attendance/${id}`);
  },

  // Record a single attendance entry
  recordSingle: async (record) => {
    return await api.post('/attendance', record);
  },

  // Record batch attendance
  recordBatch: async (records) => {
    return await api.post('/attendance/batch', records);
  },

  // Update existing attendance record
  update: async (id, record) => {
    return await api.put(`/attendance/${id}`, record);
  },

  // Delete attendance record
  delete: async (id) => {
    return await api.delete(`/attendance/${id}`);
  },

  // Get attendance records for a specific student
  getByStudent: async (studentId, subject = null) => {
    const params = subject ? { subject } : {};
    return await api.get(`/attendance/student/${encodeURIComponent(studentId)}`, { params });
  },

  // Get student attendance summary and percentage breakdown
  getPercentage: async (studentId) => {
    return await api.get(`/attendance/student/${encodeURIComponent(studentId)}/percentage`);
  },

  // Get records by calendar date
  getByDate: async (date) => {
    return await api.get(`/attendance/date/${date}`);
  },

  // Aggregate stats across all attendance
  getStats: async () => {
    return await api.get('/attendance/stats');
  },

  // Student portal: self attendance records
  getMyAttendance: async (subject = null) => {
    const params = subject ? { subject } : {};
    return await api.get('/attendance/me', { params });
  },

  // Student portal: self attendance percentage
  getMyPercentage: async () => {
    return await api.get('/attendance/me/percentage');
  },

  // Health check
  getHealth: async () => {
    return await api.get('/attendance/health');
  }
};

export default attendanceService;
