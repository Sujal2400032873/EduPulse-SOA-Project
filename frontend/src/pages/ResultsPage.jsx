import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  BookOpen,
  Filter,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ResultsPage({ setActiveTab, setSelectedStudentId }) {
  const { user, isAdmin, isFaculty } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsList, setStudentsList] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  // Add marks modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: 'Mathematics',
    marks: 85,
    maxMarks: 100,
    examType: 'Final Term',
    semester: 'Semester 1',
    academicYear: '2025-2026',
    remarks: 'Consistent academic performance',
  });
  const [computedGrade, setComputedGrade] = useState('A');
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    loadResultsAndStudents();
  }, []);

  const loadResultsAndStudents = async () => {
    setLoading(true);
    try {
      const [resList, stuList] = await Promise.all([
        api.results.getAll(),
        api.students.getAll(),
      ]);
      setResults(resList);
      setStudentsList(stuList);
      if (stuList.length > 0 && !formData.studentId) {
        setFormData((prev) => ({ ...prev, studentId: stuList[0].studentId }));
      }
    } catch (e) {
      console.error('Failed to load results:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradePreview = (marks, maxMarks) => {
    const m = parseFloat(marks) || 0;
    const max = parseFloat(maxMarks) || 100;
    const pct = (m / max) * 100;
    if (pct >= 90) return 'A+ (4.0)';
    if (pct >= 80) return 'A (3.7)';
    if (pct >= 70) return 'B (3.0)';
    if (pct >= 60) return 'C (2.0)';
    if (pct >= 50) return 'D (1.0)';
    return 'F (0.0)';
  };

  const handleMarksChange = (marks) => {
    setFormData((prev) => ({ ...prev, marks }));
    setComputedGrade(calculateGradePreview(marks, formData.maxMarks));
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      await api.results.add({
        ...formData,
        marks: parseFloat(formData.marks),
        maxMarks: parseFloat(formData.maxMarks),
      });
      setIsModalOpen(false);
      loadResultsAndStudents();
    } catch (err) {
      setModalError(err.message || 'Failed to record marks');
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (window.confirm('Delete this assessment result?')) {
      try {
        await api.results.delete(resultId);
        loadResultsAndStudents();
      } catch (e) {
        alert(e.message || 'Failed to delete');
      }
    }
  };

  const handleViewTranscript = (studentId) => {
    if (setSelectedStudentId) setSelectedStudentId(studentId);
    setActiveTab('transcript');
  };

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesSubject = !filterSubject || r.subject === filterSubject;
    const matchesStudent = !searchStudent || r.studentId.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesSubject && matchesStudent;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-brand-400" />
            Academic Performance & Marks Grading
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Managed by Result Service · Automated grading scale, GPA points & multi-subject assessment records
          </p>
        </div>

        {(isAdmin || isFaculty) && (
          <button
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-glow-sm"
          >
            <Plus className="w-4 h-4" />
            Record Assessment Marks
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Student ID (e.g. STU-1001)..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="English Literature">English Literature</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Result ID</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Exam Type & Semester</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Letter Grade</th>
                <th className="py-3.5 px-4">GPA Points</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Loading results from Result Service...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    No academic records match your query.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => {
                  const pct = Math.round((res.marks / res.maxMarks) * 100);

                  return (
                    <tr key={res.resultId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        #{res.resultId}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-400">
                        {res.studentId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {res.subject}
                        {res.remarks && (
                          <div className="text-[10px] text-slate-400 font-normal">{res.remarks}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                          {res.examType} · {res.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white text-sm">{res.marks}</span>
                        <span className="text-slate-400 text-[11px]"> / {res.maxMarks}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({pct}%)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                          res.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald' :
                          res.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          res.grade === 'B' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          res.grade === 'C' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                        {res.gradePoints} / 4.0
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewTranscript(res.studentId)}
                            title="Open Student Transcript"
                            className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-cyan-500/20 transition flex items-center gap-1 text-[11px] font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Transcript
                          </button>
                          {(isAdmin || isFaculty) && (
                            <button
                              onClick={() => handleDeleteResult(res.resultId)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Marks Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-750 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-400" />
                Record Assessment Marks
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveResult} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Select Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs font-mono"
                >
                  {studentsList.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} - {s.name} ({s.studentClass})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Academic Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English Literature">English Literature</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="World History">World History</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Marks Obtained</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={formData.maxMarks}
                    required
                    value={formData.marks}
                    onChange={(e) => handleMarksChange(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Letter Grade Preview */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Calculated Evaluation:</span>
                <span className="font-bold text-brand-400 font-mono text-sm">{computedGrade}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Exam Type</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  >
                    <option value="Midterm">Midterm</option>
                    <option value="Final Term">Final Term</option>
                    <option value="Unit Assessment">Unit Assessment</option>
                    <option value="Lab Practical">Lab Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Faculty Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Excellent analytical comprehension"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs"
                />
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
                  Commit Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
