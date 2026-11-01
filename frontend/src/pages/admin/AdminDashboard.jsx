import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building, CalendarCheck2, Award, 
  Server, Activity, ShieldCheck, ArrowRight, RefreshCw,
  CheckCircle2, AlertCircle, AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { resultService } from '../../services/resultService';
import { systemService } from '../../services/systemService';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [studentStats, setStudentStats] = useState({ totalStudents: 0, totalDepartments: 0 });
  const [attendanceStats, setAttendanceStats] = useState({ totalRecords: 0, presentCount: 0, absentCount: 0, overallPercentage: 0 });
  const [resultStats, setResultStats] = useState({ totalResults: 0, passedCount: 0, failedCount: 0, passRate: 0 });
  const [services, setServices] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [stuRes, attRes, resRes, svcRes, allStudents] = await Promise.allSettled([
        studentService.getStats(),
        attendanceService.getStats(),
        resultService.getStats(),
        systemService.checkAllServices(),
        studentService.getAll()
      ]);

      if (stuRes.status === 'fulfilled' && stuRes.value) {
        setStudentStats(stuRes.value);
      }
      if (attRes.status === 'fulfilled' && attRes.value) {
        setAttendanceStats(attRes.value);
      }
      if (resRes.status === 'fulfilled' && resRes.value) {
        setResultStats(resRes.value);
      }
      if (svcRes.status === 'fulfilled' && svcRes.value) {
        setServices(svcRes.value);
      }

      // Compute real department distribution from student records
      if (allStudents.status === 'fulfilled' && Array.isArray(allStudents.value)) {
        const counts = {};
        allStudents.value.forEach(s => {
          const dept = s.department || 'General / Undeclared';
          counts[dept] = (counts[dept] || 0) + 1;
        });
        const deptChart = Object.keys(counts).map(dept => ({
          name: dept.length > 20 ? dept.substring(0, 18) + '...' : dept,
          fullName: dept,
          students: counts[dept]
        }));
        setDepartmentData(deptChart);
      }
    } catch (err) {
      addToast('Error aggregating institutional metrics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadAllDashboardData();
    addToast('Institutional telemetry refreshed', 'info');
  };

  const activeServiceCount = services.filter(s => s.status === 'UP').length;

  const attendancePieData = [
    { name: 'Present', value: attendanceStats.presentCount || 0, color: '#16865C' },
    { name: 'Absent', value: attendanceStats.absentCount || 0, color: '#D64545' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Institutional Central Administration Console
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
              Registrar &amp; Academic Governance
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Real-time telemetry and management across PostgreSQL <code className="font-mono text-ink-primary">soa_hack</code> microservice mesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl border border-surface-border bg-surface-soft hover:bg-surface-hover text-xs font-semibold text-ink-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            to="/students"
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Management</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid with Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Enrolled Students</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : studentStats.totalStudents}
          </div>
          <div className="text-[11px] text-ink-muted flex items-center gap-1">
            <Building className="w-3 h-3 text-primary" />
            <span>Across <strong>{studentStats.totalDepartments}</strong> Academic Depts</span>
          </div>
        </div>

        {/* Attendance Compliance */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Overall Attendance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${Number(attendanceStats.overallPercentage).toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>{attendanceStats.totalRecords} total session entries logged</span>
          </div>
        </div>

        {/* Academic Pass Rate */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Academic Pass Rate</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${Number(resultStats.passRate).toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-ink-muted">
            <span>{resultStats.passedCount} of {resultStats.totalResults} grades passed</span>
          </div>
        </div>

        {/* Service Mesh Status */}
        <div className="inst-card p-4 space-y-2 border-l-2 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">SOA Mesh Status</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Server size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {loading ? '...' : `${activeServiceCount} / ${services.length || 6} UP`}
          </div>
          <div className="text-[11px] text-ink-muted flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600" />
            <span>Eureka &amp; Gateway Registered</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts with Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Enrollment Distribution */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Departmental Scholar Distribution
              </h2>
              <p className="text-xs text-ink-muted">Active enrollments grouped by academic department</p>
            </div>
            <span className="text-xs font-bold text-primary font-mono">{studentStats.totalStudents} Students</span>
          </div>

          <div className="h-64 w-full">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                  <XAxis dataKey="name" stroke="#69758A" fontSize={11} />
                  <YAxis stroke="#69758A" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E4E9F2', fontSize: '12px' }} 
                  />
                  <Bar dataKey="students" name="Students" fill="#3157D5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-muted">
                {loading ? 'Loading department metrics...' : 'No department records registered yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Real Attendance Ratio */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Institutional Attendance Ratio
              </h2>
              <p className="text-xs text-ink-muted">Ratio of Present vs Absent attendance records</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              {Number(attendanceStats.overallPercentage).toFixed(1)}% Compliance
            </span>
          </div>

          <div className="h-64 w-full flex items-center">
            {attendanceStats.totalRecords > 0 ? (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendancePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {attendancePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-1/2 space-y-3 text-xs pl-4 border-l border-surface-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                      <span className="text-ink-secondary">Present Days</span>
                    </div>
                    <span className="font-mono font-bold text-ink-primary">{attendanceStats.presentCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0" />
                      <span className="text-ink-secondary">Absent Days</span>
                    </div>
                    <span className="font-mono font-bold text-ink-primary">{attendanceStats.absentCount}</span>
                  </div>
                  <div className="pt-2 border-t border-surface-border flex items-center justify-between font-bold">
                    <span className="text-ink-muted">Total Recorded</span>
                    <span className="font-mono text-ink-primary">{attendanceStats.totalRecords}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">
                {loading ? 'Aggregating attendance telemetry...' : 'No attendance events logged yet.'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Microservices Status Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Enterprise Microservice Mesh Topology
            </h2>
            <p className="text-xs text-ink-muted">Live heartbeats probed across Netflix Eureka, Spring Cloud Gateway &amp; Service Nodes</p>
          </div>
          <Link
            to="/services"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Full Registry Details &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Role in Architecture</th>
                <th>Port</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Last Probed</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((s) => (
                  <tr key={s.id || s.name}>
                    <td className="font-mono font-bold text-primary">{s.name}</td>
                    <td className="text-xs text-ink-secondary">{s.role}</td>
                    <td className="font-mono text-xs text-ink-muted">{s.port}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'UP'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'UP' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-ink-primary">
                      {s.latency !== undefined ? `${s.latency} ms` : '—'}
                    </td>
                    <td className="text-xs text-ink-muted">
                      {s.lastChecked || 'Just now'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-xs text-ink-muted">
                    {loading ? 'Probing service health via API Gateway...' : 'No microservice status available.'}
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
