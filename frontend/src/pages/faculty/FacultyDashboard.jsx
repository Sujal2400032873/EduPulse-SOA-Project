import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, CalendarCheck2, Award, 
  Clock, ArrowRight, CheckCircle2, Shield, Plus 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';

export default function FacultyDashboard() {
  const { user } = useAuth();

  // Assigned courses for current faculty member
  const assignedCourses = [
    {
      code: 'CS603',
      name: 'Cloud & Microservices Architecture',
      department: 'Computer Science & Engineering',
      semester: 'Semester VI',
      enrolledStudents: 68,
      attendanceLogged: '100% Today',
      nextClass: 'Today, 11:30 AM (LH-302)'
    },
    {
      code: 'CS601',
      name: 'Design & Analysis of Algorithms',
      department: 'Computer Science & Engineering',
      semester: 'Semester VI',
      enrolledStudents: 72,
      attendanceLogged: 'Pending Today',
      nextClass: 'Tomorrow, 09:00 AM (LH-105)'
    },
    {
      code: 'CS606L',
      name: 'Cloud Systems Laboratory',
      department: 'Computer Science & Engineering',
      semester: 'Semester VI',
      enrolledStudents: 36,
      attendanceLogged: 'Completed',
      nextClass: 'Friday, 02:00 PM (Lab 4)'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Faculty Profile Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-inst-sm">
            {user?.fullName?.charAt(0) || 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-primary">
                {user?.fullName || 'Dr. Anand Verma'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Dean Academic &bull; Professor CSE
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted mt-1">
              <span>Faculty ID: <strong className="text-ink-secondary font-mono">FAC-CSE-018</strong></span>
              <span>&bull;</span>
              <span>Department: <strong className="text-ink-secondary">Computer Science &amp; Engineering</strong></span>
              <span>&bull;</span>
              <span>Campus: <strong className="text-ink-secondary">Bengaluru Knowledge Campus</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/attendance"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm"
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Mark Daily Attendance</span>
          </Link>
        </div>
      </div>

      {/* Faculty KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Courses"
          value="3 Subjects"
          subtitle="2 Theory &bull; 1 Laboratory"
          icon={BookOpen}
          color="primary"
        />

        <StatCard
          title="Active Students"
          value="176 Enrolled"
          subtitle="Across B.Tech CSE Sem VI"
          icon={Users}
          color="secondary"
        />

        <StatCard
          title="Attendance Completed"
          value="94.2%"
          subtitle="Registers finalized for current week"
          icon={CalendarCheck2}
          color="success"
        />

        <StatCard
          title="Grading Status"
          value="Internal Test-2"
          subtitle="Marks verification underway"
          icon={Award}
          color="warning"
        />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/faculty/attendance"
          className="inst-card p-5 hover:border-primary-300 hover:shadow-inst transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              Classroom Attendance
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              Take Class Attendance
            </h3>
            <p className="text-xs text-ink-muted">
              Record daily lecture and lab attendance for enrolled batches
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/faculty/marks"
          className="inst-card p-5 hover:border-primary-300 hover:shadow-inst transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              Examination &amp; Grading
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              Enter Student Marks
            </h3>
            <p className="text-xs text-ink-muted">
              Submit internal assessment, mid-term, and end-semester scores
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Assigned Courses Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Assigned Instructional Modules &bull; Even Semester 2025-26
            </h2>
            <p className="text-xs text-ink-muted">Teaching responsibilities sanctioned by Board of Studies</p>
          </div>
          <span className="text-xs text-ink-muted font-mono">CBCS Scheme 2022</span>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Enrolled</th>
                <th>Attendance Status</th>
                <th>Upcoming Session</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedCourses.map((c) => (
                <tr key={c.code}>
                  <td className="font-mono font-bold text-primary">{c.code}</td>
                  <td className="font-semibold text-ink-primary">{c.name}</td>
                  <td className="text-xs text-ink-muted">{c.department}</td>
                  <td className="text-xs font-semibold">{c.semester}</td>
                  <td className="font-mono font-bold text-ink-secondary">{c.enrolledStudents}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.attendanceLogged.includes('100%') || c.attendanceLogged.includes('Completed')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.attendanceLogged}
                    </span>
                  </td>
                  <td className="text-xs text-ink-muted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{c.nextClass}</span>
                  </td>
                  <td>
                    <Link
                      to="/faculty/attendance"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Log Register
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
