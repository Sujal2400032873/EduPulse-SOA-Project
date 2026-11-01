import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Shared / Dynamic Pages
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/StudentsPage';
import AttendancePage from '../pages/AttendancePage';
import ResultsPage from '../pages/ResultsPage';
import SoapLookupPage from '../pages/SoapLookupPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDirectoryPage from '../pages/admin/StudentDirectoryPage';
import UsersPage from '../pages/admin/UsersPage';
import ServiceRegistryPage from '../pages/admin/ServiceRegistryPage';
import SystemHealthPage from '../pages/admin/SystemHealthPage';

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import AttendanceManagement from '../pages/faculty/AttendanceManagement';
import MarksManagement from '../pages/faculty/MarksManagement';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentAttendancePage from '../pages/student/AttendancePage';
import StudentResultsPage from '../pages/student/ResultsPage';
import AnalyticsPage from '../pages/student/AnalyticsPage';
import NotificationsPage from '../pages/student/NotificationsPage';

export default function AppRoutes() {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'FACULTY') return '/faculty';
    return '/student';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to={getHomeRoute()} replace /> : <LoginPage />}
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Top-Level Protected Academic Routes inside Unified Institutional Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Core Direct Paths specified in Phase 6 */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/students"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <StudentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/students/new"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <StudentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <StudentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/students/:id/edit"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <StudentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <AttendancePage />
            </RoleRoute>
          }
        />
        <Route
          path="/results"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <ResultsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route path="/soap-lookup" element={<SoapLookupPage />} />
        <Route
          path="/services"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <ServiceRegistryPage />
            </RoleRoute>
          }
        />
        <Route
          path="/health"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <SystemHealthPage />
            </RoleRoute>
          }
        />
        <Route path="/profile" element={<StudentProfile />} />

        {/* Student Portal Sub-Routes */}
        <Route path="/student">
          <Route
            index
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="profile"
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentProfile />
              </RoleRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentAttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="results"
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentResultsPage />
              </RoleRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <AnalyticsPage />
              </RoleRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <NotificationsPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Faculty Portal Sub-Routes */}
        <Route path="/faculty">
          <Route
            index
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <FacultyDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <AttendanceManagement />
              </RoleRoute>
            }
          />
          <Route
            path="marks"
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <MarksManagement />
              </RoleRoute>
            }
          />
          <Route
            path="students"
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <StudentDirectoryPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Admin Portal Sub-Routes */}
        <Route path="/admin">
          <Route
            index
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="students"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <StudentDirectoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="users"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="services"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <ServiceRegistryPage />
              </RoleRoute>
            }
          />
          <Route
            path="health"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <SystemHealthPage />
              </RoleRoute>
            }
          />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
