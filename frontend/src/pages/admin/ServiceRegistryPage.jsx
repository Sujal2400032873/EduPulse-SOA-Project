import React, { useState, useEffect } from 'react';
import { 
  Server, Activity, RefreshCw, CheckCircle2, 
  ExternalLink, ShieldCheck, Cpu, HardDrive, Globe,
  AlertTriangle, Radio, Binary
} from 'lucide-react';
import { systemService } from '../../services/systemService';
import { useToast } from '../../context/ToastContext';

export default function ServiceRegistryPage() {
  const { addToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      const data = await systemService.checkAllServices();
      setServices(data || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      addToast('Error probing microservice registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const upCount = services.filter(s => s.status === 'UP').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Institutional Service Registry &amp; Health Probe
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
              Netflix Eureka &bull; Port 8761
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Autonomous discovery mesh coordinate routes via Spring Cloud Gateway (Port 8080).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted hidden sm:inline">
            Last Ping: <strong>{lastRefreshed}</strong>
          </span>
          <button
            onClick={fetchRegistry}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Probe Services</span>
          </button>
        </div>
      </div>

      {/* Registry Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="inst-card p-4 space-y-1.5 border-l-2 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Registered Nodes</span>
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {upCount} / {services.length} UP
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Eureka Self-Preservation Active</span>
          </div>
        </div>

        <div className="inst-card p-4 space-y-1.5 border-l-2 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">API Gateway Edge</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-ink-primary">Port 8080</div>
          <div className="text-[11px] text-ink-muted">CORS &bull; JWT Routing &bull; /ws Proxy</div>
        </div>

        <div className="inst-card p-4 space-y-1.5 border-l-2 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">PostgreSQL Database</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-ink-primary">Port 5433</div>
          <div className="text-[11px] text-ink-muted font-mono">db: soa_hack (4 schemas)</div>
        </div>

        <div className="inst-card p-4 space-y-1.5 border-l-2 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Interactive Swagger UI</span>
            <Globe className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-ink-primary truncate pt-1">
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              <span>/swagger-ui.html</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="text-[11px] text-ink-muted">OpenAPI 3.0 Documentation</div>
        </div>

      </div>

      {/* Services Table */}
      <div className="inst-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">
              Live Microservice Heartbeat Registry
            </h2>
            <p className="text-xs text-ink-muted">Direct telemetry probes executed from browser via API Gateway</p>
          </div>
          <span className="text-xs font-mono font-bold text-primary">All Nodes Functional</span>
        </div>

        <div className="overflow-x-auto">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Role in SOA Architecture</th>
                <th>Port</th>
                <th>Status</th>
                <th>Round-Trip Latency</th>
                <th>Health Verdict</th>
                <th>Last Probe</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id || s.name}>
                  <td className="font-mono font-bold text-primary flex items-center gap-2">
                    {s.isSoap ? <Binary size={14} className="text-amber-600" /> : <Server size={14} className="text-primary" />}
                    <span>{s.name}</span>
                  </td>
                  <td className="text-xs text-ink-secondary">{s.role}</td>
                  <td className="font-mono text-xs text-ink-muted">{s.port}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'UP'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'UP' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs font-bold text-ink-primary">
                    {s.latency !== undefined ? `${s.latency} ms` : '—'}
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {s.health}
                    </span>
                  </td>
                  <td className="text-xs text-ink-muted font-mono">{s.lastChecked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
