import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  GraduationCap, Lock, User, Eye, EyeOff, 
  ArrowRight, ShieldCheck, AlertCircle, Shield, 
  Sparkles, CheckCircle2, KeyRound, Building, UserPlus 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import InstitutionalControlBar from '../../components/common/InstitutionalControlBar';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpired(true);
    }
  }, [location]);

  // Real verified backend credentials seeded in database
  const demoProfiles = [
    {
      id: 'admin',
      label: 'Administrator',
      name: 'System Admin',
      username: 'admin',
      password: 'Admin123',
      role: 'ADMIN',
      icon: Shield,
    },
    {
      id: 'faculty',
      label: 'Faculty / HOD',
      name: 'Faculty Member',
      username: 'faculty1',
      password: 'Password@123',
      role: 'FACULTY',
      icon: Building,
    },
    {
      id: 'student',
      label: 'Student (Aarav)',
      name: 'Aarav Sharma',
      username: 'STU1001',
      password: 'Student@123',
      role: 'STUDENT',
      icon: GraduationCap,
    },
    {
      id: 'student-aditya',
      label: 'Student (Aditya)',
      name: 'Aditya Kumar',
      username: '2400032152',
      password: 'Student@123',
      role: 'STUDENT',
      icon: GraduationCap,
    },
    {
      id: 'student-priya',
      label: 'Student (Priya)',
      name: 'Priya Patel',
      username: 'STU2026',
      password: 'Student@123',
      role: 'STUDENT',
      icon: GraduationCap,
    }
  ];

  const handleSelectDemo = (demo) => {
    setMode('login');
    setSelectedDemo(demo.id);
    setUsername(demo.username);
    setPassword(demo.password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both your Roll No / Username and password.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const user = await login({
          username: username.trim(),
          password: password.trim(),
        });

        toastSuccess(`Welcome back, ${user.username}!`, 'Authenticated');

        // Redirect based on role
        if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'FACULTY') {
          navigate('/faculty', { replace: true });
        } else {
          navigate('/student', { replace: true });
        }
      } else {
        // Register Student
        if (!email.trim()) {
          setError('Email is required for registration.');
          setLoading(false);
          return;
        }

        const user = await register({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        });

        toastSuccess(`Student account for ${user.username} successfully registered!`, 'Registration Complete');
        navigate('/student', { replace: true });
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
      toastError(msg, mode === 'login' ? 'Authentication Failed' : 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-between selection:bg-primary selection:text-white transition-colors duration-200">
      
      {/* Top Accreditation & Government Framework Bar */}
      <div className="bg-primary-900 text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-amber-400">NAAC A++ (CGPA 3.82)</span>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 hidden sm:inline">NIRF Ranked #1 Autonomous University</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="text-slate-400">AISHE: U-0842</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-300 flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5" /> DigiLocker &amp; NAD Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tricolor National Stripe */}
      <div className="tricolor-stripe" />

      {/* Top Controls Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex justify-between items-center">
        <Link to="/" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          &larr; Institutional Homepage
        </Link>
        <InstitutionalControlBar />
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          
          {/* Institution Crest */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-inst mb-3">
              <GraduationCap className="w-8 h-8 text-amber-400" />
            </Link>
            <h1 className="text-2xl font-extrabold text-ink-primary tracking-tight">
              EduPulse <span className="text-primary font-bold">Academy</span>
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Student Information &amp; Academic Performance Management Platform
            </p>
          </div>

          {/* Card */}
          <div className="inst-card p-6 sm:p-8 bg-surface space-y-5 border border-surface-border rounded-2xl shadow-xl">
            
            <div className="border-b border-surface-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  {mode === 'login' ? 'Institutional SSO Login' : 'Student Self-Registration'}
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  {mode === 'login' 
                    ? 'Authenticate with your university-issued credentials' 
                    : 'Create a new verified student scholar profile'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary-50 text-primary border border-primary-200">
                {mode === 'login' ? <KeyRound className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex border border-surface-border rounded-xl p-1 bg-surface-soft">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'login' ? 'bg-surface text-primary shadow-sm' : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'register' ? 'bg-surface text-primary shadow-sm' : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                New Student Register
              </button>
            </div>

            {/* Quick Demo Pre-seed Selection Chips (in login mode) */}
            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    Quick Roles (Live Database Users)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Accounts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {demoProfiles.map((demo) => {
                    const Icon = demo.icon;
                    const isSelected = selectedDemo === demo.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => handleSelectDemo(demo)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs ${
                          isSelected 
                            ? 'border-primary ring-2 ring-primary/20 bg-primary-50/70 font-bold' 
                            : 'border-surface-border bg-surface-soft hover:bg-surface-alt'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-ink-primary truncate">{demo.label}</span>
                        </div>
                        <div className="text-[10px] text-ink-muted truncate font-mono">
                          {demo.username}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Session Expired Banner */}
            {sessionExpired && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium">Your academic session has expired. Please log in again to continue.</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Institutional Username / Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin, faculty1, STU1001"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@edupulse.edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink-primary cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-[10px] text-ink-muted mt-1">Must be at least 8 characters.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Secure Request...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Academic Console' : 'Create Student Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-surface-border text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] text-ink-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected by SHA-256 JWT Authentication &amp; RBAC Gateway</span>
              </div>
            </div>

          </div>

          <p className="text-center text-[11px] text-ink-muted mt-6">
            Official Academic ERP &bull; EduPulse Academy SOA Enterprise Platform &bull; Session 2025–26
          </p>

        </div>
      </div>

    </div>
  );
}
