import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getHomeRoute = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'FACULTY') return '/faculty';
    return '/student';
  };

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-4">
      <div className="max-w-md w-full inst-card p-8 text-center space-y-6 shadow-inst-lg border-t-4 border-t-rose-500 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-ink-primary">
            Access Restricted
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Your authenticated identity does not possess the institutional security privileges required to inspect this resource.
          </p>
        </div>

        {user && (
          <div className="p-3 rounded-xl bg-surface-soft border border-surface-border text-left text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Active Identity</div>
            <div className="font-semibold text-ink-primary flex justify-between">
              <span>{user.username}</span>
              <span className="font-mono text-primary font-bold">{user.role}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border text-ink-secondary hover:bg-surface-hover text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to={getHomeRoute()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-inst-sm"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="border-t border-surface-border pt-4">
          <button
            onClick={logout}
            className="text-xs font-semibold text-ink-muted hover:text-rose-600 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with different credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
