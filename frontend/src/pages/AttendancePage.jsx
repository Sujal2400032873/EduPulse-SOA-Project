import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Save, 
  UserCheck, 
  Search,
  Filter,
  Check,
  AlertTriangle,
  History,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage({ selectedStudentId }) {
  const { user, isAdmin, isFaculty } = useAuth();
  
  // Controls
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  
  // Data
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Student summary modal
  const [summaryModalStudent, setSummaryModalStudent] = useState(null);
  const [studentSummaryData, setStudentSummaryData] = useState(null);
  const [studentHistoryRecords, setStudentHistoryRecords] = useState([]);

  useEffect(() => {
    loadClassRosterAndAttendance();
  }, [selectedDate, selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedStudentId) {
      viewStudentSummary(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadClassRosterAndAttendance = async () => {
    setLoading(true);
    setSuccessMessage(null);
    try {
      // 1. Fetch students for this class & section
      const roster = await api.students.getAll({
        studentClass: selectedClass,
        section: selectedSection,
      });
      setStudents(roster);

      // 2. Fetch existing attendance for this date
      const existingRecords = await api.attendance.getByDate(selectedDate);
      const newAttMap = {};
      const newRemMap = {};

      // Seed with existing or default to PRESENT
      roster.forEach((s) => {
        const match = existingRecords.find((r) => r.studentId === s.studentId);
        if (match) {
          newAttMap[s.studentId] = match.status;
          newRemMap[s.studentId] = match.remarks || '';
        } else {
          newAttMap[s.studentId] = 'PRESENT';
          newRemMap[s.studentId] = '';
        }
      });

      setAttendanceMap(newAttMap);
      setRemarksMap(newRemMap);
    } catch (err) {
      console.error('Failed to load roster/attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarksMap((prev) => ({
      ...prev,
      [studentId]: remark,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.studentId] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSuccessMessage(null);

    try {
      const entries = students.map((s) => ({
        studentId: s.studentId,
        status: attendanceMap[s.studentId] || 'PRESENT',
        remarks: remarksMap[s.studentId] || '',
      }));

      await api.attendance.recordBatch({
        date: selectedDate,
        recordedBy: user?.fullName || user?.username || 'Faculty',
        entries,
      });

      setSuccessMessage(`Successfully committed attendance for ${entries.length} students on ${selectedDate}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  const viewStudentSummary = async (studentId) => {
    setSummaryModalStudent(studentId);
    setStudentSummaryData(null);
    setStudentHistoryRecords([]);

    try {
      const [summary, history] = await Promise.all([
        api.attendance.getStudentSummary(studentId),
        api.attendance.getByStudentId(studentId),
      ]);
      setStudentSummaryData(summary);
      setStudentHistoryRecords(history);
    } catch (e) {
      console.error('Failed to load student summary:', e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-6 h-6 text-brand-400" />
            Classroom Attendance Logging & Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated roll-call tracking via Attendance Service · Inter-service validation with Student Service
          </p>
        </div>

        {(isAdmin || isFaculty) && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-xs transition shadow-glow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Committing Logs...' : 'Commit Daily Roll-Call'}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and date control bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
        {/* Date Picker */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-brand-400" /> Attendance Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Class selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Grade Level</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:ring-1 focus:ring-brand-500"
          >
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>

        {/* Section selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:ring-1 focus:ring-brand-500"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        {/* Quick batch toggle buttons */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Batch Operations</label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="flex-1 px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Status for {selectedDate}</th>
                <th className="py-3.5 px-4">Remarks / Note</th>
                <th className="py-3.5 px-4 text-right">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    Fetching class roster and attendance status...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    No students enrolled in {selectedClass} - Section {selectedSection}.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student.studentId] || 'PRESENT';

                  return (
                    <tr key={student.studentId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-400">
                        {student.studentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-400">{student.campus}</div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-750 gap-1">
                          
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            Present
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'LATE')}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            Late
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-500 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            Absent
                          </button>

                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'EXCUSED')}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional note (e.g. sick leave)"
                          value={remarksMap[student.studentId] || ''}
                          onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                          className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>

                      {/* View Student Attendance Summary */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => viewStudentSummary(student.studentId)}
                          className="px-3 py-1 rounded-lg bg-slate-800 text-brand-400 hover:bg-brand-500/20 transition font-medium text-xs flex items-center gap-1 ml-auto"
                        >
                          <History className="w-3.5 h-3.5" />
                          Rate & History
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Attendance Summary & History Modal */}
      {summaryModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-card rounded-2xl p-6 border border-slate-750 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Attendance History · {studentSummaryData?.studentName || summaryModalStudent}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {summaryModalStudent} · {studentSummaryData?.studentClass} ({studentSummaryData?.section})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSummaryModalStudent(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {studentSummaryData ? (
              <div className="mt-4 space-y-4">
                {/* Metric cards */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Days</div>
                    <div className="text-xl font-bold text-white mt-0.5">{studentSummaryData.totalDays}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400">Present</div>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">{studentSummaryData.presentDays}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/20">
                    <div className="text-[10px] uppercase tracking-wider text-rose-400">Absent</div>
                    <div className="text-xl font-bold text-rose-400 mt-0.5">{studentSummaryData.absentDays}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-brand-500/20">
                    <div className="text-[10px] uppercase tracking-wider text-brand-400">Rate</div>
                    <div className="text-xl font-bold text-brand-400 mt-0.5">
                      {studentSummaryData.attendancePercentage}%
                    </div>
                  </div>
                </div>

                {studentSummaryData.lowAttendanceWarning && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Warning:</strong> Attendance rate is below the 75% threshold mandated by institutional policy.
                    </span>
                  </div>
                )}

                {/* History Log */}
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Daily Log History</h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {studentHistoryRecords.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-4">No records found.</div>
                    ) : (
                      studentHistoryRecords.map((rec) => (
                        <div
                          key={rec.attendanceId}
                          className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-300">{rec.date}</span>
                            {rec.remarks && <span className="text-[11px] text-slate-400">· {rec.remarks}</span>}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.status === 'PRESENT' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            rec.status === 'LATE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                            rec.status === 'EXCUSED' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                            'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading student attendance analytics from Attendance Service...
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
