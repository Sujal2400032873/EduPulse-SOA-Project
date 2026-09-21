import React, { useState } from 'react';
import { 
  GraduationCap, Lock, User, Mail, Building, ArrowRight, 
  Award, CheckCircle, Sparkles, BookOpen, Shield, Globe, Users, TrendingUp 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [campus, setCampus] = useState('Bengaluru Knowledge Campus');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          username: username.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          campus,
          studentId: role === 'STUDENT' ? (studentId.trim() || username.trim()) : null,
        });
        setSuccessMsg('Profile registered successfully! Logging into portal...');
      } else {
        await login({ 
          username: username.trim(), 
          password: password.trim() 
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication request failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col overflow-x-hidden selection:bg-saffron-500 selection:text-slate-950">
      
      {/* Top National Accreditation Ticker */}
      <div className="bg-[#050912] border-b border-slate-800 text-[11px] text-slate-300 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-saffron-400">NAAC A++ Grade Accredited (CGPA 3.82)</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:inline text-slate-300">NIRF Ranked #1 University Systems</span>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-slate-400">UGC &amp; AICTE Autonomous Institution</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> DigiLocker &amp; NAD Verified
            </span>
            <span className="text-slate-600">&bull;</span>
            <span>AISHE: U-0842</span>
          </div>
        </div>
      </div>

      {/* Tricolor National Stripe */}
      <div className="tricolor-stripe" />

      {/* Main Two-Column Enterprise Portal */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: Authentic Indian Campus Architecture & Accolades */}
        <div className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-12 overflow-hidden">
          {/* Authentic Indian Campus Image Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url('/assets/indian_campus_hero.jpg')` }}
          />
          {/* Multi-tier gradient overlay for readability and depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060c18]/95 via-[#081426]/85 to-[#0b1b38]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-transparent to-black/50" />

          {/* Dynamic ambient saffron & royal glow */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-saffron-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top: University Emblem & Motto */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-saffron-500 via-amber-400 to-yellow-600 p-0.5 shadow-glow-gold flex items-center justify-center">
                <div className="w-full h-full bg-[#081220] rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-saffron-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-wider text-white uppercase font-sans">
                  EduPulse <span className="text-saffron-400">National Academy</span>
                </span>
                <p className="text-[11px] text-amber-300 font-medium tracking-widest uppercase">
                  विद्ययाऽमृतमश्नुते &bull; Institute of National Importance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-saffron-500/30 backdrop-blur-md text-xs text-saffron-300 font-semibold shadow-sm">
              <Award className="w-4 h-4 text-saffron-400" />
              <span>NIRF Top 10 Ranking</span>
            </div>
          </div>

          {/* Center: Prestige Headline & Accolade Highlights */}
          <div className="relative z-10 my-auto py-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-500/15 border border-saffron-500/40 text-saffron-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-saffron-400" />
              Central Academic ERP &amp; Examination Management System
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-2xl">
              Nurturing India's Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 via-amber-300 to-yellow-400">Innovators</span> &amp; Leaders.
            </h2>

            <p className="mt-4 text-sm xl:text-base text-slate-300 max-w-xl leading-relaxed">
              Unified institutional portal automating daily lecture attendance, internal assessments, semester grade computations, and official NAD-compliant academic transcripts across educational campuses.
            </p>

            {/* Floating Accolade Cards with gentle motion */}
            <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl">
              {/* Card 1 */}
              <div className="glass-card p-4 rounded-2xl border border-slate-700/70 shadow-prestigious animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-saffron-500/20 border border-saffron-500/40 flex items-center justify-center text-saffron-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">NAAC A++</div>
                    <div className="text-xs text-slate-300 font-medium">CGPA 3.82 / 4.0</div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Highest grade conferred by National Assessment &amp; Accreditation Council.
                </p>
              </div>

              {/* Card 2 */}
              <div className="glass-card p-4 rounded-2xl border border-slate-700/70 shadow-prestigious animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">35,000+</div>
                    <div className="text-xs text-slate-300 font-medium">Scholars Enrolled</div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Across Bengaluru, Delhi NCR, Hyderabad &amp; Pune technical campuses.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-saffron-400" /> Biometric / Daily Attendance
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> 10.0 Scale SGPA / CGPA
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-400" /> DigiLocker Ready
              </span>
            </div>
            <div>&copy; 2026 EduPulse Academy Higher Education</div>
          </div>
        </div>

        {/* RIGHT COLUMN: Executive Portal Sign In */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative z-10 bg-[#08101e]">
          {/* Ambient light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-md w-full mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 p-0.5 shadow-glow-gold mb-3">
                <div className="w-full h-full bg-[#08101e] rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-saffron-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                EduPulse <span className="text-saffron-400">National Academy</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                NAAC A++ Autonomous Institute &bull; Academic Portal
              </p>
            </div>

            {/* Form Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isRegister ? 'New Student / Faculty Registration' : 'Student & Faculty Portal Login'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRegister 
                  ? 'Complete enrollment to generate your official university credentials and course registration.' 
                  : 'Enter your Roll Number / Institutional Username and Password to access your dashboard.'}
              </p>
            </div>

            {/* Segmented Switcher */}
            <div className="flex rounded-xl bg-slate-900/90 p-1.5 border border-slate-800 mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isRegister 
                    ? 'bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-glow-gold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isRegister 
                    ? 'bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-glow-gold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register Account
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-pulse-subtle">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 font-medium">{successMsg}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aditya Senpai / Priya Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aditya@edupulse.ac.in"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        System Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none transition"
                      >
                        <option value="STUDENT">Student Scholar</option>
                        <option value="FACULTY">Faculty / Professor</option>
                        <option value="ADMIN">Controller of Exams / Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Assigned Campus
                      </label>
                      <select
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none transition"
                      >
                        <option value="Bengaluru Knowledge Campus">Bengaluru Knowledge Campus</option>
                        <option value="Delhi NCR Campus">Delhi NCR Campus</option>
                        <option value="Hyderabad Cyber Campus">Hyderabad Cyber Campus</option>
                        <option value="Pune Tech Hub">Pune Tech Hub</option>
                      </select>
                    </div>
                  </div>

                  {role === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Permanent Roll No / Student ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="e.g. 21BCE10250, 250, STU-1001"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Roll No / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. klu250, student, faculty, admin"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs tracking-wide shadow-glow-gold hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? 'Enroll & Register Profile' : 'Access Institutional Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Institutional Security Notice */}
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-1">
                <Shield className="w-4 h-4 text-saffron-400" />
                <span className="font-semibold text-slate-300">National Academic Information Portal</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Accredited under National Institute Framework &bull; Integrated with DigiLocker and National Academic Depository (NAD)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
