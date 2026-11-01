import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, AlertTriangle, CheckCircle2, 
  Search, Filter, Clock, RefreshCw, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      let sumData = null;
      let recData = [];

      const [sumRes, recRes] = await Promise.allSettled([
        attendanceService.getMyPercentage(),
        attendanceService.getMyAttendance()
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        sumData = sumRes.value;
      }
      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value)) {
        recData = recRes.value;
      }

      // Fallback if /me returned empty or failed
      const sId = user?.studentId || user?.username;
      if ((!sumData || recData.length === 0) && sId) {
        try {
          if (!sumData) sumData = await attendanceService.getPercentage(sId);
          if (recData.length === 0) {
            const byStudent = await attendanceService.getByStudent(sId);
            if (Array.isArray(byStudent)) recData = byStudent;
          }
        } catch (ignored) {}
      }

      if (sumData) setSummary(sumData);
      if (recData.length > 0) setRecords(recData);
    } catch (err) {
      addToast('Could not load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = !searchQuery || 
      r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date?.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const percentage = summary?.percentage !== undefined ? Number(summary.percentage).toFixed(1) : '0.0';
  const isCompliant = Number(percentage) >= 75.0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Student Attendance Register
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isCompliant 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isCompliant ? 'Compliant (\u2265 75%)' : 'Attendance Shortage'}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Real-time biometric and faculty-recorded class attendance from Attendance Service.
          </p>
        </div>

        <button
          onClick={loadAttendanceData}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl border border-surface-border bg-surface-soft hover:bg-surface-hover text-xs font-semibold text-ink-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Register</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Cumulative Attendance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${percentage}%`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Minimum standard: 75% for exam eligibility</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Sessions Attended</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : summary?.presentClasses || 0}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Present marks registered</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-rose-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Sessions Missed</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : summary?.absentClasses || 0}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Absent session entries</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Total Classes Conducted</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : summary?.totalClasses || 0}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Total lecture and lab hours logged</span>
          </div>
        </div>

      </div>

      {/* Subject-Wise Breakdown Progress Bars */}
      {summary?.subjectWise && summary.subjectWise.length > 0 && (
        <div className="inst-card p-5 space-y-4">
          <div className="border-b border-surface-border pb-3">
            <h2 className="text-sm font-bold text-ink-primary">Subject-Wise Attendance Breakdown</h2>
            <p className="text-xs text-ink-muted">Course-level attendance percentages computed from attendance records</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.subjectWise.map((sub, idx) => {
              const subPct = Number(sub.percentage) || 0;
              const subCompliant = subPct >= 75.0;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-soft border border-surface-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-primary truncate max-w-[70%]">{sub.subject}</span>
                    <span className={`text-xs font-bold font-mono ${subCompliant ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {subPct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${subCompliant ? 'bg-emerald-600' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(subPct, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-ink-muted font-mono">
                    <span>{sub.presentClasses} Present</span>
                    <span>{sub.absentClasses} Absent</span>
                    <span>{sub.totalClasses} Total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Session Attendance History
            </h2>
            <p className="text-xs text-ink-muted">Historical log of every marked attendance session</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search subject or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Subject Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td className="font-mono text-xs text-ink-muted">#{rec.id}</td>
                    <td className="font-semibold text-ink-primary">{rec.subject}</td>
                    <td className="font-mono text-xs">{rec.date}</td>
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
                  <td colSpan="5" className="text-center py-8 text-xs text-ink-muted">
                    {loading ? 'Loading attendance logs...' : 'No attendance events match your query.'}
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
