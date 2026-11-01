import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarCheck2, Users, CheckCircle2, XCircle, 
  Plus, Search, Filter, RefreshCw, Trash2, Edit, 
  BarChart2, Save, Calendar, AlertCircle, ArrowUpDown, X, Layers 
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { TableSkeleton, EmptyState, ErrorState } from '../../components/common/LoadingSkeleton';

export default function AttendanceManagement() {
  const { isAdmin, isFaculty } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [studentFilter, setStudentFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [percentageModalOpen, setPercentageModalOpen] = useState(false);

  // Active items
  const [activeRecord, setActiveRecord] = useState(null);
  const [activePercentage, setActivePercentage] = useState(null);
  const [percentageLoading, setPercentageLoading] = useState(false);

  // Single Record Form
  const todayStr = new Date().toISOString().split('T')[0];
  const [singleForm, setSingleForm] = useState({
    studentId: '',
    subject: 'Distributed Systems & SOA',
    date: todayStr,
    status: 'PRESENT',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Batch Recording Form
  const [batchSubject, setBatchSubject] = useState('Distributed Systems & SOA');
  const [batchDate, setBatchDate] = useState(todayStr);
  const [batchRoster, setBatchRoster] = useState([]);
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentFilter, subjectFilter, dateFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (studentFilter.trim()) params.studentId = studentFilter.trim();
      if (subjectFilter !== 'ALL') params.subject = subjectFilter;
      if (dateFilter) params.date = dateFilter;

      const [recordsData, statsData, studentsData] = await Promise.allSettled([
        attendanceService.getAll(params),
        attendanceService.getStats(),
        studentService.getAll(),
      ]);

      if (recordsData.status === 'fulfilled') {
        setRecords(Array.isArray(recordsData.value) ? recordsData.value : []);
      } else {
        throw recordsData.reason;
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }

      if (studentsData.status === 'fulfilled') {
        const sList = Array.isArray(studentsData.value) ? studentsData.value : [];
        setEnrolledStudents(sList);
        if (sList.length > 0 && !singleForm.studentId) {
          setSingleForm((prev) => ({ ...prev, studentId: sList[0].studentId }));
        }
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setError(err.message || 'Unable to retrieve attendance records from backend.');
      toastError('Could not load attendance from API Gateway.', 'Attendance Error');
    } finally {
      setLoading(false);
    }
  };

  // Distinct subjects
  const subjects = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.subject) set.add(r.subject);
    });
    set.add('Distributed Systems & SOA');
    set.add('Database Management Systems');
    set.add('Software Architecture');
    return Array.from(set).sort();
  }, [records]);

  // Filtered & Sorted
  const filteredRecords = useMemo(() => {
    return records.slice().sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [records, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Single Record Submit
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        studentId: singleForm.studentId.trim(),
        subject: singleForm.subject.trim(),
        date: singleForm.date,
        status: singleForm.status,
      };

      const res = await attendanceService.recordSingle(payload);
      toastSuccess(`Attendance recorded for ${res.studentId}: ${res.status}`, 'Recorded');
      setRecordModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to record attendance');
      toastError(err.message, 'Attendance Submission Error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Batch Modal
  const handleOpenBatch = () => {
    const roster = enrolledStudents.map((s) => ({
      studentId: s.studentId,
      name: s.name,
      department: s.department,
      status: 'PRESENT',
    }));
    setBatchRoster(roster);
    setBatchModalOpen(true);
  };

  const handleToggleBatchStatus = (studentId) => {
    setBatchRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : s))
    );
  };

  const handleMarkAllBatch = (status) => {
    setBatchRoster((prev) => prev.map((s) => ({ ...s, status })));
  };

  // Batch Submit
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setBatchSubmitting(true);

    try {
      const requests = batchRoster.map((s) => ({
        studentId: s.studentId,
        subject: batchSubject,
        date: batchDate,
        status: s.status,
      }));

      await attendanceService.recordBatch(requests);
      toastSuccess(`Batch attendance submitted for ${requests.length} students!`, 'Batch Recorded');
      setBatchModalOpen(false);
      await loadData();
    } catch (err) {
      toastError(err.message || 'Batch attendance recording failed', 'Batch Error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (rec) => {
    setActiveRecord(rec);
    setSingleForm({
      studentId: rec.studentId,
      subject: rec.subject,
      date: rec.date,
      status: rec.status,
    });
    setFormError(null);
    setEditModalOpen(true);
  };

  // Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeRecord?.id) return;
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        studentId: singleForm.studentId,
        subject: singleForm.subject,
        date: singleForm.date,
        status: singleForm.status,
      };

      await attendanceService.update(activeRecord.id, payload);
      toastSuccess(`Updated record #${activeRecord.id} to ${singleForm.status}`, 'Record Updated');
      setEditModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to update record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDelete = (rec) => {
    setActiveRecord(rec);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeRecord?.id) return;
    setFormSubmitting(true);

    try {
      await attendanceService.delete(activeRecord.id);
      toastSuccess(`Attendance record #${activeRecord.id} deleted.`, 'Deleted');
      setDeleteConfirmOpen(false);
      setActiveRecord(null);
      await loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete record', 'Delete Error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // View Percentage Breakdown
  const handleViewPercentage = async (studentId) => {
    setPercentageLoading(true);
    setPercentageModalOpen(true);
    try {
      const data = await attendanceService.getPercentage(studentId);
      setActivePercentage(data);
    } catch (err) {
      toastError(`Could not fetch attendance percentage for ${studentId}: ${err.message}`);
      setPercentageModalOpen(false);
    } finally {
      setPercentageLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="inst-card p-6 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ink-primary">
              Classroom Attendance Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Attendance-Service (Port 8083)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Real-time daily student attendance tracking, automated percentage metrics, and batch processing
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-xl border border-surface-border text-ink-secondary hover:text-primary hover:bg-surface-hover transition cursor-pointer"
            title="Refresh Attendance Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(isAdmin || isFaculty) && (
            <>
              <button
                type="button"
                onClick={handleOpenBatch}
                className="px-3.5 py-2 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Batch Roll Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSingleForm({
                    studentId: enrolledStudents[0]?.studentId || 'STU1001',
                    subject: 'Distributed Systems & SOA',
                    date: todayStr,
                    status: 'PRESENT',
                  });
                  setFormError(null);
                  setRecordModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Attendance</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Total Classes</span>
            <span className="text-xl font-extrabold text-ink-primary mt-1 block">{stats.totalRecords ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Present Entries</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{stats.presentCount ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Absent Entries</span>
            <span className="text-xl font-extrabold text-rose-700 mt-1 block">{stats.absentCount ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Overall Attendance</span>
            <span className="text-xl font-extrabold text-primary mt-1 block">{stats.overallPercentage != null ? `${stats.overallPercentage.toFixed(1)}%` : 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={studentFilter}
              onChange={(e) => {
                setStudentFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by Student ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft text-ink-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-ink-muted">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-surface-border text-xs bg-surface-soft text-ink-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="p-1.5 rounded-lg border border-surface-border text-ink-muted hover:text-ink-primary text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadData} />
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            title="No Attendance Records"
            description="No attendance entries recorded matching the selected filter criteria."
            actionText={isAdmin || isFaculty ? 'Record Attendance' : undefined}
            onAction={isAdmin || isFaculty ? () => setRecordModalOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-soft/80 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Course Subject</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => setSortAsc(!sortAsc)}>
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Marked By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-xs">
                {paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewPercentage(r.studentId)}
                        className="font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        title="View Cumulative Attendance %"
                      >
                        <span>{r.studentId}</span>
                        <BarChart2 className="w-3 h-3 opacity-60" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ink-primary">
                      {r.subject}
                    </td>
                    <td className="py-3.5 px-4 text-ink-secondary flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{r.date}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {r.status === 'PRESENT' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-ink-muted font-mono">
                      {r.markedBy || 'system'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(isAdmin || isFaculty) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(r)}
                              className="p-1.5 rounded-lg text-ink-muted hover:text-blue-600 hover:bg-surface-soft transition cursor-pointer"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(r)}
                              className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-surface-soft transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredRecords.length > 0 && (
          <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
            <div>
              Showing <span className="font-bold text-ink-primary">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-ink-primary">
                {Math.min(currentPage * pageSize, filteredRecords.length)}
              </span>{' '}
              of <span className="font-bold text-ink-primary">{filteredRecords.length}</span> records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold disabled:opacity-40 hover:bg-surface-hover cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-surface-border hover:bg-surface-hover text-ink-secondary'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold disabled:opacity-40 hover:bg-surface-hover cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SINGLE RECORD MODAL */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record Single Lecture Attendance"
      >
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Select Enrolled Student *
            </label>
            <select
              value={singleForm.studentId}
              onChange={(e) => setSingleForm({ ...singleForm, studentId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-mono focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              {enrolledStudents.map((s) => (
                <option key={s.id || s.studentId} value={s.studentId}>
                  {s.studentId} — {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Course Subject *
            </label>
            <input
              type="text"
              required
              value={singleForm.subject}
              onChange={(e) => setSingleForm({ ...singleForm, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Attendance Date *
              </label>
              <input
                type="date"
                required
                value={singleForm.date}
                onChange={(e) => setSingleForm({ ...singleForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Attendance Status *
              </label>
              <select
                value={singleForm.status}
                onChange={(e) => setSingleForm({ ...singleForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              disabled={formSubmitting}
              onClick={() => setRecordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-surface-hover cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {formSubmitting ? 'Recording...' : 'Submit Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* BATCH ATTENDANCE MODAL */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title="Batch Attendance Roll Call"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleBatchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface-soft p-3.5 rounded-xl border border-surface-border">
            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">Subject</label>
              <input
                type="text"
                required
                value={batchSubject}
                onChange={(e) => setBatchSubject(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">Session Date</label>
              <input
                type="date"
                required
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-ink-primary">Enrolled Scholars ({batchRoster.length})</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAllBatch('PRESENT')}
                className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-bold cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAllBatch('ABSENT')}
                className="px-2.5 py-1 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-[11px] font-bold cursor-pointer"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto border border-surface-border rounded-xl divide-y divide-surface-border">
            {batchRoster.map((s) => (
              <div key={s.studentId} className="p-3 flex items-center justify-between hover:bg-surface-soft transition">
                <div>
                  <div className="font-bold text-xs text-ink-primary">{s.name}</div>
                  <div className="text-[11px] text-ink-muted font-mono">{s.studentId} &bull; {s.department}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleBatchStatus(s.studentId)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    s.status === 'PRESENT'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {s.status}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              disabled={batchSubmitting}
              onClick={() => setBatchModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={batchSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {batchSubmitting ? 'Submitting Batch...' : `Submit Attendance (${batchRoster.length} Records)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Update Attendance Record #${activeRecord?.id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-surface-soft border border-surface-border text-xs">
            <span className="font-mono font-bold text-primary">{singleForm.studentId}</span> &bull; {singleForm.subject} &bull; {singleForm.date}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Attendance Status
            </label>
            <select
              value={singleForm.status}
              onChange={(e) => setSingleForm({ ...singleForm, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-bold cursor-pointer"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              disabled={formSubmitting}
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold cursor-pointer"
            >
              {formSubmitting ? 'Updating...' : 'Save Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PERCENTAGE SUMMARY MODAL */}
      <Modal
        isOpen={percentageModalOpen}
        onClose={() => setPercentageModalOpen(false)}
        title="Student Cumulative Attendance Breakdown"
      >
        {percentageLoading ? (
          <div className="py-8 text-center text-xs text-ink-muted">Loading attendance calculation...</div>
        ) : activePercentage ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Student</span>
                <span className="text-base font-extrabold text-ink-primary font-mono">{activePercentage.studentId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Attendance Rate</span>
                <span className="text-2xl font-black text-primary">{activePercentage.percentage?.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl border border-surface-border bg-surface-soft">
                <span className="text-[10px] text-ink-muted uppercase block">Total</span>
                <span className="text-sm font-bold text-ink-primary mt-0.5 block">{activePercentage.totalClasses}</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-emerald-50 text-emerald-900">
                <span className="text-[10px] uppercase block">Present</span>
                <span className="text-sm font-bold mt-0.5 block">{activePercentage.presentClasses}</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-rose-50 text-rose-900">
                <span className="text-[10px] uppercase block">Absent</span>
                <span className="text-sm font-bold mt-0.5 block">{activePercentage.absentClasses}</span>
              </div>
            </div>

            {activePercentage.subjectWise && activePercentage.subjectWise.length > 0 && (
              <div>
                <h5 className="font-bold text-ink-primary mb-2">Subject-wise Attendance</h5>
                <div className="border border-surface-border rounded-xl divide-y divide-surface-border">
                  {activePercentage.subjectWise.map((sub, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-ink-primary">{sub.subject}</div>
                        <div className="text-[10px] text-ink-muted">
                          {sub.presentClasses} / {sub.totalClasses} attended
                        </div>
                      </div>
                      <span className="font-bold text-primary font-mono text-sm">
                        {sub.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance Entry"
        message={`Are you sure you want to remove attendance record for ${activeRecord?.studentId} on ${activeRecord?.date}?`}
        confirmText="Confirm Delete"
        loading={formSubmitting}
      />

    </div>
  );
}
