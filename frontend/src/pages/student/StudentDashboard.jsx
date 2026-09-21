import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, CalendarCheck2, BookOpen, CheckCircle2, 
  TrendingUp, AlertTriangle, ArrowRight, User, Shield, Download 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { resultService } from '../../services/resultService';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/common/StatCard';
import { AttendanceBadge, GradeBadge } from '../../components/common/Badge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.studentId || '250';

  const [transcript, setTranscript] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [transData, attData] = await Promise.allSettled([
        resultService.getTranscript(studentId),
        attendanceService.getStudentSummary(studentId),
      ]);

      if (transData.status === 'fulfilled') {
        setTranscript(transData.value);
      }
      if (attData.status === 'fulfilled') {
        setAttendance(attData.value);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Semester CGPA Trajectory Data
  const cgpaTrendData = [
    { semester: 'Sem 1', sgpa: 8.8, cgpa: 8.8 },
    { semester: 'Sem 2', sgpa: 9.0, cgpa: 8.9 },
    { semester: 'Sem 3', sgpa: 9.2, cgpa: 9.0 },
    { semester: 'Sem 4', sgpa: 9.1, cgpa: 9.03 },
    { semester: 'Sem 5', sgpa: 9.3, cgpa: 9.12 },
    { semester: 'Sem 6', sgpa: 9.4, cgpa: transcript?.gpa || 9.4 },
  ];

  // Subject Marks Comparison Data
  const subjectChartData = transcript?.subjectResults?.map((s) => ({
    name: s.subject.length > 18 ? s.subject.substring(0, 16) + '..' : s.subject,
    marks: s.marks,
    maxMarks: s.maxMarks || 100,
  })) || [
    { name: 'Algorithms', marks: 94, maxMarks: 100 },
    { name: 'DBMS', marks: 91.5, maxMarks: 100 },
    { name: 'Microservices', marks: 96, maxMarks: 100 },
    { name: 'OS & Kernels', marks: 88, maxMarks: 100 },
    { name: 'Networks', marks: 90, maxMarks: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Student Identity Card Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-inst-sm">
            {transcript?.studentName?.charAt(0) || user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-primary">
                {transcript?.studentName || user?.fullName || 'Aditya Senpai'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Matriculated &bull; Regular
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted mt-1">
              <span>PRN / Roll No: <strong className="text-ink-secondary font-mono">{transcript?.studentId || studentId}</strong></span>
              <span>&bull;</span>
              <span>Program: <strong className="text-ink-secondary">{transcript?.studentClass || 'B.Tech CSE - Sem VI'}</strong></span>
              <span>&bull;</span>
              <span>Campus: <strong className="text-ink-secondary">{transcript?.campus || 'Bengaluru Knowledge Campus'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/results"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Official Grade Card</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cumulative CGPA"
          value={`${transcript?.gpa || 9.4} / 10.0`}
          subtitle="Dean's Honor Roll (Top 2%)"
          icon={Award}
          color="primary"
          trend="+0.28"
          trendLabel="over previous semester"
        />

        <StatCard
          title="Overall Attendance"
          value={`${transcript?.attendancePercentage || attendance?.attendancePercentage || 100}%`}
          subtitle={`${transcript?.attendancePresentDays || attendance?.presentDays || 7} / ${transcript?.attendanceTotalDays || attendance?.totalDays || 7} Academic Days Present`}
          icon={CalendarCheck2}
          color="success"
          trend="Compliant"
          trendLabel="&ge; 75% Institutional Standard"
        />

        <StatCard
          title="Degree Credits"
          value="124 / 160"
          subtitle="77.5% Degree Requirements Fulfilled"
          icon={BookOpen}
          color="secondary"
          trend="Semester VI"
          trendLabel="Even Session 2025-26"
        />

        <StatCard
          title="Academic Standing"
          value="Distinction"
          subtitle="Controller of Exams Verified"
          icon={Shield}
          color="warning"
          trend="NAD Synced"
          trendLabel="DigiLocker ID Active"
        />
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: CGPA Trajectory */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Semester-wise CGPA &amp; SGPA Trajectory
              </h2>
              <p className="text-xs text-ink-muted">10.0 Scale Performance across Semesters I - VI</p>
            </div>
            <span className="text-xs font-semibold text-primary">Target: 9.5</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={11} />
                <YAxis domain={[8.0, 10.0]} stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="sgpa" name="Semester SGPA" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#0B3C8C" strokeWidth={2.5} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Subject Marks Breakdown */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Current Semester Subject Marks
              </h2>
              <p className="text-xs text-ink-muted">Consolidated Marks / 100 for End-Term Assessments</p>
            </div>
            <Link to="/student/results" className="text-xs font-semibold text-secondary hover:underline">
              View All Marks &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
                />
                <Bar dataKey="marks" name="Marks Obtained" fill="#1456A0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Current Semester Courses & Marks Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Enrolled Course Evaluations &bull; Semester VI
            </h2>
            <p className="text-xs text-ink-muted">Official Grade Records certified by Controller of Examinations</p>
          </div>
          <Link
            to="/student/attendance"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Review Attendance &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Assessment</th>
                <th>Semester</th>
                <th>Marks / 100</th>
                <th>Grade</th>
                <th>Grade Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transcript?.subjectResults && transcript.subjectResults.length > 0 ? (
                transcript.subjectResults.map((sub, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-ink-primary">{sub.subject}</td>
                    <td className="text-ink-muted">{sub.examType}</td>
                    <td>{sub.semester}</td>
                    <td className="font-mono font-bold text-primary">{sub.marks}</td>
                    <td><GradeBadge grade={sub.grade} /></td>
                    <td className="font-mono font-bold">{sub.gradePoints?.toFixed(1)}</td>
                    <td>
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-xs text-ink-muted">
                    No course assessments recorded for this semester yet.
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
