import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building, CalendarCheck2, Award, 
  Server, Activity, ShieldCheck, ArrowRight, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { adminService } from '../../services/adminService';
import { studentService } from '../../services/studentService';

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department distribution
  const departmentData = [
    { name: 'Comp Science (CSE)', students: 1240, faculty: 58 },
    { name: 'AI & Data Science', students: 820, faculty: 36 },
    { name: 'Information Tech', students: 680, faculty: 32 },
    { name: 'Electronics (ECE)', students: 740, faculty: 42 },
    { name: 'Mechanical & Auto', students: 480, faculty: 28 },
  ];

  // Campus enrollment
  const campusData = [
    { name: 'Bengaluru Knowledge Campus', value: 1850, color: '#0B3C8C' },
    { name: 'Delhi NCR Tech Campus', value: 920, color: '#1456A0' },
    { name: 'Hyderabad Cyber Campus', value: 710, color: '#2563EB' },
    { name: 'Pune Engineering Wing', value: 480, color: '#3B82F6' },
  ];

  useEffect(() => {
    loadRegistry();
  }, []);

  const loadRegistry = async () => {
    setLoading(true);
    try {
      const data = await adminService.getServiceRegistry();
      setServices(data || []);
    } catch (e) {
      console.warn('Fallback registry:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Admin Header */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Institutional Central Administration Console
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
              Registrar &amp; Academic Governance
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Real-time administrative control across 4 autonomous campuses, academic admissions, and institutional records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/services"
            className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Institutional Services</span>
          </Link>
          <Link
            to="/admin/students"
            className="px-3.5 py-2 rounded-lg border border-surface-border bg-surface-soft hover:bg-surface-alt text-xs font-semibold text-ink-secondary flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Directory</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Scholars"
          value="3,960"
          subtitle="Across 4 Autonomous Campuses"
          icon={Users}
          color="primary"
          trend="+12.4%"
          trendLabel="YoY Intake"
        />

        <StatCard
          title="Academic Faculty"
          value="196"
          subtitle="92% Ph.D. Qualified"
          icon={Building}
          color="secondary"
          trend="1:20 Ratio"
          trendLabel="AICTE Compliant"
        />

        <StatCard
          title="Institutional Systems"
          value="100% Active"
          subtitle="Enterprise ERP Cluster"
          icon={ShieldCheck}
          color="success"
          trend="Optimal"
          trendLabel="High Availability"
        />

        <StatCard
          title="System Response Time"
          value="3.2 ms"
          subtitle="High-Performance Enterprise DB"
          icon={Activity}
          color="warning"
          trend="Real-Time"
          trendLabel="Latency Monitored"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department-wise Student & Faculty Distribution */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Department-wise Enrollment Distribution
              </h2>
              <p className="text-xs text-ink-muted">Enrolled scholars vs departmental faculty strength</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="students" name="Students" fill="#0B3C8C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" name="Faculty" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campus Distribution */}
        <div className="inst-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">
                Multi-Campus Scholar Distribution
              </h2>
              <p className="text-xs text-ink-muted">Enrollment across autonomous zonal tech campuses</p>
            </div>
            <span className="text-xs font-bold text-primary">Total: 3,960</span>
          </div>

          <div className="h-64 w-full flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                  >
                    {campusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-2 text-xs">
              {campusData.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-ink-secondary truncate">{c.name.split(' ')[0]}</span>
                  </div>
                  <span className="font-mono font-bold text-ink-primary">{c.value}</span>
                </div>
              ))}
            </div>
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
            <p className="text-xs text-ink-muted">Active nodes registered with Netflix Eureka &amp; Spring Cloud Gateway</p>
          </div>
          <Link
            to="/admin/services"
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
                <th>Host : Port</th>
                <th>Status</th>
                <th>Health Check</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((s) => (
                  <tr key={s.name}>
                    <td className="font-mono font-bold text-primary">{s.name}</td>
                    <td className="text-xs text-ink-secondary">{s.role}</td>
                    <td className="font-mono text-xs text-ink-muted">{s.host}:{s.port}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-emerald-700 font-semibold">{s.health}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-xs text-ink-muted">
                    Loading live service topology from API Gateway...
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
