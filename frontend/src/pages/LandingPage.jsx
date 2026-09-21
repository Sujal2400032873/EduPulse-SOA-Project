import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Award, CalendarCheck2, FileText, 
  ShieldCheck, Users, ArrowRight, CheckCircle2, 
  Building, BookOpen, Clock, Globe, Shield 
} from 'lucide-react';
import InstitutionalControlBar from '../components/common/InstitutionalControlBar';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col selection:bg-primary selection:text-white">
      
      {/* Top National Accreditation Strip */}
      <div className="bg-primary-900 text-white text-[11px] py-1 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-amber-400">{t('naacTag')}</span>
            <span className="text-slate-400 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 hidden sm:inline">{t('nirfTag')}</span>
            <span className="text-slate-400 hidden md:inline">&bull;</span>
            <span className="text-slate-400 hidden md:inline">Autonomous Institution</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <Shield className="w-3.5 h-3.5" /> {t('digiLocker')}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">AISHE: U-0842</span>
          </div>
        </div>
      </div>

      {/* Tricolor National Stripe */}
      <div className="tricolor-stripe" />

      {/* Navigation Header - Fully Solid Sticky with High Z-Index to Prevent Overlap */}
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-inst-sm shrink-0">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-base text-ink-primary tracking-tight block leading-tight">
                EduPulse <span className="text-primary font-bold">Academy</span>
              </span>
              <p className="text-[10px] text-ink-muted font-medium hidden sm:block">
                विद्ययाऽमृतमश्नुते &bull; Information Systems Portal
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-ink-secondary">
            <a href="#about" className="hover:text-primary transition">About</a>
            <a href="#features" className="hover:text-primary transition">Academic Modules</a>
            <a href="#campuses" className="hover:text-primary transition">Campuses</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <InstitutionalControlBar />
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{t('signIn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative overflow-hidden bg-surface border-b border-surface-border py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-primary tracking-tight leading-tight">
                Student Information &amp; Academic Performance Platform
              </h1>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-2xl font-normal">
                Official institutional portal for students, faculty, and academic administration. Access centralized student records, automated classroom attendance logging, and verifiable semester transcripts on a 10.0 CBCS grading scale.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-inst transition flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('signInBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="px-6 py-3 rounded-lg bg-surface-soft hover:bg-surface-alt border border-surface-border text-ink-secondary text-xs sm:text-sm font-semibold transition"
                >
                  Explore Modules
                </a>
              </div>

              {/* Statistics Band */}
              <div className="pt-5 border-t border-surface-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                <div className="p-3 rounded-lg bg-surface-soft border border-surface-border">
                  <div className="text-2xl font-black text-primary">35,000+</div>
                  <div className="text-xs text-ink-secondary font-medium mt-0.5">Enrolled Scholars</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-surface-border">
                  <div className="text-2xl font-black text-primary">99.4%</div>
                  <div className="text-xs text-ink-secondary font-medium mt-0.5">Retention Rate</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-surface-border">
                  <div className="text-2xl font-black text-primary">4 Campuses</div>
                  <div className="text-xs text-ink-secondary font-medium mt-0.5">Bengaluru &bull; NCR &bull; Hyd</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-surface-border">
                  <div className="text-2xl font-black text-primary">10.0 Scale</div>
                  <div className="text-xs text-ink-secondary font-medium mt-0.5">SGPA / CGPA Engine</div>
                </div>
              </div>
            </div>

            {/* Right Campus Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-surface-border shadow-inst-lg bg-surface-card">
                <img
                  src="/assets/indian_campus_hero.jpg"
                  alt="EduPulse National Academy Campus"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-surface/95 backdrop-blur-md border border-surface-border shadow-md text-ink-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-primary">Bengaluru Knowledge Campus</div>
                      <div className="text-[11px] text-ink-muted">Main Academic &amp; Research Facility</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      NAAC A++
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Academic Modules Grid */}
      <section id="features" className="py-14 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Institutional Modules
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight mt-1">
              Purpose-Built for Students, Faculty &amp; Administration
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-2">
              Integrated academic records, real-time attendance monitoring, and verifiable semester grade reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="inst-card p-6 inst-card-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                Student Profile Administration
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Centralized student demographics, permanent registration numbers (PRN), semester enrolments, and branch allocations across academic departments.
              </p>
              <ul className="text-xs text-ink-muted space-y-1.5 pt-2 border-t border-surface-border">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> Roll Number &amp; Branch Directory
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> Multi-Campus Student Cohorts
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="inst-card p-6 inst-card-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                Automated Attendance Tracking
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Subject-wise lecture and laboratory attendance logging with automatic institutional compliance warnings for students below 75% attendance.
              </p>
              <ul className="text-xs text-ink-muted space-y-1.5 pt-2 border-t border-surface-border">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> Safe (&ge;85%), Monitor, &amp; Shortage (&lt;75%)
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> Faculty Batch Entry Console
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="inst-card p-6 inst-card-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                Consolidated Transcripts &amp; CGPA
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Real-time composite transcript evaluation aggregating internal marks, midterm, and end-semester scores into 10.0 scale SGPA/CGPA with CoE verification.
              </p>
              <ul className="text-xs text-ink-muted space-y-1.5 pt-2 border-t border-surface-border">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> 10.0 Scale Letter Grades (O, A+, A)
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> Print-Ready Official Grade Sheets
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Institutional Network & Campuses */}
      <section id="campuses" className="py-14 bg-surface border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Autonomous University Network
              </span>
              <h2 className="text-2xl font-extrabold text-ink-primary mt-1">
                Multi-Campus Information Systems
              </h2>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              Access Your Campus Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="inst-card p-5 space-y-2">
              <div className="text-xs font-bold text-primary">Bengaluru Knowledge Campus</div>
              <div className="text-xs text-ink-secondary">Karnataka &bull; Main Headquarters</div>
              <div className="text-[11px] text-status-success font-semibold pt-2 border-t border-surface-border">B.Tech CSE, AI &amp; DS</div>
            </div>

            <div className="inst-card p-5 space-y-2">
              <div className="text-xs font-bold text-primary">Delhi NCR Campus</div>
              <div className="text-xs text-ink-secondary">New Delhi &bull; Technology Center</div>
              <div className="text-[11px] text-status-success font-semibold pt-2 border-t border-surface-border">B.Tech IT &amp; Systems</div>
            </div>

            <div className="inst-card p-5 space-y-2">
              <div className="text-xs font-bold text-primary">Hyderabad Cyber Campus</div>
              <div className="text-xs text-ink-secondary">Telangana &bull; Innovation Hub</div>
              <div className="text-[11px] text-status-success font-semibold pt-2 border-t border-surface-border">B.Tech AI &amp; ML</div>
            </div>

            <div className="inst-card p-5 space-y-2">
              <div className="text-xs font-bold text-primary">Pune Tech Campus</div>
              <div className="text-xs text-ink-secondary">Maharashtra &bull; Engineering Wing</div>
              <div className="text-[11px] text-status-success font-semibold pt-2 border-t border-surface-border">B.Tech ECE &amp; Robotics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-surface-border py-6 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-primary">&copy; 2026 EduPulse Academy Information Systems.</span>
            <span>&bull; All Rights Reserved</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-ink-secondary">
            <span className="hover:text-primary cursor-pointer">Academic Regulations</span>
            <span className="hover:text-primary cursor-pointer">DigiLocker / NAD</span>
            <span className="hover:text-primary cursor-pointer">Grievance Portal</span>
            <span className="text-status-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" /> System Active
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
