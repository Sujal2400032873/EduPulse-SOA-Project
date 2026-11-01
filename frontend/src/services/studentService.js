import api from './api';

export const studentService = {
  // Query students with optional keyword and department
  getAll: async (params = {}) => {
    return await api.get('/students', { params });
  },

  // Get student by numeric DB primary key ID
  getById: async (id) => {
    return await api.get(`/students/${id}`);
  },

  // Get student by institutional studentId (e.g., STU1001)
  getByStudentId: async (studentId) => {
    return await api.get(`/students/student-id/${encodeURIComponent(studentId)}`);
  },

  // Check student existence
  checkExists: async (studentId) => {
    return await api.get(`/students/${encodeURIComponent(studentId)}/exists`);
  },

  // Create student profile
  create: async (studentData) => {
    return await api.post('/students', studentData);
  },

  // Update student profile by numeric ID
  update: async (id, studentData) => {
    return await api.put(`/students/${id}`, studentData);
  },

  // Delete student by numeric ID
  delete: async (id) => {
    return await api.delete(`/students/${id}`);
  },

  // Get student aggregate stats
  getStats: async () => {
    return await api.get('/students/stats');
  },

  // Get authenticated student's own profile
  getMyProfile: async () => {
    return await api.get('/students/me');
  },

  // Update authenticated student's own profile
  updateMyProfile: async (studentData) => {
    return await api.put('/students/me', studentData);
  },

  // Orchestrated Saga enrollment workflow
  orchestratedEnroll: async (studentData, simulateFailure = false) => {
    return await api.post('/students/orchestration/enroll', studentData, {
      params: { simulateFailure }
    });
  },

  // Health check
  getHealth: async () => {
    return await api.get('/students/health');
  }
};

export default studentService;
