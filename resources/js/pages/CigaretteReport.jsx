import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { PageHeader, StatusBadge } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { inputSmClass } from '../components/ui/Form';
import { SkeletonRows, EmptyState, ErrorState } from '../components/ui/States';
import { alertError } from '../utils/feedback';
import { formatRupiah, formatDateShort } from '../utils/format';

function today() {
    return new Date().toISOString().slice(0, 10);
}

function shiftDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

const PRESETS = [
    { label: 'Hari ini', from: () => today(), to: () => today() },
    { label: 'Kemarin', from: () => shiftDate(-1), to: () => shiftDate(-1) },
    { label: '7 hari', from: () => shiftDate(-6), to: () => today() },
    { label: '30 hari', from: () => shiftDate(-29), to: () => today() },
];

export default function CigaretteReport() {
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);

    const [dateFrom, setDateFrom] = useState(params.get('date_from') || today());
    const [dateTo, setDateTo] = useState(params.get('date_to') || today());
    const [product, setProduct] = useState(params.get('product') || '');
    const [search, setSearch] = useState(params.get('search') || '');
    const [searchInput, setSearchInput] = useState(search);
    const debounceRef = useRef(null);

    const query = useMemo(
        () => ({
            date_from: dateFrom || '',
            date_to: dateTo || '',
            product: product || '',
            search: search || '',
            page,
        }),
        [dateFrom, dateTo, product, search, page],
    );

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(false);
        api.get('/reports/cigarettes', { params: query })
            .then((res) => {
                if (!ignore) setData(res.data);
            })
            .catch(() => {
                if (!ignore) {
                    setError(true);
                    alertError('Laporan Rokok', 'Data gagal dimuat. Coba muat ulang.');
                }
            })
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, [query]);

    // Sinkronkan preset ke URL ringan saat default hari ini (opsional, tidak wajib)
    useEffect(() => {
        setPage(1);
    }, [dateFrom, dateTo, product, search]);

    const applyPreset = (p) => {
        setDateFrom(p.from());
        setDateTo(p.to());
    };

    const activePreset = PRESETS.find((p) => p.from() === dateFrom && p.to() === dateTo)?.label;

    const onSearchDebounced = (value) => {
        setSearchInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearch(value), 350);
    };

    const summary = data?.summary;
    const items = data?.items || [];
    const bonRows = data?.transactions?.data || [];
    const bonTotal = data?.transactions?.total || 0;
    const lastPage = data?.transactions?.last_page || 1;
    const productOptions = data?.products || [];

    return (
        <div>
            <PageHeader
                title="Laporan Rokok"
                subtitle="Penjualan item berkategori atau bernama rokok — hanya bon selesai (hutang tetap dihitung)."
            />

            {/* Filter */}
            <div className="mt-4 flex flex-wrap items-end gap-2">
                <div className="flex flex-wrap gap-1" role="group" aria-label="Preset tanggal">
                    {PRESETS.map((p) => (
                        <button
                            key={p.label}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className={`h-9 rounded-lg border px-3 text-[13.5px] font-medium transition-colors ${
                                activePreset === p.label
                                    ? 'border-brand-300 bg-brand-100 text-brand-800 font-semibold'
                                    : 'border-border bg-surface text-text-muted hover:bg-[#F1F2F4]'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5">
                    <input type="date" aria-label="Dari tanggal" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputSmClass()} h-9`} />
                    <span className="text-text-muted">—</span>
                    <input type="date" aria-label="Sampai tanggal" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputSmClass()} h-9`} />
                </div>
                <select
                    aria-label="Filter item rokok"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className={`${inputSmClass()} h-9 w-40`}
                >
                    <option value="">Semua Rokok</option>
                    {productOptions.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
                <input
                    type="search"
                    aria-label="Cari bon atau pelanggan"
                    placeholder="Cari bon / pelanggan…"
                    value={searchInput}
                    onChange={(e) => onSearchDebounced(e.target.value)}
                    className={`${inputSmClass()} h-9 w-44`}
                />
            </div>

            {loading && !data ? (
                <div className="mt-6">
                    <SkeletonRows rows={8} />
                </div>
            ) : error && !data ? (
                <div className="mt-6">
                    <ErrorState
                        onRetry={() => setParams(params)}
                        message="Laporan gagal dimuat."
                    />
                </div>
            ) : (
                <>
                    {/* Ringkasan compact — satu angka besar, sisanya kecil */}
                    <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-border pb-4">
                        <div>
                            <span className="text-[26px] font-bold tracking-tight text-text-main tnum">
                                {formatRupiah(summary?.cigarette_sales ?? 0)}
                            </span>
                            <span className="ml-2 text-[13px] text-text-muted">penjualan{summary?.cigarette_sales === 0 ? '' : ` · ${summary?.cigarette_quantity ?? 0} batang · ${summary?.bon_count ?? 0} bon`}</span>
                        </div>
                        {summary?.cigarette_sales > 0 && (
                            <span className="flex items-baseline gap-x-2 text-[13px] tnum">
                                {summary.paid_sales > 0 && (
                                    <>
                                        <span className="text-[#98A2B3]">·</span>
                                        <span className="text-success">Lunas {formatRupiah(summary.paid_sales)}</span>
                                    </>
                                )}
                                {summary.unpaid_sales > 0 && (
                                    <>
                                        <span className="text-[#98A2B3]">·</span>
                                        <span className="text-warning">Hutang {formatRupiah(summary.unpaid_sales)}</span>
                                    </>
                                )}
                            </span>
                        )}
                    </div>

                    {summary?.cigarette_sales === 0 && !loading ? (
                        <div className="mt-8">
                            <EmptyState
                                title="Tidak ada penjualan rokok pada periode ini."
                                description="Coba ganti rentang tanggal, atau cek lagi setelah ada bon rokok yang diselesaikan."
                            />
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                            {/* Produk */}
                            <section aria-label="Penjualan per item">
                                <h2 className="text-[13px] font-medium text-text-muted">Penjualan per item</h2>
                                <div className="mt-2 border-b border-border pb-1.5 text-[11.5px] text-text-muted">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="min-w-0 flex-1">Item</span>
                                        <span className="w-10 shrink-0 text-right">Qty</span>
                                        <span className="w-24 shrink-0 text-right">Total</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-border">
                                    {items.map((row) => (
                                        <div key={row.product_name} className="flex items-baseline justify-between gap-3 py-2.5">
                                            <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-text-main">
                                                {row.product_name}
                                            </span>
                                            <span className="w-10 shrink-0 text-right text-[13px] text-text-muted tnum">{row.total_quantity}</span>
                                            <span className="w-24 shrink-0 text-right text-[14.5px] font-semibold text-text-main tnum">
                                                {formatRupiah(row.total_sales)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-baseline justify-between gap-3 pt-2.5 text-[13.5px] font-semibold text-text-main">
                                        <span className="min-w-0 flex-1">Total</span>
                                        <span className="w-10 shrink-0 text-right tnum">{summary?.cigarette_quantity ?? 0}</span>
                                        <span className="w-24 shrink-0 text-right tnum">{formatRupiah(summary?.cigarette_sales ?? 0)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Bon */}
                            <section aria-label="Penjualan per bon">
                                <h2 className="text-[13px] font-medium text-text-muted">Bon dengan penjualan rokok</h2>
                                <table className="mt-2 hidden w-full text-[14px] lg:table">
                                    <thead>
                                        <tr className="border-b border-border text-[11.5px] text-text-muted">
                                            <th className="pb-1.5 text-left font-medium">Bon</th>
                                            <th className="pb-1.5 text-left font-medium">Pelanggan</th>
                                            <th className="pb-1.5 text-left font-medium">Tanggal</th>
                                            <th className="pb-1.5 text-right font-medium">Qty</th>
                                            <th className="pb-1.5 text-right font-medium">Total rokok</th>
                                            <th className="pb-1.5 text-right font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {bonRows.map((row) => (
                                            <tr key={row.id} className="transition-colors hover:bg-[#F1F2F4]">
                                                <td className="py-2.5">
                                                    <Link to={`/bon/${row.id}`} className="font-semibold text-brand-700 hover:underline">
                                                        {row.transaction_number}
                                                    </Link>
                                                </td>
                                                <td className="py-2.5 text-text-main">{row.customer_name || '—'}</td>
                                                <td className="py-2.5 text-[13px] text-text-muted tnum">{formatDateShort(row.transaction_date)}</td>
                                                <td className="py-2.5 text-right text-text-main tnum">{row.cigarette_quantity}</td>
                                                <td className="py-2.5 text-right font-semibold text-text-main tnum">
                                                    {formatRupiah(row.cigarette_total)}
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <StatusBadge status={row.payment_status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-border text-[13.5px] font-semibold text-text-main">
                                            <td className="py-2" colSpan={3}>Total {bonRows.length} bon ditampilkan</td>
                                            <td className="py-2 text-right tnum">
                                                {bonRows.reduce((a, r) => a + r.cigarette_quantity, 0)}
                                            </td>
                                            <td className="py-2 text-right tnum">
                                                {formatRupiah(bonRows.reduce((a, r) => a + r.cigarette_total, 0))}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Mobile list */}
                                <ul className="mt-2 divide-y divide-border lg:hidden">
                                    {bonRows.map((row) => (
                                        <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                                            <div className="min-w-0">
                                                <Link to={`/bon/${row.id}`} className="text-[14.5px] font-semibold text-brand-700 hover:underline">
                                                    {row.transaction_number}
                                                </Link>
                                                <p className="mt-0.5 text-[13px] text-text-muted">
                                                    {row.customer_name || '—'} · {formatDateShort(row.transaction_date)} · {row.cigarette_quantity} batang
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[14.5px] font-semibold text-text-main tnum">{formatRupiah(row.cigarette_total)}</p>
                                                <StatusBadge status={row.payment_status} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {lastPage > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-[13px] text-text-muted tnum">
                                            Bon {bonTotal > 0 ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, bonTotal)} dari {bonTotal}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                                ←
                                            </Button>
                                            <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                                                →
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {loading && data && (
                        <p className="mt-4 text-[13px] text-text-muted">Memuat ulang laporan…</p>
                    )}
                </>
            )}
        </div>
    );
}
