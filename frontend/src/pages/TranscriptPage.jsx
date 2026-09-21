import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  GraduationCap, 
  Award, 
  CalendarCheck2, 
  Building, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Search,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TranscriptPage({ selectedStudentId }) {
  const { user, isStudent } = useAuth();
  const [currentStudentId, setCurrentStudentId] = useState(
    isStudent && user?.studentId ? user.studentId : (selectedStudentId || 'STU-1001')
  );
  const [studentsList, setStudentsList] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState('');

  useEffect(() => {
    loadStudentsList();
  }, []);

  useEffect(() => {
    if (currentStudentId) {
      loadTranscript(currentStudentId, semesterFilter);
    }
  }, [currentStudentId, semesterFilter]);

  const loadStudentsList = async () => {
    try {
      const list = await api.students.getAll();
      setStudentsList(list);
    } catch (e) {
      console.error('Failed to load students:', e);
    }
  };

  const loadTranscript = async (id, sem) => {
    setLoading(true);
    try {
      const data = await api.results.getTranscript(id, sem);
      setTranscript(data);
    } catch (err) {
      console.error('Failed to load transcript:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header - Hidden in Print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            360° Academic Transcript & Evaluation Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated via Result Service inter-service calls &rarr; Student Service (Demographics) + Attendance Service (Metrics)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Student Selector (If not a student) */}
          {!isStudent && (
            <select
              value={currentStudentId}
              onChange={(e) => setCurrentStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white font-mono"
            >
              {studentsList.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentId} - {s.name} ({s.studentClass})
                </option>
              ))}
            </select>
          )}

          {/* Print / Export Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-glow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Official Transcript
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-slate-800 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-400 mb-3" />
          <p className="text-sm">Synthesizing 360° Transcript across Microservices...</p>
          <p className="text-xs text-slate-500 mt-1">Fetching Profile &bull; Checking Attendance Logs &bull; Calculating GPA</p>
        </div>
      ) : !transcript ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 text-slate-400">
          No transcript data available for student ID {currentStudentId}.
        </div>
      ) : (
        /* The Official Transcript Document */
        <div className="glass-card p-6 md:p-10 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden transcript-sheet bg-[#0a1122]">
          
          {/* Top National Tricolor Stripe */}
          <div className="tricolor-stripe mb-6 -mx-6 md:-mx-10 -mt-6 md:-mt-10" />

          {/* Watermark Logo in Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <GraduationCap className="w-96 h-96 text-white" />
          </div>

          {/* Institutional Header with National Accreditation */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-400 to-yellow-600 p-0.5 shadow-glow-gold">
                  <div className="w-full h-full bg-[#081220] rounded-[14px] flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-saffron-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-sans">
                      EduPulse National Academy
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 text-[10px] font-bold">
                      NAAC A++
                    </span>
                  </div>
                  <p className="text-xs text-saffron-400 font-semibold tracking-wider uppercase">
                    विद्ययाऽमृतमश्नुते &bull; Deemed to be University (UGC &amp; AICTE Approved)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Office of the Controller of Examinations (CoE) &bull; {transcript.campus || 'Bengaluru Knowledge Campus'}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase">
                  DigiLocker &bull; NAD Certified
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Issue Date: {transcript.dateIssued}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Academic Session: {transcript.academicYear}
                </div>
              </div>
            </div>
          </div>

          {/* Student Profile & Attendance Header Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            {/* Student Info */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Student Demographics (From Student Service)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">STUDENT NAME</span>
                  <span className="font-bold text-white text-sm">{transcript.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STUDENT ID</span>
                  <span className="font-bold font-mono text-brand-400 text-sm">{transcript.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GRADE & SECTION</span>
                  <span className="font-semibold text-white">{transcript.studentClass} ({transcript.section})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CAMPUS</span>
                  <span className="text-slate-200">{transcript.campus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GUARDIAN</span>
                  <span className="text-slate-200">{transcript.guardianName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ENROLLMENT STATUS</span>
                  <span className="text-emerald-400 font-semibold">Active & Matriculated</span>
                </div>
              </div>
            </div>

            {/* Attendance Performance Metric */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Attendance (From Attendance Service)</span>
                  <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {transcript.attendancePercentage}%
                  </span>
                  <span className="text-xs text-slate-400">
                    ({transcript.attendancePresentDays} / {transcript.attendanceTotalDays} Days)
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800">
                {transcript.lowAttendanceWarning ? (
                  <div className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Attendance Shortage Notice (&lt; 75%)
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Compliant with Attendance Policy
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Academic Course Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 mb-6 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Subject Course</th>
                  <th className="py-3 px-4">Assessment Period</th>
                  <th className="py-3 px-4">Score Obtained</th>
                  <th className="py-3 px-4">Max Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4 text-right">GPA Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transcript.subjectResults && transcript.subjectResults.length > 0 ? (
                  transcript.subjectResults.map((r, idx) => {
                    const pct = Math.round((r.marks / r.maxMarks) * 100);
                    return (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-bold text-white">{r.subject}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{r.examType}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white text-sm">{r.marks}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{r.maxMarks}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{pct}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                            r.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-300 font-black' :
                            r.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400' :
                            r.grade === 'B' ? 'bg-blue-500/10 text-blue-400' :
                            r.grade === 'C' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-200 text-right">
                          {r.gradePoints} / 4.0
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-slate-400">
                      No subject marks recorded yet for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Transcript Summary Evaluation Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Marks</span>
                <div className="text-xl font-bold text-white mt-1">
                  {transcript.totalMarksObtained} <span className="text-xs text-slate-400">/ {transcript.totalMaxMarks}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Overall Percentage</span>
                <div className="text-xl font-bold text-brand-400 mt-1">
                  {transcript.overallPercentage}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Cumulative GPA</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {transcript.gpa} <span className="text-xs text-purple-400 font-bold">/ 4.0</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Overall Grade</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {transcript.overallGrade}
                </div>
              </div>

            </div>

            {/* Academic Standing Callout */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Institutional Standing:</span>
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                  {transcript.academicStanding}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Evaluated by Result Service Engine v1.0
              </div>
            </div>
          </div>

          {/* Signatures & Certification Section */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6 text-center text-xs text-slate-400">
            <div>
              <div className="h-10 border-b border-slate-700 mx-auto w-40 mb-1.5 flex items-end justify-center pb-1 text-[11px] font-mono text-saffron-300 font-semibold italic">
                Prof. Ananya Sengupta
              </div>
              <p className="font-semibold text-slate-300">Head of Department (CSE)</p>
              <p className="text-[10px]">Board of Academic Studies</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-saffron-500/50 flex flex-col items-center justify-center text-[8px] uppercase font-bold text-saffron-400 tracking-tighter p-1 text-center font-mono shadow-sm">
                <span>OFFICIAL SEAL</span>
                <span className="text-[7px] text-emerald-400">NAAC A++</span>
              </div>
            </div>

            <div>
              <div className="h-10 border-b border-slate-700 mx-auto w-40 mb-1.5 flex items-end justify-center pb-1 text-[11px] font-mono text-saffron-300 font-semibold italic">
                Dr. K. Venkatraman
              </div>
              <p className="font-semibold text-slate-300">Controller of Examinations (CoE)</p>
              <p className="text-[10px]">National Examination Directorate</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
