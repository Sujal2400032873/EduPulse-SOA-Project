import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Award, CalendarCheck2, 
  CheckCircle2, AlertCircle, BookOpen, Star, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { resultService } from '../../services/resultService';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [profRes, transRes, resList, attRes] = await Promise.allSettled([
        studentService.getMyProfile(),
        resultService.getMyTranscript(),
        resultService.getMyResults(),
        attendanceService.getMyPercentage(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      }
      if (transRes.status === 'fulfilled' && transRes.value) {
        setTranscript(transRes.value);
      }
      if (resList.status === 'fulfilled' && Array.isArray(resList.value)) {
        setResultsList(resList.value);
      }
      if (attRes.status === 'fulfilled' && attRes.value) {
        setAttendance(attRes.value);
      }
    } catch (err) {
      addToast('Error loading live performance analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1. Dynamic Semester Progression computed from real transcript
  const progressionData = (transcript?.semesters || []).map((sem) => ({
    semester: `Sem ${sem.semester}`,
    sgpa: Number(sem.sgpa) || 0,
    cgpa: Number(transcript.cgpa) || Number(sem.sgpa) || 0,
    credits: sem.earnedCredits || sem.totalCredits || 0,
  }));

  // 2. Dynamic Grade Distribution computed from real results
  const gradeCounts = {};
  resultsList.forEach((r) => {
    const g = r.grade || 'N/A';
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });

  const gradeColors = {
    'O': '#0B3C8C',
    'A+': '#1456A0',
    'A': '#2563EB',
    'B+': '#3B82F6',
    'B': '#60A5FA',
    'C': '#93C5FD',
    'F': '#EF4444',
  };

  const gradeData = Object.keys(gradeCounts).map((grade) => ({
    name: `Grade ${grade}`,
    count: gradeCounts[grade],
    fill: gradeColors[grade] || '#0B3C8C',
  }));

  // 3. Dynamic Subject Performance list
  const sortedSubjects = [...resultsList].sort((a, b) => (Number(b.marks) || 0) - (Number(a.marks) || 0));
  const topSubjects = sortedSubjects.slice(0, 3);
  const lowestSubjects = sortedSubjects.length > 3 ? sortedSubjects.slice(-2).reverse() : [];

  const overallAttendance = attendance?.percentage !== undefined ? Number(attendance.percentage).toFixed(1) : '—';
  const overallCgpa = transcript?.cgpa ? Number(transcript.cgpa).toFixed(2) : '—';
  const totalCredits = transcript?.earnedCredits || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Academic &amp; Performance Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
              Live Evaluation Metrics &bull; PostgreSQL
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Student: <strong className="text-ink-primary">{profile?.name || user?.username}</strong> ({profile?.studentId || user?.username}) &bull; Dept: {profile?.department || 'Engineering'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="inst-card p-4 space-y-1 border-l-2 border-l-primary">
          <div className="text-xs font-semibold text-ink-muted">Cumulative CGPA</div>
          <div className="text-2xl font-black text-ink-primary">{overallCgpa}</div>
          <div className="text-[11px] text-emerald-700 font-medium">10-Point Grading Scale</div>
        </div>

        <div className="inst-card p-4 space-y-1 border-l-2 border-l-emerald-600">
          <div className="text-xs font-semibold text-ink-muted">Attendance Standing</div>
          <div className="text-2xl font-black text-ink-primary">{overallAttendance}%</div>
          <div className="text-[11px] text-ink-muted">
            {Number(overallAttendance) >= 75 ? 'Statutory Minimum Met' : 'Shortage Warning (<75%)'}
          </div>
        </div>

        <div className="inst-card p-4 space-y-1 border-l-2 border-l-indigo-600">
          <div className="text-xs font-semibold text-ink-muted">Credits Earned</div>
          <div className="text-2xl font-black text-ink-primary">{totalCredits}</div>
          <div className="text-[11px] text-ink-muted">Validated by Examination Cell</div>
        </div>

        <div className="inst-card p-4 space-y-1 border-l-2 border-l-amber-600">
          <div className="text-xs font-semibold text-ink-muted">Graded Courses</div>
          <div className="text-2xl font-black text-ink-primary">{resultsList.length}</div>
          <div className="text-[11px] text-ink-muted">Across all completed terms</div>
        </div>
      </div>

      {/* Summary Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Subjects Card */}
        <div className="inst-card p-5 border-l-4 border-l-emerald-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Primary Academic Strengths
            </span>
            <span className="text-[10px] text-ink-muted font-mono">Highest Marks</span>
          </div>
          {topSubjects.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {topSubjects.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-xs">
                  <span className="text-ink-secondary truncate max-w-[220px]">
                    <strong>{s.subjectCode}</strong>: {s.subjectName}
                  </span>
                  <span className="font-bold text-primary">{s.marks}% (Grade {s.grade})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">No graded course records registered yet.</p>
          )}
        </div>

        {/* Subjects for Review */}
        <div className="inst-card p-5 border-l-4 border-l-primary space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              Course Performance Trajectory
            </span>
            <span className="text-[10px] text-ink-muted font-mono">Curricular Records</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed pt-1">
            Academic standing is actively monitored across semesters. Maintaining regular attendance in laboratory and theory modules directly reinforces SGPA trajectory towards degree completion with honors.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SGPA Progression Chart */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-ink-primary">Semester-wise SGPA Progression</h3>
              <p className="text-xs text-ink-muted">Grade point trajectory across registered terms</p>
            </div>
            <Award className="w-4 h-4 text-primary" />
          </div>

          {progressionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sgpa" stroke="#0B3C8C" strokeWidth={2.5} name="SGPA" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-ink-muted">
              No semester examination records recorded yet.
            </div>
          )}
        </div>

        {/* Grade Distribution Chart */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-ink-primary">Grade Distribution Breakdown</h3>
              <p className="text-xs text-ink-muted">Letter grades earned across all subjects</p>
            </div>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>

          {gradeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0B3C8C" radius={[4, 4, 0, 0]} name="Subjects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-ink-muted">
              No grade distribution data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
