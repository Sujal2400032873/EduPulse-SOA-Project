import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print ep-footer mt-8">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>EduPulse Academic Intelligence Platform</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Academic Session 2025–2026</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-emerald-300">
          <Activity className="w-3.5 h-3.5" />
          <span>Gateway & services online</span>
          <span className="ep-live-dot" />
        </div>
      </div>
    </footer>
  );
}
