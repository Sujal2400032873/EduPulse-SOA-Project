import React, { useState } from 'react';
import { 
  Binary, Search, FileCode, CheckCircle2, AlertCircle, 
  ExternalLink, RefreshCw, Send, ShieldCheck, Copy, Check 
} from 'lucide-react';
import { soapService } from '../services/soapService';
import { useToast } from '../context/ToastContext';

export default function SoapLookupPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [studentId, setStudentId] = useState('STU1001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeXmlTab, setActiveXmlTab] = useState('response'); // 'request' | 'response'
  const [copied, setCopied] = useState(false);

  const quickIds = ['STU1001', '2400032152', 'STU2026', 'STU1002', 'STU1003'];

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!studentId.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await soapService.lookupStudent(studentId.trim());
      setResult(data);
      toastSuccess(`SOAP Web Service resolved profile for ${data.student.studentId}`, 'SOAP 200 OK');
    } catch (err) {
      console.error('SOAP Lookup Error:', err);
      setError(err.message || 'SOAP Service request failed.');
      toastError(err.message, 'SOAP Error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="inst-card p-6 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ink-primary">
              SOAP 1.1 Student Lookup Service
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Spring-WS (Port 8085 /ws)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Enterprise XML-based Web Service demonstration complying with Institutional WSDL / XSD Contract
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href="http://localhost:8085/ws/students.wsdl"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface-soft hover:bg-surface-hover text-ink-secondary flex items-center gap-1.5 font-semibold transition"
          >
            <span>Inspect WSDL</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </a>
        </div>
      </div>

      {/* Lookup Controls */}
      <div className="p-6 bg-surface border border-surface-border rounded-2xl space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-ink-muted pointer-events-none" />
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter institutional Student ID (e.g. STU1001)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface-soft font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Invoking SOAP 1.1...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute SOAP Query</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-ink-muted font-medium text-[11px]">Quick Samples:</span>
          {quickIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setStudentId(id);
              }}
              className="px-2.5 py-1 rounded-lg border border-surface-border bg-surface-soft hover:bg-surface-hover text-ink-secondary font-mono text-[11px] cursor-pointer"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">SOAP Request Failed</span>
            <span className="mt-0.5 block">{error}</span>
          </div>
        </div>
      )}

      {/* Result Container */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Parsed Profile Card */}
          <div className="p-6 bg-surface border border-surface-border rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Parsed SOAP Response DTO</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {result.student.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-soft border border-surface-border">
                <span className="text-[10px] uppercase text-ink-muted tracking-wider block">Candidate Name</span>
                <span className="text-sm font-bold text-ink-primary mt-0.5 block">{result.student.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-soft border border-surface-border">
                  <span className="text-[10px] uppercase text-ink-muted tracking-wider block">Student ID</span>
                  <span className="font-mono font-bold text-primary mt-0.5 block">{result.student.studentId}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-soft border border-surface-border">
                  <span className="text-[10px] uppercase text-ink-muted tracking-wider block">Class Year</span>
                  <span className="font-bold text-ink-primary mt-0.5 block">Year {result.student.year}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-soft border border-surface-border">
                <span className="text-[10px] uppercase text-ink-muted tracking-wider block">Institutional Email</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{result.student.email}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-soft border border-surface-border">
                <span className="text-[10px] uppercase text-ink-muted tracking-wider block">Department</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{result.student.department}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-ink-muted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified against XML Schema students.xsd</span>
            </div>
          </div>

          {/* XML Inspector Tabs */}
          <div className="p-6 bg-surface border border-surface-border rounded-2xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-ink-primary">Live XML Wire Inspector</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex border border-surface-border rounded-lg p-0.5 bg-surface-soft text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveXmlTab('response')}
                    className={`px-2 py-0.5 rounded transition cursor-pointer font-semibold ${
                      activeXmlTab === 'response' ? 'bg-surface text-primary shadow-sm font-bold' : 'text-ink-muted'
                    }`}
                  >
                    SOAP Response
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveXmlTab('request')}
                    className={`px-2 py-0.5 rounded transition cursor-pointer font-semibold ${
                      activeXmlTab === 'request' ? 'bg-surface text-primary shadow-sm font-bold' : 'text-ink-muted'
                    }`}
                  >
                    SOAP Request
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      activeXmlTab === 'response' ? result.rawResponseXml : result.rawRequestXml
                    )
                  }
                  className="p-1 rounded-lg border border-surface-border text-ink-muted hover:text-ink-primary cursor-pointer text-xs"
                  title="Copy XML"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-96">
              <pre>
                {activeXmlTab === 'response' ? result.rawResponseXml : result.rawRequestXml}
              </pre>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
