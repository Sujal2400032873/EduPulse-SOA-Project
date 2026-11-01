import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, Search, Filter, Plus, RefreshCw, Trash2, Edit, 
  Eye, FileText, CheckCircle2, AlertCircle, Sparkles, 
  Layers, ArrowUpDown, GraduationCap, X, CheckSquare 
} from 'lucide-react';
import { resultService } from '../../services/resultService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { TableSkeleton, EmptyState, ErrorState } from '../../components/common/LoadingSkeleton';

export default function MarksManagement() {
  const { isAdmin, isFaculty } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  // Active items
  const [activeResult, setActiveResult] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Form states
  const initialForm = {
    studentId: '',
    subjectCode: 'CS401',
    subjectName: 'Distributed Systems & SOA',
    marks: 85.0,
    maxMarks: 100.0,
    semester: 4,
    credits: 4,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Batch Form state
  const [batchSubjectCode, setBatchSubjectCode] = useState('CS401');
  const [batchSubjectName, setBatchSubjectName] = useState('Distributed Systems & SOA');
  const [batchSemester, setBatchSemester] = useState(4);
  const [batchCredits, setBatchCredits] = useState(4);
  const [batchRoster, setBatchRoster] = useState([]);
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [semesterFilter, subjectFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (semesterFilter !== 'ALL') params.semester = parseInt(semesterFilter, 10);
      if (subjectFilter.trim()) params.subjectCode = subjectFilter.trim();

      const [resData, statsData, studentsData] = await Promise.allSettled([
        resultService.getAll(params),
        resultService.getStats(),
        studentService.getAll(),
      ]);

      if (resData.status === 'fulfilled') {
        setResults(Array.isArray(resData.value) ? resData.value : []);
      } else {
        throw resData.reason;
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }

      if (studentsData.status === 'fulfilled') {
        const sList = Array.isArray(studentsData.value) ? studentsData.value : [];
        setEnrolledStudents(sList);
        if (sList.length > 0 && !formData.studentId) {
          setFormData((prev) => ({ ...prev, studentId: sList[0].studentId }));
        }
      }
    } catch (err) {
      console.error('Failed to load results:', err);
      setError(err.message || 'Unable to retrieve academic results from Result Service.');
      toastError('Could not load academic results from API Gateway.', 'Result Error');
    } finally {
      setLoading(false);
    }
  };

  // Distinct subject codes
  const subjectCodes = useMemo(() => {
    const set = new Set();
    results.forEach((r) => {
      if (r.subjectCode) set.add(r.subjectCode);
    });
    return Array.from(set).sort();
  }, [results]);

  // Filtered & Sorted
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        if (!studentSearch.trim()) return true;
        const q = studentSearch.toLowerCase().trim();
        return (
          (r.studentId && r.studentId.toLowerCase().includes(q)) ||
          (r.subjectName && r.subjectName.toLowerCase().includes(q)) ||
          (r.subjectCode && r.subjectCode.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const marksA = parseFloat(a.marks) || 0;
        const marksB = parseFloat(b.marks) || 0;
        return sortAsc ? marksA - marksB : marksB - marksA;
      });
  }, [results, studentSearch, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  // Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        studentId: formData.studentId.trim(),
        subjectCode: formData.subjectCode.trim(),
        subjectName: formData.subjectName.trim(),
        marks: parseFloat(formData.marks),
        maxMarks: parseFloat(formData.maxMarks),
        semester: parseInt(formData.semester, 10),
        credits: parseInt(formData.credits, 10),
      };

      const res = await resultService.create(payload);
      toastSuccess(`Result recorded for ${res.studentId} in ${res.subjectCode}: Grade ${res.grade}`, 'Result Published');
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Validation failed. Check marks and course constraints.');
      toastError(err.message, 'Result Submission Error');
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
      marks: 85.0,
    }));
    setBatchRoster(roster);
    setBatchModalOpen(true);
  };

  const handleBatchMarksChange = (studentId, marks) => {
    setBatchRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, marks: parseFloat(marks) || 0 } : s))
    );
  };

  // Batch Submit
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setBatchSubmitting(true);

    try {
      const requests = batchRoster.map((s) => ({
        studentId: s.studentId,
        subjectCode: batchSubjectCode.trim(),
        subjectName: batchSubjectName.trim(),
        marks: parseFloat(s.marks),
        maxMarks: 100.0,
        semester: parseInt(batchSemester, 10),
        credits: parseInt(batchCredits, 10),
      }));

      await resultService.createBatch(requests);
      toastSuccess(`Batch results recorded for ${requests.length} students!`, 'Batch Completed');
      setBatchModalOpen(false);
      await loadData();
    } catch (err) {
      toastError(err.message || 'Batch marks publication failed', 'Batch Error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (rec) => {
    setActiveResult(rec);
    setFormData({
      studentId: rec.studentId,
      subjectCode: rec.subjectCode,
      subjectName: rec.subjectName,
      marks: rec.marks,
      maxMarks: rec.maxMarks,
      semester: rec.semester,
      credits: rec.credits,
    });
    setFormError(null);
    setEditModalOpen(true);
  };

  // Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeResult?.id) return;
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        studentId: formData.studentId.trim(),
        subjectCode: formData.subjectCode.trim(),
        subjectName: formData.subjectName.trim(),
        marks: parseFloat(formData.marks),
        maxMarks: parseFloat(formData.maxMarks),
        semester: parseInt(formData.semester, 10),
        credits: parseInt(formData.credits, 10),
      };

      const res = await resultService.update(activeResult.id, payload);
      toastSuccess(`Updated result #${res.id}: ${res.marks}/${res.maxMarks} (${res.grade})`, 'Updated');
      setEditModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to update result');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete
  const handleOpenDelete = (rec) => {
    setActiveResult(rec);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeResult?.id) return;
    setFormSubmitting(true);

    try {
      await resultService.delete(activeResult.id);
      toastSuccess(`Academic record #${activeResult.id} removed.`, 'Deleted');
      setDeleteConfirmOpen(false);
      setActiveResult(null);
      await loadData();
    } catch (err) {
      toastError(err.message || 'Could not delete result record.', 'Delete Error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Official Transcript Modal
  const handleViewTranscript = async (studentId) => {
    setTranscriptLoading(true);
    setTranscriptModalOpen(true);
    try {
      const transcript = await resultService.getTranscript(studentId);
      setActiveTranscript(transcript);
    } catch (err) {
      toastError(`Failed to load transcript for ${studentId}: ${err.message}`, 'Transcript Error');
      setTranscriptModalOpen(false);
    } finally {
      setTranscriptLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="inst-card p-6 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ink-primary">
              Academic Marks &amp; Transcript Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Result-Service (Port 8084)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Automated grade computation (O, A+, A, B+, B, C, F), semester SGPA evaluation, and cumulative CGPA generation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-xl border border-surface-border text-ink-secondary hover:text-primary hover:bg-surface-hover transition cursor-pointer"
            title="Refresh from Gateway"
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
                <span>Batch Grade Entry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...initialForm,
                    studentId: enrolledStudents[0]?.studentId || 'STU1001',
                  });
                  setFormError(null);
                  setCreateModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Marks</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Total Exam Results</span>
            <span className="text-xl font-extrabold text-ink-primary mt-1 block">{stats.totalResults ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Passed Papers</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{stats.passedCount ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Failed Papers</span>
            <span className="text-xl font-extrabold text-rose-700 mt-1 block">{stats.failedCount ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Institutional Pass Rate</span>
            <span className="text-xl font-extrabold text-primary mt-1 block">{stats.passRate != null ? `${stats.passRate.toFixed(1)}%` : 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search student ID or subject..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span>Semester:</span>
          </div>
          <select
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft text-ink-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadData} />
          </div>
        ) : filteredResults.length === 0 ? (
          <EmptyState
            title="No Results Recorded"
            description="No academic exam marks have been published for the selected filters."
            actionText={isAdmin || isFaculty ? 'Record First Result' : undefined}
            onAction={isAdmin || isFaculty ? () => setCreateModalOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-soft/80 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Course &amp; Code</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => setSortAsc(!sortAsc)}>
                    <div className="flex items-center gap-1">
                      <span>Score / Max</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Grade (GPA)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-xs">
                {paginatedResults.map((r) => {
                  const isPass = r.grade !== 'F';
                  return (
                    <tr key={r.id} className="hover:bg-surface-hover/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleViewTranscript(r.studentId)}
                          className="font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          title="Generate Official Transcript"
                        >
                          <span>{r.studentId}</span>
                          <FileText className="w-3.5 h-3.5 opacity-70" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink-primary">{r.subjectName}</div>
                        <div className="text-[11px] text-ink-muted font-mono">{r.subjectCode} &bull; {r.credits} Credits</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink-secondary">
                        Semester {r.semester}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className="text-ink-primary">{r.marks}</span>
                        <span className="text-ink-muted"> / {r.maxMarks}</span>
                        <span className="text-[10px] text-ink-light block">({r.percentage}%)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPass
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span>Grade {r.grade}</span>
                          <span className="opacity-75">({r.gradePoint} GP)</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleViewTranscript(r.studentId)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-primary hover:bg-surface-soft transition cursor-pointer"
                            title="View Transcript"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(isAdmin || isFaculty) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(r)}
                                className="p-1.5 rounded-lg text-ink-muted hover:text-blue-600 hover:bg-surface-soft transition cursor-pointer"
                                title="Edit Marks"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(r)}
                                className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-surface-soft transition cursor-pointer"
                                title="Delete Result"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredResults.length > 0 && (
          <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
            <div>
              Showing <span className="font-bold text-ink-primary">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-ink-primary">
                {Math.min(currentPage * pageSize, filteredResults.length)}
              </span>{' '}
              of <span className="font-bold text-ink-primary">{filteredResults.length}</span> results
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

      {/* CREATE RESULT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Academic Result"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
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
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-mono focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              {enrolledStudents.map((s) => (
                <option key={s.id || s.studentId} value={s.studentId}>
                  {s.studentId} — {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="e.g. CS401"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Subject Title *
              </label>
              <input
                type="text"
                required
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="Distributed Systems & SOA"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1000"
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Maximum Marks *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="1000"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Semester (1–12) *
              </label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Course Credits (1–10) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              disabled={formSubmitting}
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-surface-hover cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {formSubmitting ? 'Recording...' : 'Publish Academic Result'}
            </button>
          </div>
        </form>
      </Modal>

      {/* BATCH GRADING MODAL */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title="Batch Academic Grade Entry"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleBatchSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-soft p-3.5 rounded-xl border border-surface-border">
            <div>
              <label className="block text-[10px] font-semibold text-ink-secondary mb-1">Course Code</label>
              <input
                type="text"
                required
                value={batchSubjectCode}
                onChange={(e) => setBatchSubjectCode(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-secondary mb-1">Subject Name</label>
              <input
                type="text"
                required
                value={batchSubjectName}
                onChange={(e) => setBatchSubjectName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-secondary mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={batchSemester}
                onChange={(e) => setBatchSemester(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-secondary mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={batchCredits}
                onChange={(e) => setBatchCredits(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface text-xs"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto border border-surface-border rounded-xl divide-y divide-surface-border">
            {batchRoster.map((s) => (
              <div key={s.studentId} className="p-3 flex items-center justify-between hover:bg-surface-soft transition">
                <div>
                  <div className="font-bold text-xs text-ink-primary">{s.name}</div>
                  <div className="text-[11px] text-ink-muted font-mono">{s.studentId} &bull; {s.department}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">Marks / 100:</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={s.marks}
                    onChange={(e) => handleBatchMarksChange(s.studentId, e.target.value)}
                    className="w-20 px-2.5 py-1 rounded-lg border border-surface-border text-xs font-bold text-right"
                  />
                </div>
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
              {batchSubmitting ? 'Publishing...' : `Publish Grades (${batchRoster.length} Students)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Update Academic Result #${activeResult?.id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-surface-soft border border-surface-border text-xs font-mono">
            {formData.studentId} &bull; {formData.subjectCode} &bull; Semester {formData.semester}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
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
              {formSubmitting ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL TRANSCRIPT MODAL */}
      <Modal
        isOpen={transcriptModalOpen}
        onClose={() => setTranscriptModalOpen(false)}
        title="Official Academic Transcript"
        maxWidth="max-w-2xl"
      >
        {transcriptLoading ? (
          <div className="py-8 text-center text-xs text-ink-muted">Generating transcript from Result Service...</div>
        ) : activeTranscript ? (
          <div className="space-y-4 text-xs">
            
            {/* Transcript Header Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Candidate Roll No</span>
                <span className="text-base font-extrabold text-ink-primary font-mono">{activeTranscript.studentId}</span>
                <span className="text-[11px] text-ink-muted block mt-0.5">Autonomous Academic Evaluation</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Cumulative CGPA</span>
                <span className="text-2xl font-black text-primary font-mono">
                  {activeTranscript.cgpa != null ? Number(activeTranscript.cgpa).toFixed(2) : 'N/A'}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block">10-Point Grading Scale</span>
              </div>
            </div>

            {/* Transcript Summary Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-xl border border-surface-border bg-surface-soft">
                <span className="text-ink-muted block">Courses</span>
                <span className="font-bold text-ink-primary mt-0.5 block">{activeTranscript.totalSubjects}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-surface-border bg-surface-soft">
                <span className="text-ink-muted block">Total Credits</span>
                <span className="font-bold text-ink-primary mt-0.5 block">{activeTranscript.totalCredits}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-surface-border bg-emerald-50 text-emerald-900">
                <span className="block">Earned Credits</span>
                <span className="font-bold mt-0.5 block">{activeTranscript.earnedCredits}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-surface-border bg-rose-50 text-rose-900">
                <span className="block">Backlogs</span>
                <span className="font-bold mt-0.5 block">{activeTranscript.failedSubjects}</span>
              </div>
            </div>

            {/* Semesters & Courses Breakdown */}
            {activeTranscript.semesters && activeTranscript.semesters.length > 0 ? (
              <div className="space-y-3">
                {activeTranscript.semesters.map((sem, sIdx) => (
                  <div key={sIdx} className="border border-surface-border rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-surface-soft border-b border-surface-border flex items-center justify-between text-xs font-bold text-ink-primary">
                      <span>Semester {sem.semester}</span>
                      <span className="text-primary font-mono">SGPA: {sem.sgpa != null ? Number(sem.sgpa).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div className="divide-y divide-surface-border">
                      {sem.courses?.map((c, cIdx) => (
                        <div key={cIdx} className="p-3 flex items-center justify-between hover:bg-surface-soft/50">
                          <div>
                            <div className="font-semibold text-ink-primary">{c.subjectName}</div>
                            <div className="text-[10px] text-ink-muted font-mono">{c.subjectCode} &bull; {c.credits} Credits</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-ink-primary">{c.marks}/{c.maxMarks}</span>
                            <span className="ml-2 font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900">
                              {c.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-ink-muted py-4">No graded courses recorded yet.</p>
            )}

          </div>
        ) : null}
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Academic Result"
        message={`Are you sure you want to delete result for ${activeResult?.studentId} in ${activeResult?.subjectName}?`}
        confirmText="Confirm Delete"
        loading={formSubmitting}
      />

    </div>
  );
}
