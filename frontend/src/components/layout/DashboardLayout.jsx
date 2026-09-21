import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout() {
  return (
    <div className="ep-portal min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1600px] mx-auto flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1450px] mx-auto ep-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
