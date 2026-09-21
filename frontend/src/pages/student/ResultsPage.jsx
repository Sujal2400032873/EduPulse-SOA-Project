import React, { useState, useEffect } from 'react';
import { 
  Award, Download, Printer, CheckCircle2, 
  Calendar, FileText, Shield, Sparkles, Filter 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resultService } from '../../services/resultService';
import { GradeBadge } from '../../components/common/Badge';

export default function ResultsPage() {
  const { user } = useAuth();
  const studentId = user?.studentId || '250';

  const [selectedSemester, setSelectedSemester] = useState('Sem 6');
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detailed subject-wise breakdown including internals, assignments, midterms, end semester, credits & grade points
  const detailedResults = [
    {
      code: 'CS601',
      subject: 'Design & Analysis of Algorithms',
      credits: 4,
      internals: 28, // /30
      assignments: 18, // /20
      midterm: 24, // /25
      endSem: 46, // /50 (scaled to 100 total)
      total: 94.0,
      grade: 'O',
      gradePoint: 10.0,
      status: 'PASS'
    },
    {
      code: 'CS602',
      subject: 'Database Management Systems',
      credits: 4,
      internals: 27,
      assignments: 19,
      midterm: 23,
      endSem: 44,
      total: 91.5,
      grade: 'O',
      gradePoint: 10.0,
      status: 'PASS'
    },
    {
      code: 'CS603',
      subject: 'Cloud & Microservices Architecture',
      credits: 4,
      internals: 29,
      assignments: 20,
      midterm: 25,
      endSem: 48,
      total: 96.0,
      grade: 'O',
      gradePoint: 10.0,
      status: 'PASS'
    },
    {
      code: 'CS604',
      subject: 'Operating Systems & System Programming',
      credits: 3,
      internals: 26,
      assignments: 17,
      midterm: 22,
      endSem: 42,
      total: 88.0,
      grade: 'A+',
      gradePoint: 9.0,
      status: 'PASS'
    },
    {
      code: 'CS605',
      subject: 'Computer Networks & Security',
      credits: 3,
      internals: 27,
      assignments: 18,
      midterm: 22,
      endSem: 43,
      total: 90.0,
      grade: 'A+',
      gradePoint: 9.0,
      status: 'PASS'
    },
    {
      code: 'CS606L',
      subject: 'Cloud Systems Laboratory',
      credits: 2,
      internals: 30,
      assignments: 20,
      midterm: 24,
      endSem: 48,
      total: 96.0,
      grade: 'O',
      gradePoint: 10.0,
      status: 'PASS'
    }
  ];

  useEffect(() => {
    loadTranscript();
  }, [studentId]);

  const loadTranscript = async () => {
    setLoading(true);
    try {
      const data = await resultService.getTranscript(studentId);
      setTranscript(data);
    } catch (e) {
      console.warn('Loading fallback result records:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = detailedResults.reduce((acc, r) => acc + r.credits, 0);
  const totalWeightedPoints = detailedResults.reduce((acc, r) => acc + (r.credits * r.gradePoint), 0);
  const calculatedSGPA = (totalWeightedPoints / totalCredits).toFixed(2);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Action Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Consolidated Academic Grade Card
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              Verified CoE Transcript
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            UGC 10-Point Choice Based Credit System (CBCS) &bull; National Academic Depository
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-surface-border text-xs text-ink-secondary bg-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="Sem 6">Semester VI (Nov-Dec 2025 Regular)</option>
            <option value="Sem 5">Semester V (May-Jun 2025)</option>
            <option value="Sem 4">Semester IV (Nov-Dec 2024)</option>
          </select>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Transcript</span>
          </button>
        </div>
      </div>

      {/* Official Grade Card Container (Print Friendly Letterhead) */}
      <div className="inst-card p-6 sm:p-8 border border-surface-border print:border-none print:shadow-none space-y-6">
        
        {/* Institutional Formal Header (Shown in Print / Screen) */}
        <div className="border-b-2 border-primary-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
              <Award className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-primary-dark tracking-tight">
                EDUPULSE ACADEMY OF HIGHER EDUCATION
              </h2>
              <div className="text-[11px] text-ink-muted">
                (Declared as Deemed to be University under Section 3 of the UGC Act, 1956)
              </div>
              <div className="text-[10px] text-primary font-semibold">
                Office of the Controller of Examinations &bull; Knowledge Campus, Bengaluru
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-ink-muted">
            <div>Serial No: <strong className="font-mono text-ink-primary">TR-2026-09142</strong></div>
            <div>Date of Issue: <strong className="text-ink-primary">20-Mar-2026</strong></div>
            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">NAD-ABC Registered</div>
          </div>
        </div>

        {/* Student Demographics Header Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-soft border border-surface-border text-xs">
          <div>
            <span className="text-[10px] text-ink-muted uppercase block">Candidate Name</span>
            <span className="font-bold text-ink-primary">{transcript?.studentName || user?.fullName || 'Aditya Senpai'}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase block">PRN / Roll Number</span>
            <span className="font-mono font-bold text-primary">{transcript?.studentId || studentId}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase block">Degree &amp; Branch</span>
            <span className="font-bold text-ink-secondary">B.Tech - Computer Science</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase block">Semester / Scheme</span>
            <span className="font-bold text-ink-secondary">Semester VI &bull; 2022 CBCS</span>
          </div>
        </div>

        {/* Course-wise Results Table */}
        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th className="text-center">Credits</th>
                <th className="text-center">Internals (30)</th>
                <th className="text-center">Assign. (20)</th>
                <th className="text-center">Mid (25)</th>
                <th className="text-center">End Sem (50)</th>
                <th className="text-center">Total (100)</th>
                <th className="text-center">Grade</th>
                <th className="text-center">Grade Points</th>
                <th className="text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {detailedResults.map((r) => (
                <tr key={r.code}>
                  <td className="font-mono font-bold text-primary">{r.code}</td>
                  <td className="font-semibold text-ink-primary">{r.subject}</td>
                  <td className="text-center font-mono font-semibold">{r.credits}</td>
                  <td className="text-center font-mono text-ink-muted">{r.internals}</td>
                  <td className="text-center font-mono text-ink-muted">{r.assignments}</td>
                  <td className="text-center font-mono text-ink-muted">{r.midterm}</td>
                  <td className="text-center font-mono text-ink-muted">{r.endSem}</td>
                  <td className="text-center font-mono font-bold text-primary">{r.total}</td>
                  <td className="text-center"><GradeBadge grade={r.grade} /></td>
                  <td className="text-center font-mono font-bold">{r.gradePoint.toFixed(1)}</td>
                  <td className="text-center">
                    <span className="text-xs font-bold text-emerald-700">PASS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Metric Footer Box */}
        <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
            <div>
              <div className="text-[10px] uppercase font-bold text-ink-muted">Registered Credits</div>
              <div className="text-xl font-black text-ink-primary">{totalCredits}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-ink-muted">Earned Credits</div>
              <div className="text-xl font-black text-emerald-700">{totalCredits}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-primary">Semester SGPA</div>
              <div className="text-2xl font-black text-primary">{calculatedSGPA} / 10.0</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-primary">Cumulative CGPA</div>
              <div className="text-2xl font-black text-primary-dark">{transcript?.gpa || '9.40'} / 10.0</div>
            </div>
          </div>

          <div className="text-right">
            <div className="px-3 py-1.5 rounded bg-surface border border-primary/30 text-xs font-bold text-primary inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>FIRST CLASS WITH DISTINCTION</span>
            </div>
          </div>
        </div>

        {/* Official Authentication & CoE Signature Block */}
        <div className="pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-ink-muted">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-semibold text-ink-primary">Grading Scale (UGC CBCS):</div>
            <div className="text-[10px]">
              O (Outstanding: 10) &bull; A+ (Excellent: 9) &bull; A (Very Good: 8) &bull; B+ (Good: 7) &bull; B (Above Avg: 6)
            </div>
            <div className="text-[10px] text-ink-light mt-1">
              Digitally certified via SHA-256 microservice signature token.
            </div>
          </div>

          <div className="text-center">
            <div className="font-mono text-[11px] text-ink-muted border-b border-ink-muted pb-1 mb-1 w-48 mx-auto">
              Dr. K. S. Narayanan, Ph.D.
            </div>
            <div className="text-xs font-bold text-ink-primary">Controller of Examinations</div>
            <div className="text-[10px] text-ink-muted">EduPulse Academy Central Registry</div>
          </div>
        </div>

      </div>

    </div>
  );
}
