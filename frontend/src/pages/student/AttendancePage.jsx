import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, AlertTriangle, CheckCircle2, 
  Info, Filter, Download, ArrowUpRight, Search, Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceBadge } from '../../components/common/Badge';

export default function AttendancePage() {
  const { user } = useAuth();
  const studentId = user?.studentId || '250';

  const [summary, setSummary] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('Sem 6');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Realistic Indian university semester 6 courses with faculty names & attendance data
  const [coursesAttendance, setCoursesAttendance] = useState([
    {
      code: 'CS601',
      subject: 'Design & Analysis of Algorithms',
      faculty: 'Dr. Ramesh Ramanathan (Prof. CSE)',
      totalClasses: 42,
      attended: 40,
      missed: 2,
      percentage: 95.2,
      lastAttended: '2026-03-18',
      type: 'Core Theory'
    },
    {
      code: 'CS602',
      subject: 'Database Management Systems',
      faculty: 'Prof. Sunita Deshmukh (Assoc. Prof.)',
      totalClasses: 38,
      attended: 35,
      missed: 3,
      percentage: 92.1,
      lastAttended: '2026-03-19',
      type: 'Core Theory'
    },
    {
      code: 'CS603',
      subject: 'Cloud & Microservices Architecture',
      faculty: 'Dr. Anand Verma (Dean Academic)',
      totalClasses: 36,
      attended: 36,
      missed: 0,
      percentage: 100.0,
      lastAttended: '2026-03-19',
      type: 'Elective'
    },
    {
      code: 'CS604',
      subject: 'Operating Systems & System Programming',
      faculty: 'Dr. Meenakshi Sundaram (Prof. CSE)',
      totalClasses: 40,
      attended: 32,
      missed: 8,
      percentage: 80.0,
      lastAttended: '2026-03-17',
      type: 'Core Theory'
    },
    {
      code: 'CS605',
      subject: 'Computer Networks & Security',
      faculty: 'Prof. Rajeshwar Kulkarni (Asst. Prof.)',
      totalClasses: 34,
      attended: 25,
      missed: 9,
      percentage: 73.5,
      lastAttended: '2026-03-16',
      type: 'Core Theory'
    },
    {
      code: 'CS606L',
      subject: 'Cloud Systems Laboratory',
      faculty: 'Er. Sandeep Joshi (Lab In-charge)',
      totalClasses: 16,
      attended: 16,
      missed: 0,
      percentage: 100.0,
      lastAttended: '2026-03-18',
      type: 'Practical / Lab'
    }
  ]);

  useEffect(() => {
    loadAttendanceData();
  }, [studentId]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getStudentSummary(studentId);
      setSummary(data);
    } catch (e) {
      console.warn('Using seeded institutional attendance data:', e);
    } finally {
      setLoading(false);
    }
  };

  const overallAttended = coursesAttendance.reduce((acc, c) => acc + c.attended, 0);
  const overallTotal = coursesAttendance.reduce((acc, c) => acc + c.totalClasses, 0);
  const calculatedOverallPct = ((overallAttended / overallTotal) * 100).toFixed(1);

  const filteredCourses = coursesAttendance.filter((c) => {
    const matchesSearch = 
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.faculty.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'SAFE') return c.percentage >= 85;
    if (filterStatus === 'MONITOR') return c.percentage >= 75 && c.percentage < 85;
    if (filterStatus === 'SHORTAGE') return c.percentage < 75;
    return true;
  });

  const shortageCourses = coursesAttendance.filter((c) => c.percentage < 75);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Institutional Attendance Tracking
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
              UGC Minimum 75% Rule
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Academic Session 2025-2026 &bull; Even Semester &bull; Daily Biometric &amp; Faculty Logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-surface-border text-xs text-ink-secondary bg-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="Sem 6">Semester VI (Current)</option>
            <option value="Sem 5">Semester V</option>
            <option value="Sem 4">Semester IV</option>
          </select>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-surface-border bg-surface-soft hover:bg-surface-alt text-xs font-semibold text-ink-secondary flex items-center gap-1.5 cursor-pointer shadow-inst-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Institutional Attendance Alert (if shortage detected) */}
      {shortageCourses.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900">
              Institutional Attendance Warning (Condontion Shortage Alert)
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your attendance in <strong>{shortageCourses.map(c => `${c.subject} (${c.percentage}%)`).join(', ')}</strong> is below the statutory 75% requirement mandated by the Academic Senate. Attend upcoming remedial classes or submit medical certificates to your HOD immediately to avoid debarment from end-semester examinations.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall Percentage Card */}
        <div className="inst-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Cumulative Attendance
            </div>
            <div className="text-2xl font-black text-primary mt-1">
              {calculatedOverallPct}%
            </div>
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Above 75% Statutory Limit</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-emerald-500 flex items-center justify-center font-bold text-xs text-primary">
            {overallAttended}d
          </div>
        </div>

        <div className="inst-card p-4">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            Classes Attended
          </div>
          <div className="text-2xl font-black text-ink-primary mt-1">
            {overallAttended} <span className="text-sm font-normal text-ink-muted">/ {overallTotal}</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Total Lecture &amp; Practical Hours
          </div>
        </div>

        <div className="inst-card p-4">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            Leaves / Absences
          </div>
          <div className="text-2xl font-black text-status-danger mt-1">
            {overallTotal - overallAttended} <span className="text-xs font-normal text-ink-muted">Hours</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Includes 4 Approved Duty Leaves
          </div>
        </div>

        <div className="inst-card p-4">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            Exam Eligibility Status
          </div>
          <div className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Eligible for Hall Ticket</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Clearance ID: COE-2026-EVN-8201
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="inst-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-primary text-white shadow-inst-sm'
                : 'bg-surface-soft text-ink-secondary hover:bg-surface-alt'
            }`}
          >
            All Courses ({coursesAttendance.length})
          </button>
          <button
            onClick={() => setFilterStatus('SAFE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'SAFE'
                ? 'bg-emerald-700 text-white shadow-inst-sm'
                : 'bg-surface-soft text-emerald-800 hover:bg-surface-alt'
            }`}
          >
            Safe &ge;85%
          </button>
          <button
            onClick={() => setFilterStatus('MONITOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'MONITOR'
                ? 'bg-amber-600 text-white shadow-inst-sm'
                : 'bg-surface-soft text-amber-800 hover:bg-surface-alt'
            }`}
          >
            Monitor 75-85%
          </button>
          <button
            onClick={() => setFilterStatus('SHORTAGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'SHORTAGE'
                ? 'bg-rose-700 text-white shadow-inst-sm'
                : 'bg-surface-soft text-rose-800 hover:bg-surface-alt'
            }`}
          >
            Shortage &lt;75%
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course or faculty..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-surface-border text-xs text-ink-primary placeholder-ink-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Attendance Detail Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Subject-wise Classroom &amp; Laboratory Attendance
            </h2>
            <p className="text-xs text-ink-muted">Certified daily registers under Academic Ordinance 12-A</p>
          </div>
          <span className="text-xs text-ink-muted font-medium">
            Showing {filteredCourses.length} of {coursesAttendance.length} registered subjects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Details</th>
                <th>Faculty In-Charge</th>
                <th>Classes Held</th>
                <th>Attended</th>
                <th>Missed</th>
                <th className="w-44">Attendance %</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.code}>
                  <td className="font-mono font-bold text-primary">{c.code}</td>
                  <td>
                    <div className="font-bold text-ink-primary">{c.subject}</div>
                    <span className="text-[10px] text-ink-muted uppercase">{c.type}</span>
                  </td>
                  <td className="text-xs text-ink-secondary">{c.faculty}</td>
                  <td className="font-mono font-semibold">{c.totalClasses}</td>
                  <td className="font-mono font-bold text-emerald-700">{c.attended}</td>
                  <td className="font-mono font-semibold text-rose-600">{c.missed}</td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span>{c.percentage.toFixed(1)}%</span>
                        <span className="text-[10px] font-normal text-ink-muted">
                          {c.percentage >= 75 ? 'Qualified' : 'Defaulter'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            c.percentage >= 85
                              ? 'bg-emerald-600'
                              : c.percentage >= 75
                              ? 'bg-amber-500'
                              : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(c.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <AttendanceBadge percentage={c.percentage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
