import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full animate-pulse space-y-3 p-4">
      <div className="h-8 bg-surface-soft rounded-lg w-full mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-surface-soft rounded"
              style={{ width: `${Math.max(15, 100 / cols - 5)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="inst-card p-5 border border-surface-border rounded-2xl bg-surface animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-surface-soft rounded w-24" />
        <div className="w-9 h-9 rounded-xl bg-surface-soft" />
      </div>
      <div className="h-7 bg-surface-soft rounded w-16" />
      <div className="h-3 bg-surface-soft rounded w-32" />
    </div>
  );
}

export function EmptyState({
  title = 'No Records Found',
  description = 'There are currently no items matching your criteria in the system.',
  actionText,
  onAction,
  icon: Icon = Inbox
}) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-soft border border-surface-border flex items-center justify-center text-ink-muted mb-4 shadow-sm">
        <Icon className="w-7 h-7 stroke-1" />
      </div>
      <h4 className="text-sm font-bold text-ink-primary mb-1">{title}</h4>
      <p className="text-xs text-ink-muted max-w-sm leading-relaxed mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-2 cursor-pointer"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Service Unavailable',
  message = 'Unable to fetch records from the backend microservice.',
  onRetry
}) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center bg-rose-50/50 rounded-2xl border border-rose-200">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 max-w-md leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
