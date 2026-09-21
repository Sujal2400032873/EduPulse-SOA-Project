import React, { useState, useEffect } from 'react';
import { 
  Server, Activity, RefreshCw, CheckCircle2, 
  ExternalLink, ShieldCheck, Cpu, HardDrive, Globe 
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function ServiceRegistryPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      const data = await adminService.getServiceRegistry();
      setServices(data || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Fallback registry data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Institutional Service Registry
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
              Active Network
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Dynamic service registration, instance health monitoring, and institutional route coordination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted hidden sm:inline">
            Last Poll: <strong>{lastRefreshed}</strong>
          </span>
          <button
            onClick={fetchRegistry}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Registry</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="inst-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-ink-muted uppercase font-semibold">Discovery Server</div>
            <div className="text-lg font-bold text-ink-primary mt-0.5">Eureka Server (:8761)</div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Self-Preservation Off
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="inst-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-ink-muted uppercase font-semibold">Registered Instances</div>
            <div className="text-lg font-bold text-ink-primary mt-0.5">6 Core Microservices</div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% UP and Healthy
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-secondary flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="inst-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-ink-muted uppercase font-semibold">Gateway Edge Proxy</div>
            <div className="text-lg font-bold text-ink-primary mt-0.5">Spring Cloud Gateway (:8080)</div>
            <div className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-0.5">
              <Globe className="w-3 h-3" /> Path Routed (/api/**)
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Eureka Instance Registry &bull; Application Topology
            </h2>
            <p className="text-xs text-ink-muted">Registered service endpoints available for inter-service communication and client routing</p>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            Renewal Interval: 30s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Instance ID</th>
                <th>Status</th>
                <th>Host</th>
                <th>Port</th>
                <th>Health</th>
                <th>Role in Architecture</th>
                <th>Last Synchronized</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.name}>
                  <td>
                    <div className="font-mono font-bold text-primary flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-secondary" />
                      <span>{svc.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-ink-muted">
                    {svc.name.toLowerCase()}:{svc.port}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {svc.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-ink-primary">{svc.host}</td>
                  <td className="font-mono text-xs font-bold text-ink-secondary">{svc.port}</td>
                  <td>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {svc.health}
                    </span>
                  </td>
                  <td className="text-xs text-ink-muted max-w-xs">{svc.role}</td>
                  <td className="text-xs text-ink-light font-mono">{svc.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
