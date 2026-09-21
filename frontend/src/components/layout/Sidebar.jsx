import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, User, CalendarCheck2, Award,
  BarChart3, Bell, Users, Server, Activity,
  CheckSquare, Shield, ChevronRight, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { isStudent, isFaculty, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student', label: 'Academic Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/profile', label: 'Student Profile', icon: User },
    { to: '/student/attendance', label: 'Attendance Tracking', icon: CalendarCheck2 },
    { to: '/student/results', label: 'Consolidated Grades', icon: Award },
    { to: '/student/analytics', label: 'Performance Analytics', icon: BarChart3 },
    { to: '/student/notifications', label: 'Notices & Circulars', icon: Bell },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Faculty Dashboard', icon: LayoutDashboard, end: true },
    { to: '/faculty/attendance', label: 'Attendance Management', icon: CheckSquare },
    { to: '/faculty/marks', label: 'Marks & Grading Entry', icon: Award },
    { to: '/faculty/students', label: 'Student Directory', icon: Users },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Administration Console', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Student Management', icon: Users },
    { to: '/admin/services', label: 'Institutional Services', icon: Server },
    { to: '/admin/health', label: 'System Performance & Health', icon: Activity },
  ];

  const links = isStudent ? studentLinks : isFaculty ? facultyLinks : adminLinks;
  const roleTitle = isAdmin
    ? 'Central Administration'
    : isFaculty
      ? 'Faculty & Examination'
      : 'Student Academic';

  return (
    <aside className="ep-sidebar w-64 shrink-0 hidden md:flex flex-col p-4">
      <div className="ep-brand-mini mb-5">
        <div className="ep-brand-mark">
          <GraduationCap size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-extrabold tracking-wide text-ink-primary">EduPulse</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-muted truncate">Academic OS</div>
        </div>
      </div>

      <div className="ep-role-card mb-5">
        <div className="flex items-center gap-2.5">
          <div className="ep-role-icon"><Shield size={14} /></div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.16em] text-ink-muted">Workspace</div>
            <div className="mt-0.5 truncate text-[11px] font-bold text-primary">{roleTitle}</div>
          </div>
        </div>
      </div>

      <div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">Navigation</div>

      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `ep-sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              <ChevronRight className="ep-nav-arrow w-3.5 h-3.5" />
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="ep-system-card">
          <div className="flex items-center gap-2">
            <span className="ep-live-dot" />
            <span className="text-[10px] font-bold text-emerald-300">Platform Operational</span>
          </div>
          <p className="mt-2 text-[9px] leading-4 text-ink-muted">
            Academic services are connected through the EduPulse service mesh.
          </p>
          <div className="mt-3 flex justify-between text-[8px] uppercase tracking-wider text-ink-muted">
            <span>Session</span>
            <span>2025–26</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
