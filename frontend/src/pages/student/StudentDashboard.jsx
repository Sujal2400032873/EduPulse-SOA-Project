import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, CalendarCheck2, BookOpen, CheckCircle2, 
  TrendingUp, AlertTriangle, ArrowRight, User, Shield, Download, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { resultService } from '../../services/resultService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [resultsList, setResultsList] = useState([]);

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  const loadStudentDashboard = async () => {
    setLoading(true);
    try {
      const [profRes, attRes, transRes, resList] = await Promise.allSettled([
        studentService.getMyProfile(),
        attendanceService.getMyPercentage(),
        resultService.getMyTranscript(),
        resultService.getMyResults()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      }
      if (attRes.status === 'fulfilled' && attRes.value) {
        setAttendance(attRes.value);
      }
      if (transRes.status === 'fulfilled' && transRes.value) {
        setTranscript(transRes.value);
      }
      if (resList.status === 'fulfilled' && Array.isArray(resList.value)) {
        setResultsList(resList.value);
      }

      // Robust fallback query if /me endpoints returned empty
      const sId = user?.studentId || user?.username;
      if (sId) {
        if (!profRes.value) {
          try {
            const p = await studentService.getByStudentId(sId);
            if (p) setProfile(p);
          } catch (ignored) {}
        }
        if (!attRes.value) {
          try {
            const a = await attendanceService.getPercentage(sId);
            if (a) setAttendance(a);
          } catch (ignored) {}
        }
        if (!transRes.value) {
          try {
            const t = await resultService.getTranscript(sId);
            if (t) setTranscript(t);
          } catch (ignored) {}
        }
      }
    } catch (err) {
      addToast('Error loading student academic records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Build real chart data from semesters in transcript
  const semesterChartData = transcript?.semesters?.map((sem) => ({
    name: `Sem ${sem.semester}`,
    sgpa: Number(sem.sgpa) || 0,
    credits: sem.earnedCredits || 0,
  })) || [];

  // Build real subject marks chart data
  const subjectChartData = resultsList.map((res) => ({
    name: res.subjectCode || res.subjectName?.substring(0, 10),
    fullName: res.subjectName,
    marks: Number(res.marks) || 0,
    maxMarks: Number(res.maxMarks) || 100,
  }));

  const cgpaDisplay = transcript?.cgpa ? Number(transcript.cgpa).toFixed(2) : '—';
  const attendanceDisplay = attendance?.percentage !== undefined ? `${Number(attendance.percentage).toFixed(1)}%` : '—';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Student Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-inst-sm">
            {profile?.name?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-primary">
                {profile?.name || user?.fullName || user?.username || 'Student Scholar'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Enrolled Scholar
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted mt-1">
              <span>PRN / Roll No: <strong className="text-ink-secondary font-mono">{profile?.studentId || user?.username}</strong></span>
              <span>&bull;</span>
              <span>Department: <strong className="text-ink-secondary">{profile?.department || 'Computer Science'}</strong></span>
              <span>&bull;</span>
              <span>Academic Year: <strong className="text-ink-secondary">Year {profile?.year || '—'}, Sec {profile?.section || '—'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/results"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm"
          >
            <Award className="w-4 h-4" />
            <span>Official Grade Card</span>
          </Link>
          <Link
            to="/student/attendance"
            className="px-4 py-2 rounded-xl border border-surface-border bg-surface-soft hover:bg-surface-hover text-ink-primary text-xs font-bold transition flex items-center gap-1.5"
          >
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Attendance Details</span>
          </Link>
        </div>
      </div>

      {/* Real KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cumulative CGPA */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Cumulative CGPA</span>
            <div className="p-2 rounded-lg bg-blue-50 text-primary">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${cgpaDisplay} / 10.0`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Result Service Verified &bull; 10.0 Scale</span>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Overall Attendance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : attendanceDisplay}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>{attendance?.presentClasses || 0} / {attendance?.totalClasses || 0} Sessions Present</span>
          </div>
        </div>

        {/* Degree Credits */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Credits Earned</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${transcript?.earnedCredits || 0} / ${transcript?.totalCredits || 0}`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>{transcript?.totalSubjects || 0} Evaluated Courses</span>
          </div>
        </div>

        {/* Academic Standing */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Academic Standing</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Shield size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : (transcript?.failedSubjects === 0 ? 'Passed' : transcript?.failedSubjects > 0 ? 'Backlog' : 'Active')}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>{transcript?.failedSubjects || 0} Subject Arrears</span>
          </div>
        </div>

      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Semester SGPA Chart */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Semester-wise SGPA Progression
              </h2>
              <p className="text-xs text-ink-muted">Actual semester grade point averages from transcript</p>
            </div>
            <span className="text-xs font-bold text-primary font-mono">CGPA: {cgpaDisplay}</span>
          </div>

          <div className="h-64 w-full">
            {semesterChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semesterChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                  <XAxis dataKey="name" stroke="#69758A" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#69758A" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E4E9F2', fontSize: '12px' }} 
                  />
                  <Line type="monotone" dataKey="sgpa" name="Semester SGPA" stroke="#3157D5" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-muted">
                {loading ? 'Loading academic transcript...' : 'No semester transcripts recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Subject Marks Breakdown */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Subject Evaluation Marks
              </h2>
              <p className="text-xs text-ink-muted">Marks scored per registered course</p>
            </div>
            <Link to="/student/results" className="text-xs font-semibold text-primary hover:underline">
              Full Transcript &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                  <XAxis dataKey="name" stroke="#69758A" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#69758A" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E4E9F2', fontSize: '12px' }} 
                  />
                  <Bar dataKey="marks" name="Marks Obtained" fill="#6574CD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-muted">
                {loading ? 'Loading subject scores...' : 'No subject assessment records logged.'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Current Evaluated Courses Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Official Course Evaluations
            </h2>
            <p className="text-xs text-ink-muted">Academic marks computed and certified by Result Service</p>
          </div>
          <Link
            to="/student/results"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Detailed View &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Semester</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {resultsList.length > 0 ? (
                resultsList.map((res) => (
                  <tr key={res.id}>
                    <td className="font-mono font-bold text-primary">{res.subjectCode}</td>
                    <td className="font-semibold text-ink-primary">{res.subjectName}</td>
                    <td className="font-mono text-xs">Sem {res.semester}</td>
                    <td className="font-mono font-bold text-ink-primary">{res.marks} / {res.maxMarks}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
                        {res.grade}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-bold text-ink-secondary">{res.gradePoint}</td>
                    <td className="font-mono text-xs font-semibold">{res.credits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-xs text-ink-muted">
                    {loading ? 'Loading certified course results...' : 'No course assessments recorded for this scholar yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
