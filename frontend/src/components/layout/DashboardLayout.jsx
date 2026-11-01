import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Breadcrumbs from '../common/Breadcrumbs';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-soft text-ink-primary">
      <Header onToggleMobile={() => setMobileOpen((prev) => !prev)} />

      <div className="flex-1 w-full max-w-[1600px] mx-auto flex">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1450px] mx-auto animate-in fade-in duration-200">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
