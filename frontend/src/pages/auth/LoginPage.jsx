import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, Lock, User, Eye, EyeOff, 
  ArrowRight, ShieldCheck, AlertCircle, Shield, 
  Sparkles, CheckCircle2, KeyRound, Building 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import InstitutionalControlBar from '../../components/common/InstitutionalControlBar';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  // Quick Demo Pre-seed Profiles
  const demoProfiles = [
    {
      id: 'student',
      label: 'Student Scholar',
      name: 'Aditya Senpai (21BCE10250)',
      username: 'klu250',
      password: 'password',
      role: 'STUDENT',
      icon: GraduationCap,
      color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900'
    },
    {
      id: 'faculty',
      label: 'Faculty / HOD',
      name: 'Prof. Ananya Sengupta (HOD CSE)',
      username: 'faculty',
      password: 'faculty123',
      role: 'FACULTY',
      icon: Building,
      color: 'border-blue-300 bg-blue-50/70 text-blue-900'
    },
    {
      id: 'admin',
      label: 'Institutional Admin',
      name: 'Dr. R. K. Sharma (Registrar)',
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN',
      icon: Shield,
      color: 'border-amber-300 bg-amber-50/70 text-amber-900'
    }
  ];

  const handleSelectDemo = (demo) => {
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
      const user = await login({
        username: username.trim(),
        password: password.trim(),
      });

      // Strict role-based navigation based on backend JWT claims
      if (user.role === 'STUDENT') {
        navigate('/student', { replace: true });
      } else if (user.role === 'FACULTY') {
        navigate('/faculty', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your institutional credentials.');
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
            <span className="font-semibold text-amber-400">{t('naacTag')}</span>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 hidden sm:inline">{t('nirfTag')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="text-slate-400">AISHE: U-0842</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-300 flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5" /> {t('digiLocker')}
            </span>
          </div>
        </div>
      </div>

      {/* Tricolor National Stripe */}
      <div className="tricolor-stripe" />

      {/* Top Controls Bar on Login Screen */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex justify-between items-center">
        <Link to="/" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          &larr; Institutional Homepage
        </Link>
        <InstitutionalControlBar />
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          
          {/* Institution Crest & Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-inst mb-3">
              <GraduationCap className="w-8 h-8 text-amber-400" />
            </Link>
            <h1 className="text-2xl font-extrabold text-ink-primary tracking-tight">
              EduPulse <span className="text-secondary">Academy</span>
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              {t('motto')}
            </p>
          </div>

          {/* Card */}
          <div className="inst-card p-6 sm:p-8 bg-surface space-y-5">
            
            <div className="border-b border-surface-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  {t('ssoTitle')}
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  {t('ssoSubtitle')}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary-50 text-primary border border-primary-200">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>

            {/* Quick Demo Pre-seed Selection Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  {t('quickDemoLabel')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">1-Click Auto-Fill</span>
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
                      className={`p-2.5 rounded-lg border text-left transition cursor-pointer text-xs ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20 bg-primary-50/60 font-bold' 
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

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  {t('usernameLabel')}
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
                    placeholder={t('rollPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-ink-secondary">
                    {t('passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink-primary cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary border-surface-border rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-ink-muted cursor-pointer">
                  {t('rememberMe')}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('signInBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-surface-border text-center text-[11px] text-ink-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Spring Cloud Gateway &bull; BCrypt Secured &bull; HS256 JWT</span>
            </div>

          </div>

        </div>
      </div>

      {/* Forgot Password Institutional Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-surface-border shadow-inst-lg p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Shield className="w-5 h-5" />
              <span>Password Assistance &amp; Recovery</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              In accordance with National Academic Security Regulations, password reset for institutional accounts (Roll Numbers &amp; Faculty IDs) must be authorized through your Departmental Academic Coordinator or Office of the Registrar.
            </p>
            <div className="text-[11px] p-2.5 rounded bg-surface-soft border border-surface-border text-ink-muted font-mono">
              Registrar Helpdesk: registrar@edupulse.ac.in &bull; Ext: 4021
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
            >
              Understood &bull; Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-ink-muted border-t border-surface-border bg-surface">
        &copy; 2026 EduPulse Academy Information Systems &bull; National Academic Depository (NAD) Compliant
      </footer>

    </div>
  );
}
