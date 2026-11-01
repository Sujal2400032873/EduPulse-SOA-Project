import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, User, CalendarCheck2, Award,
  Users, Server, Activity, CheckSquare, Shield,
  ChevronRight, GraduationCap, Binary, UserCog,
  BarChart3, Bell, Layers, Workflow, Network
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { isStudent, isFaculty, isAdmin, user } = useAuth();

  // Student Modules & Sub-modules
  const studentModuleGroups = [
    {
      moduleTitle: 'Academic Core',
      moduleIcon: GraduationCap,
      items: [
        { to: '/student', label: 'Academic Dashboard', icon: LayoutDashboard, end: true },
        { to: '/student/profile', label: 'Scholar Profile', icon: User },
        { to: '/student/attendance', label: 'Attendance Register', icon: CalendarCheck2 },
        { to: '/student/results', label: 'Grades & Transcript', icon: Award },
      ],
    },
    {
      moduleTitle: 'Performance & Notices',
      moduleIcon: BarChart3,
      items: [
        { to: '/student/analytics', label: 'Performance Analytics', icon: BarChart3 },
        { to: '/student/notifications', label: 'Institutional Circulars', icon: Bell },
      ],
    },
    {
      moduleTitle: 'SOA Architecture',
      moduleIcon: Network,
      items: [
        { to: '/soap-lookup', label: 'SOAP 1.1 WSDL Lookup', icon: Binary },
      ],
    },
  ];

  // Faculty Modules & Sub-modules
  const facultyModuleGroups = [
    {
      moduleTitle: 'Instruction & Roster',
      moduleIcon: LayoutDashboard,
      items: [
        { to: '/faculty', label: 'Faculty Dashboard', icon: LayoutDashboard, end: true },
        { to: '/students', label: 'Student Directory', icon: Users },
      ],
    },
    {
      moduleTitle: 'Attendance & Examination',
      moduleIcon: CheckSquare,
      items: [
        { to: '/attendance', label: 'Attendance Management', icon: CheckSquare },
        { to: '/results', label: 'Marks & Grading Entry', icon: Award },
      ],
    },
    {
      moduleTitle: 'SOA Interoperability',
      moduleIcon: Binary,
      items: [
        { to: '/soap-lookup', label: 'SOAP 1.1 WSDL Lookup', icon: Binary },
      ],
    },
  ];

  // Admin Modules & Sub-modules
  const adminModuleGroups = [
    {
      moduleTitle: 'Central Governance',
      moduleIcon: Shield,
      items: [
        { to: '/admin', label: 'Administration Console', icon: LayoutDashboard, end: true },
        { to: '/students', label: 'Student Management', icon: Users },
        { to: '/users', label: 'User Administration', icon: UserCog },
      ],
    },
    {
      moduleTitle: 'Academic Operations',
      moduleIcon: CheckSquare,
      items: [
        { to: '/attendance', label: 'Attendance Audit', icon: CheckSquare },
        { to: '/results', label: 'Results & Transcripts', icon: Award },
      ],
    },
    {
      moduleTitle: 'SOA Mesh & Infrastructure',
      moduleIcon: Server,
      items: [
        { to: '/services', label: 'Eureka Service Registry', icon: Server },
        { to: '/health', label: 'System Health Telemetry', icon: Activity },
        { to: '/soap-lookup', label: 'SOAP 1.1 WSDL Lookup', icon: Binary },
      ],
    },
  ];

  const moduleGroups = isStudent
    ? studentModuleGroups
    : isFaculty
    ? facultyModuleGroups
    : adminModuleGroups;

  const roleTitle = isAdmin
    ? 'Central Administration'
    : isFaculty
    ? 'Faculty & Examination'
    : 'Student Scholar';

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {/* Brand Mini Mark */}
      <div className="ep-brand-mini mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-inst-sm shrink-0">
          <GraduationCap className="w-6 h-6 text-amber-400" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold tracking-wide text-ink-primary">EduPulse</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted truncate">
            Academic SOA OS
          </div>
        </div>
      </div>

      {/* Role Card */}
      <div className="ep-role-card mb-4 p-3 rounded-xl bg-surface-soft border border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Shield size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-[0.16em] text-ink-muted">Active Role</div>
            <div className="mt-0.5 truncate text-xs font-bold text-primary">{roleTitle}</div>
            <div className="text-[10px] text-ink-secondary truncate font-mono">
              @{user?.username || 'user'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Modules & Sub-Modules */}
      <nav className="space-y-4 flex-1">
        {moduleGroups.map((group, groupIdx) => {
          const GroupIcon = group.moduleIcon;
          return (
            <div key={groupIdx} className="space-y-1">
              <div className="px-2 pb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                <GroupIcon size={12} className="text-primary/70" />
                <span>{group.moduleTitle}</span>
              </div>

              <div className="space-y-1 pl-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-primary text-white shadow-inst-sm'
                            : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Platform Status Footer Card */}
      <div className="mt-auto pt-4 border-t border-surface-border">
        <div className="p-3 rounded-xl bg-surface-soft border border-surface-border text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-ink-primary">SOA Mesh Online</span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-muted font-mono">
            Eureka: 8761 &bull; Gateway: 8080 &bull; DB: 5433
          </p>
          <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-ink-muted font-mono">
            <span>Storage</span>
            <span className="text-primary font-bold">PostgreSQL [ERP]</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col bg-surface border-r border-surface-border min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] bg-surface h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
