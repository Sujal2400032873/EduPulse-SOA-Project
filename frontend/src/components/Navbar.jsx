import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  CalendarCheck2, 
  Award, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Server, 
  Shield, 
  User as UserIcon,
  ChevronDown,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MicroserviceStatusModal from './MicroserviceStatusModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, isAdmin, isFaculty, isStudent } = useAuth();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    ...(isAdmin ? [{ id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard }] : []),
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'attendance', label: 'Attendance Tracking', icon: CalendarCheck2 },
    { id: 'results', label: 'Marks & Grading', icon: Award },
    { id: 'transcript', label: 'Academic Transcript', icon: FileText },
    { id: 'design-thinking', label: 'Design Thinking & Rubrics', icon: Shield },
  ];

  return (
    <>
      {/* Top National Accreditation Strip */}
      <div className="bg-[#050a14] border-b border-slate-800 text-[10px] text-slate-400 py-1 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-saffron-400">NAAC A++ (CGPA 3.82)</span>
            <span className="text-slate-600">&bull;</span>
            <span>NIRF Ranked #1 Institute of Higher Learning</span>
            <span className="text-slate-600">&bull;</span>
            <span>AICTE &amp; UGC Autonomous Institute</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-emerald-400 font-medium">DigiLocker / NAD Compliant</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">AISHE Code: U-0842</span>
          </div>
        </div>
      </div>

      {/* Tricolor National Stripe */}
      <div className="tricolor-stripe" />

      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070e1c]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'students')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500 to-amber-600 p-0.5 shadow-glow-gold">
                <div className="w-full h-full bg-[#081220] rounded-[10px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-saffron-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    EduPulse <span className="text-saffron-400 font-semibold">National Academy</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-saffron-500/10 text-saffron-300 border border-saffron-500/30">
                    NAAC A++
                  </span>
                </div>
                <p className="text-[10px] text-amber-300/80 hidden sm:block">
                  विद्ययाऽमृतमश्नुते &bull; Central Academic ERP &amp; Examination Portal
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              
              {/* System Architecture Button */}
              <button
                onClick={() => setStatusModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-750 text-xs font-medium transition shadow-sm cursor-pointer"
                title="View Institutional Service Architecture"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Server className="w-3.5 h-3.5 text-gold-400" />
                <span className="hidden lg:inline">Architecture</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold-500 to-amber-700 flex items-center justify-center text-slate-950 text-xs font-extrabold shadow-sm">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {user?.fullName || user?.username}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded uppercase ${
                        isAdmin ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30' :
                        isFaculty ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {user?.role}
                      </span>
                      {user?.campus && (
                        <span className="text-[10px] text-slate-400 hidden xl:inline">
                          · {user.campus}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl border border-slate-800 py-1.5 shadow-2xl z-50">
                    <div className="px-3.5 py-2 border-b border-slate-800/80">
                      <div className="text-xs font-semibold text-white">{user?.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      {user?.campus && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <Building className="w-3 h-3 text-brand-400" />
                          {user.campus}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Mobile navigation bar */}
          <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/60 overflow-x-auto gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                    isActive ? 'text-brand-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label.split(' ')[0]}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Eureka Mesh Status Modal */}
      <MicroserviceStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </>
  );
}
