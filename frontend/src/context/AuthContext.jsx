import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = (r) => {
    if (!r) return 'STUDENT';
    const clean = r.toUpperCase().replace('ROLE_', '');
    if (clean === 'ADMIN') return 'ADMIN';
    if (clean === 'FACULTY') return 'FACULTY';
    return 'STUDENT';
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = authService.getToken();
    const storedUser = authService.getCurrentUser();

    if (token) {
      try {
        const validation = await authService.verifyToken();
        if (validation && validation.valid) {
          const normRole = normalizeRole(validation.role || storedUser?.role);
          const userData = {
            ...(storedUser || {}),
            id: validation.id || storedUser?.id || null,
            username: validation.username || storedUser?.username || 'User',
            email: validation.email || storedUser?.email || `${validation.username || 'user'}@edupulse.edu`,
            role: normRole,
            studentId: normRole === 'STUDENT' ? (validation.username || storedUser?.username) : null,
          };
          setUser(userData);
          authService.setSession(token, userData);
        } else {
          authService.logout();
          setUser(null);
        }
      } catch (err) {
        // If server is unreachable or token expired
        if (err.status === 401) {
          authService.logout();
          setUser(null);
        } else if (storedUser) {
          setUser(storedUser);
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const token = response.token || response.accessToken;
    const normRole = normalizeRole(response.role);

    const userData = {
      id: response.id || null,
      username: response.username,
      email: response.email || `${response.username}@edupulse.edu`,
      role: normRole,
      studentId: normRole === 'STUDENT' ? response.username : null,
    };

    authService.setSession(token, userData);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await authService.register(formData);
    // After register, automatically log in with credentials
    return await login({
      username: formData.username,
      password: formData.password
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
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

export default AuthContext;
