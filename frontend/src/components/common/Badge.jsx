import React from 'react';

export function AttendanceBadge({ percentage }) {
  const num = parseFloat(percentage);
  if (isNaN(num)) return null;

  if (num >= 85) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        Safe ({num}%)
      </span>
    );
  } else if (num >= 75) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        Monitor ({num}%)
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        Shortage ({num}%)
      </span>
    );
  }
}

export function GradeBadge({ grade }) {
  const g = grade?.toUpperCase();
  const colors = {
    'O': 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
    'A+': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    'A': 'bg-blue-50 text-blue-800 border-blue-300 font-bold',
    'B+': 'bg-indigo-50 text-indigo-800 border-indigo-300 font-medium',
    'B': 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
    'F': 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded border text-xs ${colors[g] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {grade}
    </span>
  );
}
