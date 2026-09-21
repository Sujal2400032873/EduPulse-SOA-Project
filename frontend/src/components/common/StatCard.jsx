import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'primary' }) {
  const colorStyles = {
    primary: 'ep-stat-primary',
    secondary: 'ep-stat-cyan',
    success: 'ep-stat-success',
    warning: 'ep-stat-warning',
    danger: 'ep-stat-danger',
  };

  return (
    <div className="inst-card ep-stat-card group p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em]">{title}</span>
        {Icon && (
          <div className={`ep-stat-icon ${colorStyles[color] || colorStyles.primary}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">{value}</div>
        {subtitle && <p className="text-[10px] text-ink-muted mt-1">{subtitle}</p>}
        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="ep-trend"><ArrowUpRight className="w-3 h-3" />{trend}</span>
            {trendLabel && <span className="text-ink-muted">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
