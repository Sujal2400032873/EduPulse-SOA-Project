import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import FacultyDashboard from './faculty/FacultyDashboard';
import StudentDashboard from './student/StudentDashboard';

export default function DashboardPage() {
  const { user, isAdmin, isFaculty, isStudent } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }
  if (isFaculty) {
    return <FacultyDashboard />;
  }
  return <StudentDashboard />;
}
