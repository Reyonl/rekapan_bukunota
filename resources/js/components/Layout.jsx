import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const brandAccentNavClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-700 text-white'
        : 'bg-brand-600 text-white hover:bg-brand-700'
    }`;

  const sidebarContent = (
    <nav className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="px-5 py-6">
        <span className="text-lg font-bold text-gray-900 tracking-tight">Warung Lupi</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <NavLink to="/" end className={navClass}>
          Dashboard
        </NavLink>

        <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Bon
        </p>
        <NavLink to="/bon/buat" className={brandAccentNavClass}>
          Buat Bon
        </NavLink>
        <NavLink to="/bon" end className={navClass}>
          Riwayat Bon
        </NavLink>

        <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Data
        </p>
        <NavLink to="/pelanggan" className={navClass}>
          Pelanggan
        </NavLink>
        <NavLink to="/item" className={navClass}>
          Item
        </NavLink>

        <div className="mt-8 border-t border-gray-100 pt-4">
          <NavLink to="/pengaturan" className={navClass}>
            Pengaturan
          </NavLink>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-56 md:fixed md:inset-y-0 z-20 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white z-40 transform transition-transform duration-200 ease-in-out md:hidden no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen print:ml-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center md:hidden no-print">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-1 mr-3"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-gray-900">Warung Lupi</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
