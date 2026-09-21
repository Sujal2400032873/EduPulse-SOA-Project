import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import AttendancePage from '../pages/student/AttendancePage';
import ResultsPage from '../pages/student/ResultsPage';
import AnalyticsPage from '../pages/student/AnalyticsPage';
import NotificationsPage from '../pages/student/NotificationsPage';

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import AttendanceManagement from '../pages/faculty/AttendanceManagement';
import MarksManagement from '../pages/faculty/MarksManagement';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDirectoryPage from '../pages/admin/StudentDirectoryPage';
import ServiceRegistryPage from '../pages/admin/ServiceRegistryPage';
import SystemHealthPage from '../pages/admin/SystemHealthPage';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'FACULTY' ? '/faculty' : '/student'} replace /> : <LoginPage />} />

      {/* Protected Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Protected Faculty Portal */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="attendance" element={<AttendanceManagement />} />
        <Route path="marks" element={<MarksManagement />} />
        <Route path="students" element={<StudentDirectoryPage />} />
      </Route>

      {/* Protected Administrator Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentDirectoryPage />} />
        <Route path="services" element={<ServiceRegistryPage />} />
        <Route path="health" element={<SystemHealthPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
