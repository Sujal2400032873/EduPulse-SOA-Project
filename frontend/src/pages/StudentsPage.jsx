import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Building, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  X,
  FileText,
  CalendarCheck2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentsPage({ setActiveTab, setSelectedStudentId }) {
  const { isAdmin, isFaculty } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    studentClass: 'Grade 10',
    section: 'A',
    campus: 'Main Campus',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '2008-05-14',
    guardianName: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [searchQuery, classFilter, campusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (classFilter) params.studentClass = classFilter;
      if (campusFilter) params.campus = campusFilter;

      const data = await api.students.getAll(params);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    setFormError(null);
    if (student) {
      setEditingStudent(student);
      setFormData({
        studentId: student.studentId,
        name: student.name,
        studentClass: student.studentClass,
        section: student.section,
        campus: student.campus || 'Main Campus',
        email: student.email || '',
        phone: student.phone || '',
        gender: student.gender || 'Male',
        dob: student.dob || '2008-05-14',
        guardianName: student.guardianName || '',
        status: student.status || 'ACTIVE',
      });
    } else {
      setEditingStudent(null);
      const randomId = 'STU-' + Math.floor(1000 + Math.random() * 9000);
      setFormData({
        studentId: randomId,
        name: '',
        studentClass: 'Grade 10',
        section: 'A',
        campus: 'Main Campus',
        email: '',
        phone: '',
        gender: 'Male',
        dob: '2008-05-14',
        guardianName: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingStudent) {
        await api.students.update(editingStudent.studentId, formData);
      } else {
        await api.students.create(formData);
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      setFormError(err.message || 'Failed to save student profile');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm(`Are you sure you want to remove student ${studentId}?`)) {
      try {
        await api.students.delete(studentId);
        loadStudents();
      } catch (err) {
        alert(err.message || 'Failed to delete student');
      }
    }
  };

  const handleViewTranscript = (id) => {
    if (setSelectedStudentId) setSelectedStudentId(id);
    setActiveTab('transcript');
  };

  const handleViewAttendance = (id) => {
    if (setSelectedStudentId) setSelectedStudentId(id);
    setActiveTab('attendance');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            Student Demographic Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Managed by Student Service · Centralized demographics, classes, sections, and campuses
          </p>
        </div>

        {(isAdmin || isFaculty) && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-glow-sm"
          >
            <Plus className="w-4 h-4" />
            Enroll New Student
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, or campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Grade Levels</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>

        {/* Campus Filter */}
        <div>
          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Campuses</option>
            <option value="Main Campus">Main Campus</option>
            <option value="North Campus">North Campus</option>
            <option value="East Campus">East Campus</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Class & Sec</th>
                <th className="py-3.5 px-4">Campus</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Guardian</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Loading student records from Student Service...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    No student profiles matched your query.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400">
                      {student.studentId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {student.name}
                      <div className="text-[10px] text-slate-400 font-normal">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/80">
                        {student.studentClass} - {student.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {student.campus}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {student.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {student.guardianName || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleViewAttendance(student.studentId)}
                          title="Attendance Records"
                          className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          <CalendarCheck2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleViewTranscript(student.studentId)}
                          title="View 360° Transcript"
                          className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-cyan-500/20 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {(isAdmin || isFaculty) && (
                          <button
                            onClick={() => handleOpenModal(student)}
                            title="Edit Profile"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteStudent(student.studentId)}
                            title="Remove Student"
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-750 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingStudent ? `Edit Student: ${editingStudent.studentId}` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Student ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jordan Lee"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                  <select
                    value={formData.studentClass}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Campus</label>
                  <select
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  >
                    <option value="Main Campus">Main Campus</option>
                    <option value="North Campus">North Campus</option>
                    <option value="East Campus">East Campus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@edupulse.edu"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Guardian Name</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Parent / Guardian"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
