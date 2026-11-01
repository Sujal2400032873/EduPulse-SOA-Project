import React, { useState, useEffect } from 'react';
import { 
  Award, Download, Printer, CheckCircle2, 
  AlertTriangle, BookOpen, RefreshCw, Shield, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resultService } from '../../services/resultService';
import { useToast } from '../../context/ToastContext';

export default function ResultsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  useEffect(() => {
    loadTranscriptData();
  }, []);

  const loadTranscriptData = async () => {
    setLoading(true);
    try {
      const [transRes, resRes] = await Promise.allSettled([
        resultService.getMyTranscript(),
        resultService.getMyResults()
      ]);

      if (transRes.status === 'fulfilled' && transRes.value) {
        setTranscript(transRes.value);
      }
      if (resRes.status === 'fulfilled' && Array.isArray(resRes.value)) {
        setResultsList(resRes.value);
      }
    } catch (err) {
      addToast('Could not load academic transcript', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredResults = resultsList.filter(r => {
    if (selectedSemester === 'ALL') return true;
    return r.semester === parseInt(selectedSemester, 10);
  });

  const availableSemesters = Array.from(new Set(resultsList.map(r => r.semester))).sort();
  const cgpaDisplay = transcript?.cgpa ? Number(transcript.cgpa).toFixed(2) : '—';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Official Academic Transcript &amp; Grade Card
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200 print:hidden">
              Autonomous Examination Controller
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Certified academic achievements calculated according to UGC 10-point grading system.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={loadTranscriptData}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl border border-surface-border bg-surface-soft hover:bg-surface-hover text-xs font-semibold text-ink-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Grade Card</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Cumulative CGPA</span>
            <div className="p-2 rounded-lg bg-blue-50 text-primary print:hidden">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${cgpaDisplay} / 10.0`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>UGC 10-Point Scale</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Credits Earned</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 print:hidden">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${transcript?.earnedCredits || 0} / ${transcript?.totalCredits || 0}`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Total Degree Credits</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Evaluated Courses</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 print:hidden">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : transcript?.totalSubjects || resultsList.length}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>Registered Subjects</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-2 border-l-2 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Academic Standing</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 print:hidden">
              <Shield size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : (transcript?.failedSubjects === 0 ? 'Passed' : transcript?.failedSubjects > 0 ? 'Backlog' : 'Clear')}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>{transcript?.failedSubjects || 0} Subject Arrears</span>
          </div>
        </div>

      </div>

      {/* Grade Card Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Certified Course Grade Sheet
            </h2>
            <p className="text-xs text-ink-muted">
              Student PRN: <strong className="font-mono text-ink-primary">{user?.username}</strong>
            </p>
          </div>

          {availableSemesters.length > 1 && (
            <div className="flex items-center gap-2 print:hidden">
              <span className="text-xs text-ink-muted">Filter Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Semesters</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Marks Obtained</th>
                <th>Percentage</th>
                <th>Letter Grade</th>
                <th>Grade Point</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((res) => {
                  const isFail = res.grade === 'F';
                  return (
                    <tr key={res.id}>
                      <td className="font-mono font-bold text-primary">{res.subjectCode}</td>
                      <td className="font-semibold text-ink-primary">{res.subjectName}</td>
                      <td className="font-mono text-xs">Sem {res.semester}</td>
                      <td className="font-mono text-xs">{res.credits}</td>
                      <td className="font-mono font-bold text-ink-primary">
                        {Number(res.marks).toFixed(1)} / {Number(res.maxMarks).toFixed(0)}
                      </td>
                      <td className="font-mono text-xs font-semibold">
                        {Number(res.percentage).toFixed(1)}%
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFail
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-primary-50 text-primary border border-primary-200'
                        }`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="font-mono text-xs font-bold text-ink-secondary">
                        {Number(res.gradePoint).toFixed(1)}
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          isFail ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {isFail ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                          <span>{isFail ? 'FAIL' : 'PASS'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-xs text-ink-muted">
                    {loading ? 'Retrieving official grade records...' : 'No result records registered for this scholar yet.'}
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
