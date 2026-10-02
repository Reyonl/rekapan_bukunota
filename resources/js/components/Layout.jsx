import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Icon from './ui/Icon';
import ToastHost from './ui/ToastHost';

const navItem = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-sm font-medium transition-colors ${
        isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

const NavGroupLabel = ({ children }) => (
    <p className="mt-5 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {children}
    </p>
);

function Sidebar() {
    return (
        <nav className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="px-5 h-16 flex items-center gap-2.5 border-b border-gray-100 shrink-0">
                <span className="w-8 h-8 rounded-[10px] bg-ink text-white flex items-center justify-center shrink-0">
                    <Icon name="receipt" className="w-[18px] h-[18px]" />
                </span>
                <div className="leading-tight">
                    <p className="text-[15px] font-bold text-gray-900 tracking-tight">Warung Lupi</p>
                    <p className="text-[11px] text-gray-400">Buku nota & bon</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4">
                <div className="pt-4 space-y-1">
                    <NavLink to="/" end className={navItem}>
                        <Icon name="home" className="w-[18px] h-[18px] shrink-0" />
                        Dashboard
                    </NavLink>
                </div>

                <NavGroupLabel>Transaksi</NavGroupLabel>
                <div className="space-y-1">
                    <NavLink to="/bon/buat" className={navItem}>
                        <Icon name="plus" className="w-[18px] h-[18px] shrink-0" />
                        Buat Bon
                    </NavLink>
                    <NavLink to="/bon" end className={navItem}>
                        <Icon name="receipt" className="w-[18px] h-[18px] shrink-0" />
                        Riwayat Bon
                    </NavLink>
                </div>

                <NavGroupLabel>Data</NavGroupLabel>
                <div className="space-y-1">
                    <NavLink to="/pelanggan" className={navItem}>
                        <Icon name="users" className="w-[18px] h-[18px] shrink-0" />
                        Pelanggan
                    </NavLink>
                    <NavLink to="/item" className={navItem}>
                        <Icon name="box" className="w-[18px] h-[18px] shrink-0" />
                        Item
                    </NavLink>
                </div>

                <div className="mt-7 pt-3 border-t border-gray-100">
                    <NavLink to="/pengaturan" className={navItem}>
                        <Icon name="settings" className="w-[18px] h-[18px] shrink-0" />
                        Pengaturan
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}

const TABS = [
    { to: '/', end: true, icon: 'home', label: 'Home' },
    { to: '/bon', end: true, icon: 'receipt', label: 'Bon' },
    { to: '/bon/buat', icon: 'plus', label: 'Buat', primary: true },
    { to: '/pelanggan', icon: 'users', label: 'Pelanggan' },
    { to: '/item', icon: 'box', label: 'Item' },
];

function BottomNav() {
    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 no-print"
            aria-label="Navigasi utama"
        >
            <div className="grid grid-cols-5 max-w-lg mx-auto px-1 pb-[env(safe-area-inset-bottom)]">
                {TABS.map((t) => (
                    <NavLink key={t.label} to={t.to} end={t.end}>
                        {({ isActive }) => (
                            <div className="flex flex-col items-center justify-center py-2 min-h-[52px]">
                                <span
                                    className={`flex items-center justify-center transition-colors ${
                                        t.primary
                                            ? 'w-9 h-9 -mt-3 rounded-full shadow-md ' +
                                              (isActive ? 'bg-brand-600 text-white' : 'bg-ink text-white active:bg-brand-700')
                                            : 'w-9 h-9 rounded-[12px] ' +
                                              (isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-500')
                                    }`}
                                >
                                    <Icon name={t.icon} className="w-5 h-5" strokeWidth={t.primary ? 2.4 : 2} />
                                </span>
                                <span
                                    className={`text-[10px] mt-0.5 font-medium leading-none ${
                                        isActive ? 'text-brand-700' : 'text-gray-400'
                                    }`}
                                >
                                    {t.label}
                                </span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

export default function Layout() {
    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar desktop */}
            <aside className="hidden md:block md:w-60 fixed inset-y-0 left-0 z-20 no-print">
                <Sidebar />
            </aside>

            {/* Konten */}
            <div className="md:ml-60 flex flex-col min-h-screen print:ml-0">
                {/* Header mobile */}
                <header className="sticky top-0 z-10 h-14 bg-white/95 backdrop-blur border-b border-gray-200 px-4 flex items-center gap-2.5 md:hidden no-print">
                    <span className="w-7 h-7 rounded-[9px] bg-ink text-white flex items-center justify-center shrink-0">
                        <Icon name="receipt" className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-gray-900 text-[15px] tracking-tight">Warung Lupi</span>
                </header>

                <main className="flex-1 px-4 md:px-8 py-5 md:py-8 pb-24 md:pb-8 overflow-x-hidden print:p-0">
                    <div className="mx-auto w-full max-w-5xl">
                        <Outlet />
                    </div>
                </main>
            </div>

            <BottomNav />
            <ToastHost />
        </div>
    );
}
