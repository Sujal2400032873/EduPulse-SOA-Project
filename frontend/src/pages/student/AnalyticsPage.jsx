import React from 'react';
import { 
  BarChart3, TrendingUp, Award, CalendarCheck2, 
  CheckCircle2, AlertCircle, BookOpen, Star, ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Semester Progression: SGPA vs CGPA
  const progressionData = [
    { semester: 'Sem I', sgpa: 8.80, cgpa: 8.80, attendance: 96.4 },
    { semester: 'Sem II', sgpa: 9.00, cgpa: 8.90, attendance: 94.2 },
    { semester: 'Sem III', sgpa: 9.20, cgpa: 9.00, attendance: 91.8 },
    { semester: 'Sem IV', sgpa: 9.10, cgpa: 9.03, attendance: 95.0 },
    { semester: 'Sem V', sgpa: 9.30, cgpa: 9.12, attendance: 93.6 },
    { semester: 'Sem VI', sgpa: 9.40, cgpa: 9.18, attendance: 89.5 },
  ];

  // Subject Domain Competency Radar
  const radarData = [
    { subject: 'Algorithms', score: 94, fullMark: 100 },
    { subject: 'Databases', score: 92, fullMark: 100 },
    { subject: 'Cloud & Microservices', score: 96, fullMark: 100 },
    { subject: 'Operating Systems', score: 88, fullMark: 100 },
    { subject: 'Networks', score: 90, fullMark: 100 },
    { subject: 'Practical Labs', score: 96, fullMark: 100 },
  ];

  // Grade Distribution
  const gradeData = [
    { name: 'Grade O (10 pts)', count: 4, fill: '#0B3C8C' },
    { name: 'Grade A+ (9 pts)', count: 2, fill: '#1456A0' },
    { name: 'Grade A (8 pts)', count: 0, fill: '#2563EB' },
  ];

  // Credit Progression
  const creditData = [
    { semester: 'Sem I', credits: 22 },
    { semester: 'Sem II', credits: 22 },
    { semester: 'Sem III', credits: 20 },
    { semester: 'Sem IV', credits: 20 },
    { semester: 'Sem V', credits: 20 },
    { semester: 'Sem VI', credits: 20 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Academic &amp; Performance Analytics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/25">
              Continuous Evaluation Metric
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Predictive performance modeling &bull; Longitudinal CGPA Trajectory &bull; Subject Mastery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Honors Program Eligible</span>
          </span>
        </div>
      </div>

      {/* Summary Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Strong Subjects Card */}
        <div className="inst-card p-4 border-l-4 border-l-status-success space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-status-success uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Primary Academic Strengths
            </span>
            <span className="text-[10px] text-ink-muted">Grade O (Score &gt;90%)</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Consistently exceptional performance observed in <strong>Cloud &amp; Microservices Architecture (96%)</strong> and <strong>Design &amp; Analysis of Algorithms (94%)</strong>. High aptitude for distributed systems and asynchronous event-driven design.
          </p>
        </div>

        {/* Subjects Requiring Attention */}
        <div className="inst-card p-4 border-l-4 border-l-primary space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              Focus &amp; Growth Recommendations
            </span>
            <span className="text-[10px] text-ink-muted">Grade A+ (Score 80-89%)</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            While <strong>Operating Systems (88%)</strong> is securely in First Class with Distinction, scoring in low-level kernel concurrency assignments can be elevated through practical scheduler simulations to reach Grade O.
          </p>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Longitudinal SGPA vs CGPA Trajectory */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Multi-Semester SGPA vs CGPA Growth
              </h2>
              <p className="text-xs text-ink-muted">Evolution from Semester I through VI</p>
            </div>
            <span className="text-xs font-mono font-bold text-primary">CGPA: 9.18</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={11} />
                <YAxis domain={[8.0, 10.0]} stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="sgpa" name="Semester SGPA" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#0B3C8C" strokeWidth={2.5} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance vs Academic Performance Correlation */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Classroom Attendance Correlation (%)
              </h2>
              <p className="text-xs text-ink-muted">Attendance percentage logged across academic semesters</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">All &gt;75%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={11} />
                <YAxis domain={[60, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
                />
                <Bar dataKey="attendance" name="Attendance %" fill="#1456A0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Subject Mastery Radar */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Curricular Competency Radar
              </h2>
              <p className="text-xs text-ink-muted">Subject-wise percentage score distribution</p>
            </div>
            <span className="text-xs font-semibold text-primary">Mean: 92.7%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" stroke="#334155" fontSize={11} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#94A3B8" fontSize={9} />
                <Radar name="Performance Index" dataKey="score" stroke="#0B3C8C" fill="#2563EB" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Cumulative Degree Credit Completion */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Degree Credit Completion
              </h2>
              <p className="text-xs text-ink-muted">124 Credits completed out of 160 required for B.Tech Degree</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">77.5% Complete</span>
          </div>

          <div className="h-64 w-full flex flex-col justify-center">
            <div className="space-y-4 px-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Completed: 124 Credits</span>
                  <span>Required: 160 Credits</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '77.5%' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-surface-border">
                  <div className="text-ink-muted">Remaining Semesters</div>
                  <div className="text-lg font-bold text-ink-primary mt-0.5">2 Semesters</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">Sem VII &amp; Sem VIII (Capstone)</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-soft border border-surface-border">
                  <div className="text-ink-muted">Credits Remaining</div>
                  <div className="text-lg font-bold text-primary mt-0.5">36 Credits</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">Major Project (12) + 6 Electives</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
