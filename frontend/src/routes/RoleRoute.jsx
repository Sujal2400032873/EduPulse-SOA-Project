import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to their respective authorized home
    if (user?.role === 'STUDENT') return <Navigate to="/student" replace />;
    if (user?.role === 'FACULTY') return <Navigate to="/faculty" replace />;
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
