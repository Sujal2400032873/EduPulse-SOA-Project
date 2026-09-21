import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-4">
      <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
        <Home className="w-3.5 h-3.5" />
        <span>Portal Home</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formatted = value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-ink-light" />
            {isLast ? (
              <span className="font-semibold text-ink-primary">{formatted}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
