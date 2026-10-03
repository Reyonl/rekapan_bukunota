import { useLocation, Link, Outlet } from 'react-router-dom';
import Icon from './ui/Icon';

const NAV = [
    { label: 'Ringkasan', to: '/', icon: 'home', match: (l) => l === '/' },
    { label: 'Buat Bon', to: '/bon/buat', icon: 'plus', match: (l) => l === '/bon/buat' },
    { label: 'Riwayat Bon', to: '/bon', icon: 'receipt', match: (l) => l.startsWith('/bon') && l !== '/bon/buat' },
    { label: 'Pelanggan', to: '/pelanggan', icon: 'users', match: (l) => l.startsWith('/pelanggan') },
    { label: 'Item', to: '/item', icon: 'box', match: (l) => l.startsWith('/item') },
    { label: 'Laporan Rokok', short: 'Rokok', to: '/laporan/rokok', icon: 'receipt', match: (l) => l.startsWith('/laporan') },
    { label: 'Pengaturan', to: '/pengaturan', icon: 'sliders', match: (l) => l.startsWith('/pengaturan') },
];

function Brand() {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-[13px] font-bold text-white">
                WL
            </span>
            <span className="text-[15px] font-bold tracking-tight text-text-main">
                Warung <span className="text-brand-600">Lupi</span>
            </span>
        </div>
    );
}

export default function Layout() {
    const location = useLocation();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar desktop — tipis, netral, tanpa shadow */}
            <aside className="hidden lg:flex w-[232px] shrink-0 flex-col border-r border-border bg-surface">
                <div className="px-4 py-5">
                    <Brand />
                </div>
                <nav className="flex-1 space-y-0.5 px-3" aria-label="Navigasi">
                    {NAV.map((item) => {
                        const active = item.match(location.pathname);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                                    active
                                        ? 'bg-brand-50 font-semibold text-brand-700'
                                        : 'font-medium text-text-muted hover:bg-[#F4F5F6] hover:text-text-main'
                                }`}
                            >
                                <Icon name={item.icon} size={17} className={active ? 'text-brand-600' : ''} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-border px-4 py-3 text-[11.5px] text-text-muted">
                    Sistem rekap warung
                </div>
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header mobile */}
                <header className="lg:hidden flex h-14 items-center justify-between border-b border-border bg-surface px-4 shrink-0">
                    <Brand />
                    <Link
                        to="/pengaturan"
                        aria-label="Pengaturan"
                        className="rounded-lg p-2 text-text-muted hover:bg-[#F4F5F6] hover:text-text-main"
                    >
                        <Icon name="sliders" size={20} />
                    </Link>
                </header>

                {/* Konten */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-5xl px-4 py-5 pb-24 lg:px-8 lg:pb-10">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Bottom nav mobile — destinasi utama */}
            <nav
                className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-border bg-surface"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                aria-label="Navigasi utama"
            >
                {[NAV[0], NAV[2], NAV[1], NAV[3], NAV[4], NAV[5]].map((item) => {
                    const active = item.match(location.pathname);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium transition-colors ${
                                active ? 'text-brand-700' : 'text-text-muted'
                            }`}
                        >
                            {active ? <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" /> : null}
                            <Icon name={item.icon} size={20} />
                            {item.short || item.label.split(' ')[0]}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
