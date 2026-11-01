import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CalendarCheck2, Award, ArrowRight, 
  RefreshCw, CheckCircle2, BookOpen, Clock, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { resultService } from '../../services/resultService';
import { useToast } from '../../context/ToastContext';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ totalRecords: 0, overallPercentage: 0 });
  const [resultStats, setResultStats] = useState({ totalResults: 0, passRate: 0 });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      const [stuRes, attStatsRes, resStatsRes, attRecent, resRecent] = await Promise.allSettled([
        studentService.getAll(),
        attendanceService.getStats(),
        resultService.getStats(),
        attendanceService.getAll(),
        resultService.getAll()
      ]);

      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value)) {
        setStudents(stuRes.value);
      }
      if (attStatsRes.status === 'fulfilled' && attStatsRes.value) {
        setAttendanceStats(attStatsRes.value);
      }
      if (resStatsRes.status === 'fulfilled' && resStatsRes.value) {
        setResultStats(resStatsRes.value);
      }
      if (attRecent.status === 'fulfilled' && Array.isArray(attRecent.value)) {
        setRecentAttendance(attRecent.value.slice(0, 5));
      }
      if (resRecent.status === 'fulfilled' && Array.isArray(resRecent.value)) {
        setRecentResults(resRecent.value.slice(0, 5));
      }
    } catch (err) {
      addToast('Error loading faculty dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Faculty Profile Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-inst-sm">
            {user?.username?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-primary">
                {user?.fullName || user?.username || 'Faculty Instructor'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
                Authorized Faculty &bull; Examiner
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted mt-1">
              <span>Account: <strong className="text-ink-secondary font-mono">@{user?.username}</strong></span>
              <span>&bull;</span>
              <span>Authorization: <strong className="text-ink-secondary">ROLE_FACULTY</strong></span>
              <span>&bull;</span>
              <span>Active Semester: <strong className="text-ink-secondary">Even Term 2025–26</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/attendance"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm"
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Mark Daily Attendance</span>
          </Link>
          <Link
            to="/results"
            className="px-4 py-2 rounded-xl border border-surface-border bg-surface-soft hover:bg-surface-hover text-ink-primary text-xs font-bold transition flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-primary" />
            <span>Submit Marks</span>
          </Link>
        </div>
      </div>

      {/* Faculty KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Enrolled Students</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : students.length}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Verified in Student Master Service</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Logged Attendance Entries</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : attendanceStats.totalRecords}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Overall Attendance: <strong>{Number(attendanceStats.overallPercentage).toFixed(1)}%</strong></span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Academic Result Records</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : resultStats.totalResults}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Aggregate Pass Rate: <strong>{Number(resultStats.passRate).toFixed(1)}%</strong></span>
          </div>
        </div>

      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/attendance"
          className="inst-card p-5 hover:border-primary transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Classroom Module
            </div>
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-primary transition">
              Log Session Attendance
            </h3>
            <p className="text-xs text-ink-muted">
              Submit single or batch roll-call attendance records for enrolled students.
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
            <ArrowRight size={16} />
          </div>
        </Link>

        <Link
          to="/results"
          className="inst-card p-5 hover:border-primary transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Evaluation &amp; Grades
            </div>
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-primary transition">
              Publish Subject Marks
            </h3>
            <p className="text-xs text-ink-muted">
              Enter subject assessment marks; backend automatically evaluates GPA and grades.
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
            <ArrowRight size={16} />
          </div>
        </Link>
      </div>

      {/* Recent Attendance Entries */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Recent Attendance Sessions
            </h2>
            <p className="text-xs text-ink-muted">Latest student attendance events registered in PostgreSQL</p>
          </div>
          <Link
            to="/attendance"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Attendance &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Student PRN</th>
                <th>Subject Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.length > 0 ? (
                recentAttendance.map((rec) => (
                  <tr key={rec.id}>
                    <td className="font-mono font-bold text-primary">{rec.studentId}</td>
                    <td className="font-semibold text-ink-primary">{rec.subject}</td>
                    <td className="font-mono text-xs text-ink-muted">{rec.date}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="text-xs text-ink-muted">{rec.markedBy || 'Faculty'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-xs text-ink-muted">
                    {loading ? 'Loading attendance logs...' : 'No attendance entries logged yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Marks Entries */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Recent Subject Evaluations
            </h2>
            <p className="text-xs text-ink-muted">Latest grading submissions computed by Result Service</p>
          </div>
          <Link
            to="/results"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Results &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Student PRN</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Grade Points</th>
              </tr>
            </thead>
            <tbody>
              {recentResults.length > 0 ? (
                recentResults.map((res) => (
                  <tr key={res.id}>
                    <td className="font-mono font-bold text-primary">{res.studentId}</td>
                    <td>
                      <div className="font-semibold text-ink-primary">{res.subjectName}</div>
                      <div className="text-[10px] font-mono text-ink-muted">{res.subjectCode}</div>
                    </td>
                    <td className="font-mono text-xs">Sem {res.semester}</td>
                    <td className="font-mono font-bold text-primary">{res.marks} / {res.maxMarks}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
                        {res.grade}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-bold text-ink-secondary">{res.gradePoint}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-xs text-ink-muted">
                    {loading ? 'Loading evaluation logs...' : 'No result entries submitted yet.'}
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
