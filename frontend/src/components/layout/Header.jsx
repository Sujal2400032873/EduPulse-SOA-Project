import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Bell, User as UserIcon, LogOut, Shield, Building, 
  ChevronDown, Search, ExternalLink, CheckCircle2, Menu 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import InstitutionalControlBar from '../common/InstitutionalControlBar';

export default function Header({ onToggleMobile }) {
  const { user, logout, isStudent, isFaculty, isAdmin } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead } = useApp();
  const { t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="site-header ep-header w-full">
      {/* Top Accreditation & Government Framework Bar */}
      <div className="bg-primary-900 text-white text-[11px] py-1 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-amber-400" title="University NAAC Institutional Accreditation Grade (Score 3.82 / 4.00, not individual student CGPA)">
              {t('naacTag')}
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-300">NIRF Ranked #1 Autonomous University System</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">AISHE: U-0842</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <Shield className="w-3.5 h-3.5" /> DigiLocker &amp; NAD Integrated
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">ISO 9001:2015 Certified</span>
          </div>
        </div>
      </div>

      {/* Tricolor National Stripe */}
      <div className="tricolor-stripe" />

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={onToggleMobile}
                className="md:hidden p-2 rounded-xl text-ink-secondary hover:text-primary hover:bg-surface-alt transition border border-surface-border cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Brand Identity */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-inst-sm shrink-0">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-ink-primary font-sans">
                    EduPulse <span className="text-primary font-bold">Academy</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
                    ERP
                  </span>
                </div>
                <p className="text-[10px] text-ink-muted font-medium hidden sm:block">
                  {t('motto')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme & Language Controls */}
            <InstitutionalControlBar />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-ink-secondary hover:text-primary hover:bg-surface-alt transition border border-transparent hover:border-surface-border cursor-pointer"
                title="Institutional Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-danger" />
                )}
              </button>

              {/* Notification Popover */}
              {notifOpen && (
                <div className="inst-dropdown absolute right-0 mt-2 w-80 sm:w-96 rounded-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-surface-border flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-primary uppercase tracking-wide">
                      Academic Circulars &amp; Alerts
                    </span>
                    <span className="text-[10px] font-semibold text-secondary">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-surface-border">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-surface-soft ${
                          !n.read ? 'bg-primary-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-ink-primary">{n.title}</span>
                          <span className="text-[10px] text-ink-light whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-ink-secondary mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-2 border-t border-surface-border text-center">
                    <Link
                      to={isStudent ? '/student/notifications' : '/admin'}
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      View All Institutional Notices
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg border border-surface-border hover:border-primary-300 hover:bg-surface-soft transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-ink-primary leading-tight truncate max-w-[140px]">
                      {user?.fullName || user?.username}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isAdmin ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        isFaculty ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {user?.role}
                      </span>
                      {user?.studentId && (
                        <span className="text-[10px] text-ink-muted font-mono">
                          &bull; {user.studentId}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                </button>

                {profileOpen && (
                  <div className="inst-dropdown absolute right-0 mt-2 w-64 rounded-xl py-2">
                    <div className="px-4 py-2.5 border-b border-surface-border">
                      <div className="text-xs font-bold text-ink-primary">{user?.fullName || user?.username}</div>
                      <div className="text-[11px] text-ink-muted truncate">{user?.email}</div>
                      <div className="mt-1 text-[11px] text-primary font-medium flex items-center gap-1">
                        <span>{user?.campus || 'Bengaluru Knowledge Campus'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isStudent && (
                        <>
                          <Link
                            to="/student/profile"
                            onClick={() => setProfileOpen(false)}
                            className="px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft flex items-center gap-2"
                          >
                            <UserIcon className="w-3.5 h-3.5" /> My Academic Profile
                          </Link>
                          <Link
                            to="/student/attendance"
                            onClick={() => setProfileOpen(false)}
                            className="px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Record
                          </Link>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft flex items-center gap-2"
                          >
                            <Shield className="w-3.5 h-3.5" /> Administration Console
                          </Link>
                          <Link
                            to="/admin/students"
                            onClick={() => setProfileOpen(false)}
                            className="px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft flex items-center gap-2"
                          >
                            <UserIcon className="w-3.5 h-3.5" /> Student Directory
                          </Link>
                        </>
                      )}
                      {isFaculty && (
                        <>
                          <Link
                            to="/faculty"
                            onClick={() => setProfileOpen(false)}
                            className="px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft flex items-center gap-2"
                          >
                            <Building className="w-3.5 h-3.5" /> Faculty Dashboard
                          </Link>
                          <Link
                            to="/faculty/marks"
                            onClick={() => setProfileOpen(false)}
                            className="px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Marks Management
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-surface-border pt-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-status-danger hover:bg-rose-500/15 flex items-center gap-2 font-medium cursor-pointer transition"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out of Portal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-1.5"
              >
                Sign In to Portal
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
