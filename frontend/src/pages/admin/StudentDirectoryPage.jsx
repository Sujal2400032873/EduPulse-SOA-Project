import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, Plus, Mail, Phone, Calendar, 
  Building, CheckCircle2, Trash2, Edit, Eye, ArrowUpDown, 
  Workflow, RefreshCw, X, AlertCircle, Shield, Sparkles 
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { TableSkeleton, EmptyState, ErrorState } from '../../components/common/LoadingSkeleton';

export default function StudentDirectoryPage() {
  const { isAdmin, isFaculty } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sagaModalOpen, setSagaModalOpen] = useState(false);

  // Active student for view / edit / delete
  const [activeStudent, setActiveStudent] = useState(null);

  // Form states
  const initialForm = {
    studentId: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '2004-05-15',
    gender: 'MALE',
    department: 'Computer Science',
    year: 1,
    section: 'A',
    admissionYear: 2025,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // SAGA workflow state
  const [sagaSimulateFailure, setSagaSimulateFailure] = useState(false);
  const [sagaResult, setSagaResult] = useState(null);
  const [sagaSubmitting, setSagaSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Unable to retrieve students from the Student Service.');
      toastError('Could not load student list from API Gateway.', 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  // Distinct departments for filter
  const departments = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.studentId && s.studentId.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q));

        const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
        return matchesQuery && matchesDept;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [students, searchQuery, departmentFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Open Create
  const handleOpenCreate = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      ...initialForm,
      studentId: `STU${randomSuffix}`,
    });
    setFormError(null);
    setCreateModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (student) => {
    setActiveStudent(student);
    setFormData({
      studentId: student.studentId || '',
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '2004-05-15',
      gender: student.gender || 'MALE',
      department: student.department || 'Computer Science',
      year: student.year || 1,
      section: student.section || 'A',
      admissionYear: student.admissionYear || 2025,
    });
    setFormError(null);
    setEditModalOpen(true);
  };

  // Open View Details
  const handleOpenView = (student) => {
    setActiveStudent(student);
    setViewModalOpen(true);
  };

  // Open Delete
  const handleOpenDelete = (student) => {
    setActiveStudent(student);
    setDeleteConfirmOpen(true);
  };

  // Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        studentId: formData.studentId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        department: formData.department.trim(),
        year: parseInt(formData.year, 10),
        section: formData.section?.trim() || null,
        admissionYear: parseInt(formData.admissionYear, 10),
      };

      const created = await studentService.create(payload);
      
      // Auto-provision student authentication account in auth_service
      try {
        await authService.createUserByAdmin({
          username: created.studentId,
          email: created.email,
          password: 'Student@123',
          role: 'ROLE_STUDENT',
        });
      } catch (authErr) {
        // If auth user already exists or user provisioning is skipped, log as non-fatal
        console.info('Student auth account sync:', authErr?.message || authErr);
      }

      toastSuccess(`Student ${created.name} (${created.studentId}) successfully registered! Login: ${created.studentId} / Student@123`, 'Created');
      setCreateModalOpen(false);
      await loadStudents();
    } catch (err) {
      console.error('Failed to create student:', err);
      setFormError(err.message || 'Validation failed. Please verify student fields.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeStudent?.id) return;
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        studentId: formData.studentId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        department: formData.department.trim(),
        year: parseInt(formData.year, 10),
        section: formData.section?.trim() || null,
        admissionYear: parseInt(formData.admissionYear, 10),
      };

      const updated = await studentService.update(activeStudent.id, payload);
      toastSuccess(`Student record for ${updated.name} updated.`, 'Updated');
      setEditModalOpen(false);
      await loadStudents();
    } catch (err) {
      console.error('Failed to update student:', err);
      setFormError(err.message || 'Update failed. Check field formats.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!activeStudent?.id) return;
    setFormSubmitting(true);

    try {
      await studentService.delete(activeStudent.id);
      toastSuccess(`Student ${activeStudent.name} (${activeStudent.studentId}) removed.`, 'Deleted');
      setDeleteConfirmOpen(false);
      setActiveStudent(null);
      await loadStudents();
    } catch (err) {
      console.error('Failed to delete student:', err);
      toastError(err.message || 'Could not delete student record.', 'Delete Error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // SAGA Enrollment Workflow Submit
  const handleSagaSubmit = async (e) => {
    e.preventDefault();
    setSagaSubmitting(true);
    setSagaResult(null);

    try {
      const payload = {
        studentId: formData.studentId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '+919876543210',
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        department: formData.department.trim(),
        year: parseInt(formData.year, 10),
        section: formData.section?.trim() || 'A',
        admissionYear: parseInt(formData.admissionYear, 10),
      };

      const result = await studentService.orchestratedEnroll(payload, sagaSimulateFailure);
      setSagaResult(result);
      if (result.status === 'COMPLETED') {
        toastSuccess(`SAGA Workflow COMPLETED for ${payload.studentId}`, 'Workflow Succeeded');
        await loadStudents();
      } else {
        toastError(`SAGA Compensated: ${result.error}`, 'Transaction Compensated');
      }
    } catch (err) {
      setSagaResult({
        status: 'FAILED',
        error: err.message || 'Orchestration execution failed',
      });
      toastError(err.message, 'Workflow Error');
    } finally {
      setSagaSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="inst-card p-6 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ink-primary">
              Student Information &amp; Enrollment Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Student-Service (Port 8082)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Institutional database repository for registered student scholars, demographics, and study year
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadStudents}
            className="p-2.5 rounded-xl border border-surface-border text-ink-secondary hover:text-primary hover:bg-surface-hover transition cursor-pointer"
            title="Refresh from Gateway"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* SAGA Orchestration Workflow Demo Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                const randomId = `SAGA${Math.floor(1000 + Math.random() * 9000)}`;
                setFormData({ ...initialForm, studentId: randomId, name: 'Saga Candidate' });
                setSagaResult(null);
                setSagaModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Workflow className="w-4 h-4" />
              <span>SAGA Workflow</span>
            </button>
          )}

          {/* Create Student Button */}
          {(isAdmin || isFaculty) && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enrol Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student ID, name, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 my-auto text-ink-muted hover:text-ink-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span>Department:</span>
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft text-ink-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Departments ({students.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / State Container */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadStudents} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title="No Students Found"
            description={
              searchQuery || departmentFilter !== 'ALL'
                ? 'No students match your filter criteria. Try adjusting or clearing search terms.'
                : 'No student records are currently registered in the database.'
            }
            actionText={isAdmin ? 'Enrol First Student' : undefined}
            onAction={isAdmin ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-soft/80 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => toggleSort('studentId')}>
                    <div className="flex items-center gap-1">
                      <span>Student ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>Name &amp; Contact</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => toggleSort('department')}>
                    <div className="flex items-center gap-1">
                      <span>Department</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => toggleSort('year')}>
                    <div className="flex items-center gap-1">
                      <span>Study Year / Section</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-ink-primary" onClick={() => toggleSort('gender')}>
                    <div className="flex items-center gap-1">
                      <span>Gender</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-xs">
                {paginatedStudents.map((s) => (
                  <tr key={s.id || s.studentId} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {s.studentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink-primary">{s.name}</div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{s.email}</span>
                        {s.phone && (
                          <>
                            <span className="text-ink-light">&bull;</span>
                            <Phone className="w-3 h-3" />
                            <span>{s.phone}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-soft border border-surface-border font-medium text-ink-secondary">
                        {s.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-ink-secondary">
                      <div className="font-semibold text-ink-primary">Year {s.year}</div>
                      <div className="text-[11px] text-ink-muted">
                        Section {s.section || 'General'} &bull; Adm: {s.admissionYear}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                        {s.gender}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenView(s)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-primary hover:bg-surface-soft transition cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(isAdmin || isFaculty) && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-blue-600 hover:bg-surface-soft transition cursor-pointer"
                            title="Edit Student Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(s)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-surface-soft transition cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        {!loading && filteredStudents.length > 0 && (
          <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
            <div>
              Showing <span className="font-bold text-ink-primary">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-ink-primary">
                {Math.min(currentPage * pageSize, filteredStudents.length)}
              </span>{' '}
              of <span className="font-bold text-ink-primary">{filteredStudents.length}</span> students
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

      {/* CREATE STUDENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Enrol New Student Profile"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. STU1005"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Riya Sharma"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="riya.sharma@edupulse.edu"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+919876543210"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Date of Birth * (yyyy-MM-dd)
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Year of Study (1–6) *
              </label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Section
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Admission Year *
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                required
                value={formData.admissionYear}
                onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
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
              {formSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <span>Complete Enrollment</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Student: ${activeStudent?.studentId}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Year of Study *
              </label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              disabled={formSubmitting}
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-surface-hover cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {formSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW STUDENT DETAILS MODAL */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Student Profile: ${activeStudent?.name}`}
      >
        {activeStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-soft border border-surface-border">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                {activeStudent.name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-primary">{activeStudent.name}</h4>
                <div className="text-xs font-mono font-semibold text-primary">{activeStudent.studentId}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-surface-border bg-surface">
                <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Department</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{activeStudent.department}</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-surface">
                <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Class / Year</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">Year {activeStudent.year} (Sec {activeStudent.section || 'A'})</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-surface">
                <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Email</span>
                <span className="font-semibold text-ink-primary mt-0.5 block truncate">{activeStudent.email}</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-surface">
                <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Phone</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{activeStudent.phone || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-surface">
                <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Date of Birth</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{activeStudent.dateOfBirth}</span>
              </div>
              <div className="p-3 rounded-xl border border-surface-border bg-surface">
                <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Admission Year</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{activeStudent.admissionYear}</span>
              </div>
            </div>

            <div className="text-[11px] text-ink-muted flex justify-between pt-2 border-t border-surface-border">
              <span>DB Primary Key: #{activeStudent.id}</span>
              <span>Updated: {activeStudent.updatedAt ? new Date(activeStudent.updatedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* SAGA ORCHESTRATION DEMO MODAL */}
      <Modal
        isOpen={sagaModalOpen}
        onClose={() => setSagaModalOpen(false)}
        title="SAGA Multi-Step Enrollment Orchestration"
      >
        <form onSubmit={handleSagaSubmit} className="space-y-4">
          <p className="text-xs text-ink-muted leading-relaxed">
            Demonstrates distributed Saga transaction pattern. 
            Step 1 creates student profile; Step 2 initializes downstream attendance eligibility. 
            If failure is simulated at Step 2, a <strong>compensating rollback</strong> deletes the newly created profile to restore distributed consistency.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">Candidate ID</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-surface-border font-mono bg-surface-soft"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">Candidate Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-surface-border bg-surface-soft"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
              <input
                type="checkbox"
                checked={sagaSimulateFailure}
                onChange={(e) => setSagaSimulateFailure(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span>Simulate Downstream Failure &amp; Compensation Rollback</span>
            </label>
            <p className="text-[10px] text-amber-700 mt-1 pl-6">
              When checked, triggers Step 2 exception and executes compensating delete transaction.
            </p>
          </div>

          {sagaResult && (
            <div className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto ${
              sagaResult.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-bold mb-1">Workflow Status: {sagaResult.status}</div>
              <pre>{JSON.stringify(sagaResult, null, 2)}</pre>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setSagaModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={sagaSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {sagaSubmitting ? 'Executing Saga...' : 'Run Orchestration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Student Profile"
        message={`Are you sure you want to delete student ${activeStudent?.name} (${activeStudent?.studentId})? This will permanently remove their record from the institutional PostgreSQL database.`}
        confirmText="Confirm Delete"
        loading={formSubmitting}
      />

    </div>
  );
}
