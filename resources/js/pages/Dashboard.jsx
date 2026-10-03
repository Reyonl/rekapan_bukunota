import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatRupiah } from '../utils/format';
import { Skeleton, SkeletonRow, ErrorState } from '../components/ui/States';
import { StatusBadge } from '../components/ui/Card';

function greeting() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
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
                    masih_hutang: Number(data.stats?.masih_hutang ?? 0),
                    customer_count: data.stats?.total_pelanggan ?? 0,
                    recent: data.recent_transactions ?? [],
                });
            })
            .catch(() => { if (alive) setLoadError(true); });
        return () => { alive = false; };
    }, [reloadKey]);

    const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div>
            {/* Sapaan — bukan headline landing page */}
            <h1 className="text-lg font-bold tracking-tight text-text-main">{greeting()}</h1>
            <p className="mt-0.5 text-sm text-text-muted">{todayLabel}</p>

            {loadError ? (
                <div className="mt-6 rounded-xl border border-border bg-surface">
                    <ErrorState message="Koneksi bermasalah, data belum masuk." onRetry={() => setReloadKey((k) => k + 1)} />
                </div>
            ) : !stats ? (
                <div className="mt-6 space-y-4">
                    <Skeleton className="h-10 w-52" />
                    <Skeleton className="h-4 w-64" />
                    <div className="mt-2 rounded-xl border border-border bg-surface">
                        {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
                    </div>
                </div>
            ) : (
                <>
                    {/* Focal point: penjualan hari ini — kecil & tenang bila belum ada */}
                    <section className="mt-6">
                        <p className="text-[13px] text-text-muted">Penjualan hari ini</p>
                        {stats.today_total > 0 ? (
                            <p className="mt-1 text-[32px] leading-none font-bold tracking-tight text-text-main tnum">
                                {formatRupiah(stats.today_total)}
                            </p>
                        ) : (
                            <p className="mt-1 text-[20px] leading-tight font-semibold text-text-main/80">
                                Belum ada penjualan hari ini.
                            </p>
                        )}
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-muted">
                            <span className="tnum">{stats.today_count} transaksi</span>
                            <span aria-hidden="true">·</span>
                            <span>
                                Lunas hari ini <b className={`font-semibold tnum ${stats.lunas_hari_ini > 0 ? 'text-success' : ''}`}>{formatRupiah(stats.lunas_hari_ini)}</b>
                            </span>
                            {stats.masih_hutang > 0 ? (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <Link
                                        to="/bon"
                                        className="text-text-muted underline decoration-[#C4C9D0] underline-offset-2 transition-colors hover:text-text-main tnum"
                                    >
                                        Sisa hutang {formatRupiah(stats.masih_hutang)}
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </section>

                    <hr className="my-6 border-border" />

                    {/* Quick action — teks kecil, bukan giant cards */}
                    <section>
                        <h2 className="text-[13px] font-semibold text-text-main">Aksi cepat</h2>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                            <button
                                onClick={() => navigate('/bon/buat')}
                                className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-700"
                            >
                                Buat Bon
                            </button>
                            <button
                                onClick={() => navigate('/item')}
                                className="inline-flex h-8 items-center rounded-lg border border-[#D4D7DC] bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#F7F8FA]"
                            >
                                Tambah Item
                            </button>
                            <button
                                onClick={() => navigate('/pelanggan/tambah')}
                                className="inline-flex h-8 items-center rounded-lg border border-[#D4D7DC] bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#F7F8FA]"
                            >
                                Tambah Pelanggan
                            </button>
                        </div>
                    </section>

                    {/* Transaksi terbaru — plain list + divider, tanpa card per baris */}
                    <section className="mt-7">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-text-main">Transaksi terbaru</h2>
                            <Link to="/bon" className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700">
                                Lihat semua
                            </Link>
                        </div>

                        <div className="mt-1.5 rounded-xl border border-border bg-surface">
                            {stats.recent.length === 0 ? (
                                <div className="px-4 py-9 text-center">
                                    <p className="text-sm font-medium text-text-main">Belum ada transaksi</p>
                                    <p className="mt-1 text-[13px] text-text-muted">Bon yang dibuat akan muncul di sini.</p>
                                    <div className="mt-3">
                                        <button
                                            onClick={() => navigate('/bon/buat')}
                                            className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-700"
                                        >
                                            Buat Bon
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {stats.recent.map((tx) => (
                                        <li
                                            key={tx.id}
                                            onClick={() => navigate(`/bon/${tx.id}`)}
                                            className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-2.5 transition-colors duration-150 hover:bg-[#F7F8FA] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]"
                                        >
                                            <span className="truncate text-sm font-medium">{tx.customer_name || 'Umum'}</span>
                                            <span className="hidden truncate text-[12px] text-text-muted sm:inline">{tx.transaction_date}</span>
                                            <div className="col-start-2 row-start-1 flex items-center justify-end gap-2.5 sm:col-start-3">
                                                {tx.status === 'draft'
                                                    ? <StatusBadge status="draft" />
                                                    : <StatusBadge status={tx.payment_status} />}
                                                <span className="w-24 text-right text-sm font-semibold tnum">{formatRupiah(tx.total_amount)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
