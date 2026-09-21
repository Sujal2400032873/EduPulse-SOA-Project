import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeSemester, setActiveSemester] = useState('Semester 6');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [toasts, setToasts] = useState([]);

  // Initial institutional announcements and alerts
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'End-Semester Results Declared',
      message: 'Controller of Examinations has published consolidated grades for Even Semester 2025-2026.',
      type: 'success',
      timestamp: '10 mins ago',
      read: false,
    },
    {
      id: 2,
      title: 'DigiLocker & NAD Sync Completed',
      message: 'Official academic credentials are now verified with the National Academic Depository.',
      type: 'info',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'Mandatory 75% Attendance Compliance',
      message: 'Students are advised to review subject-wise attendance before end-term hall ticket generation.',
      type: 'warning',
      timestamp: '1 day ago',
      read: true,
    }
  ]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeSemester,
        setActiveSemester,
        academicYear,
        setAcademicYear,
        notifications,
        unreadCount,
        markNotificationAsRead,
        toasts,
        addToast,
      }}
    >
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-inst-md text-xs font-medium border flex items-center gap-2.5 transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-300'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-primary-50 text-primary-900 border-primary-200'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === 'success'
                  ? 'bg-emerald-600'
                  : toast.type === 'error'
                  ? 'bg-rose-600'
                  : toast.type === 'warning'
                  ? 'bg-amber-600'
                  : 'bg-primary-600'
              }`}
            />
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
