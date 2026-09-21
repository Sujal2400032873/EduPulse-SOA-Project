import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = authService.getToken();
    const storedUser = authService.getCurrentUser();

    if (token && storedUser) {
      setUser(storedUser);
      try {
        const validation = await authService.verifyToken();
        if (validation && validation.valid) {
          setUser((prev) => ({
            ...prev,
            username: validation.username || prev.username,
            role: validation.role || prev.role,
            studentId: validation.studentId || prev.studentId,
          }));
        }
      } catch {
        // keep stored user if offline/transient error
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const userData = {
      id: response.id,
      username: response.username,
      fullName: response.fullName,
      email: response.email,
      role: response.role, // 'STUDENT' | 'FACULTY' | 'ADMIN'
      campus: response.campus,
      studentId: response.studentId || (response.role === 'STUDENT' ? response.username : null),
    };

    localStorage.setItem('edupulse_token', response.token);
    localStorage.setItem('edupulse_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const userProfile = {
      id: response.id,
      username: response.username,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
      campus: response.campus,
      studentId: response.studentId || (response.role === 'STUDENT' ? response.username : null),
    };

    localStorage.setItem('edupulse_token', response.token);
    localStorage.setItem('edupulse_user', JSON.stringify(userProfile));
    setUser(userProfile);
    return userProfile;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isStudent,
        isFaculty,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
