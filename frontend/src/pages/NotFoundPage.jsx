import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getHomeRoute = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'FACULTY') return '/faculty';
    return '/student';
  };

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-4">
      <div className="max-w-md w-full inst-card p-8 text-center space-y-6 shadow-inst-lg border-t-4 border-t-primary animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary border border-primary-200">
            HTTP 404 &bull; Route Not Found
          </span>
          <h1 className="text-2xl font-black text-ink-primary">
            Page Not Located
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            The requested institutional module or URL path does not exist in the EduPulse SOA mesh.
          </p>
        </div>

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
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
