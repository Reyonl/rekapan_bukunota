import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatRupiah, formatDate } from '../utils/format';
import { Card, PageHeader, StatusBadge } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { SkeletonCard, SkeletonRow, EmptyState, ErrorState } from '../components/ui/States';

function StatCard({ label, value, icon, tone = 'gray', hint }) {
    const tones = {
        gray: 'bg-gray-100 text-gray-600',
        brand: 'bg-brand-50 text-brand-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <span className={`shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center ${tones[tone]}`}>
                    <Icon name={icon} className="w-4 h-4" />
                </span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1 tnum">{value}</p>
            {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
        </Card>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let alive = true;
        setStats(null);
        setLoadError(false);
        api.get('/dashboard')
            .then((res) => {
                if (!alive) return;
                const data = res.data;
                setStats({
                    today_count: data.stats?.bon_hari_ini ?? 0,
                    today_total: data.stats?.total_hari_ini ?? 0,
                    lunas_hari_ini: data.stats?.lunas_hari_ini ?? 0,
                    lunas_total: data.stats?.lunas_total ?? 0,
                    masih_hutang: data.stats?.masih_hutang ?? 0,
                    customer_count: data.stats?.total_pelanggan ?? 0,
                    recent: data.recent_transactions ?? [],
                });
            })
            .catch(() => { if (alive) setLoadError(true); });
        return () => { alive = false; };
    }, [reloadKey]);

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 11) return 'Selamat pagi';
        if (h < 15) return 'Selamat siang';
        if (h < 18) return 'Selamat sore';
        return 'Selamat malam';
    })();
    const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (loadError) {
        return (
            <>
                <PageHeader title="Dashboard" subtitle={todayLabel} />
                <Card>
                    <ErrorState message="Gagal memuat dashboard." onRetry={() => setReloadKey((k) => k + 1)} />
                </Card>
            </>
        );
    }

    if (!stats) {
        return (
            <>
                <PageHeader title="Dashboard" subtitle={todayLabel} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
                <Card className="mt-6 divide-y divide-gray-100 px-4 py-2">
                    {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
                </Card>
            </>
        );
    }

    return (
        <div>
            <PageHeader
                title={greeting}
                subtitle={todayLabel}
                actions={
                    <Link to="/bon/buat">
                        <Button icon="plus">Buat Bon</Button>
                    </Link>
                }
            />

            {/* Ringkasan */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Bon Hari Ini" value={stats.today_count} icon="receipt" tone="brand" hint={`Total ${formatRupiah(stats.today_total)}`} />
                <StatCard label="Lunas Hari Ini" value={formatRupiah(stats.lunas_hari_ini)} icon="wallet" tone="green" />
                <StatCard label="Total Lunas" value={formatRupiah(stats.lunas_total)} icon="checkCircle" tone="green" />
                <StatCard label="Masih Hutang" value={formatRupiah(stats.masih_hutang)} icon="alert" tone="amber" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <Link to="/bon/buat">
                    <Card className="p-3.5 flex items-center gap-3 hover:border-brand-200 hover:bg-brand-50/40 transition-colors">
                        <span className="w-9 h-9 rounded-[10px] bg-ink text-white flex items-center justify-center shrink-0"><Icon name="plus" className="w-4 h-4" /></span>
                        <span className="text-sm font-medium text-gray-800">Buat Bon</span>
                    </Card>
                </Link>
                <Link to="/bon">
                    <Card className="p-3.5 flex items-center gap-3 hover:border-brand-200 hover:bg-brand-50/40 transition-colors">
                        <span className="w-9 h-9 rounded-[10px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><Icon name="clock" className="w-4 h-4" /></span>
                        <span className="text-sm font-medium text-gray-800">Riwayat Bon</span>
                    </Card>
                </Link>
                <Link to="/item">
                    <Card className="p-3.5 flex items-center gap-3 hover:border-brand-200 hover:bg-brand-50/40 transition-colors">
                        <span className="w-9 h-9 rounded-[10px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><Icon name="box" className="w-4 h-4" /></span>
                        <span className="text-sm font-medium text-gray-800">Item</span>
                    </Card>
                </Link>
                <Link to="/pelanggan">
                    <Card className="p-3.5 flex items-center gap-3 hover:border-brand-200 hover:bg-brand-50/40 transition-colors">
                        <span className="w-9 h-9 rounded-[10px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><Icon name="users" className="w-4 h-4" /></span>
                        <span className="text-sm font-medium text-gray-800">
                            Pelanggan <span className="text-gray-400 font-normal">({stats.customer_count})</span>
                        </span>
                    </Card>
                </Link>
            </div>

            {/* Bon terbaru */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-900">Bon Terbaru</h2>
                    <Link to="/bon" className="text-sm font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                        Lihat semua <Icon name="chevronRight" className="w-4 h-4" />
                    </Link>
                </div>

                {stats.recent.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon="receipt"
                            title="Belum ada bon yang dibuat."
                            description="Mulai catat penjualan dengan membuat bon pertama."
                            action={<Link to="/bon/buat"><Button size="sm">Buat Bon</Button></Link>}
                        />
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {stats.recent.map((t) => (
                                <li key={t.id}>
                                    <button
                                        onClick={() => navigate(`/bon/${t.id}`)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 text-[13px] font-bold">
                                            {(t.customer_name || '?').trim().charAt(0).toUpperCase()}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-semibold text-gray-900 truncate">{t.customer_name}</span>
                                            <span className="block text-xs text-gray-500 mt-0.5">{formatDate(t.transaction_date)} · {t.transaction_number}</span>
                                        </span>
                                        <span className="text-right shrink-0">
                                            <span className="block text-sm font-bold text-gray-900 tnum">{formatRupiah(t.total_amount)}</span>
                                            <span className="block mt-1"><StatusBadge status={t.payment_status} /></span>
                                        </span>
                                        <Icon name="chevronRight" className="w-4 h-4 text-gray-300 shrink-0" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
            </div>
        </div>
    );
}
