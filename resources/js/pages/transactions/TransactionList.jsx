import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatRupiah, formatDate } from '../../utils/format';
import { PageHeader, StatusBadge, Badge } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { inputSmClass } from '../../components/ui/Form';
import { ConfirmDialog } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState, ErrorState } from '../../components/ui/States';
import { toast } from '../../utils/feedback';

export default function TransactionList() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const [confirmTarget, setConfirmTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchTransactions = async () => {
        setLoading(true);
        setLoadError(false);
        try {
            const params = new URLSearchParams();
            if (debounced) params.set('search', debounced);
            if (dateFrom) params.set('date_from', dateFrom);
            if (dateTo) params.set('date_to', dateTo);
            params.set('page', page);
            const r = await api.get(`/transactions?${params.toString()}`);
            setTransactions(r.data.data || []);
            setMeta(r.data);
        } catch {
            setTransactions([]);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, dateFrom, dateTo, page]);

    const doDelete = async () => {
        if (!confirmTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/transactions/${confirmTarget.id}`);
            toast.success('Bon berhasil dihapus.');
            setConfirmTarget(null);
            fetchTransactions();
        } catch {
            toast.error('Gagal menghapus bon.');
        } finally {
            setDeleting(false);
        }
    };

    const hasFilter = !!(debounced || dateFrom || dateTo);
    const resetFilter = () => { setSearch(''); setDateFrom(''); setDateTo(''); };

    const ActionRow = ({ t, className = '' }) => (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                onClick={() => navigate(`/bon/${t.id}`)}
                className="h-7 rounded-md px-2 text-[12.5px] font-medium text-text-muted transition-colors hover:bg-[#F1F2F4] hover:text-text-main"
            >
                Lihat
            </button>
            <button
                onClick={() => navigate(`/bon/${t.id}/edit`)}
                className="h-7 rounded-md px-2 text-[12.5px] font-medium text-text-muted transition-colors hover:bg-[#F1F2F4] hover:text-text-main"
            >
                Edit
            </button>
            <button
                onClick={() => setConfirmTarget(t)}
                className="h-7 rounded-md px-2 text-[12.5px] font-medium text-text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
                Hapus
            </button>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Riwayat Bon"
                actions={
                    <Link to="/bon/buat">
                        <Button>Buat Bon</Button>
                    </Link>
                }
            />

            {/* Filter plain satu baris — tanpa card, tanpa label besar */}
            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari pelanggan atau nomor bon"
                    aria-label="Cari bon"
                    className={`${inputSmClass()} min-w-[200px] flex-1 sm:max-w-xs`}
                />
                <label className="inline-flex items-center gap-1.5 text-[12.5px] text-text-muted">
                    <span className="hidden sm:inline">Dari</span>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} aria-label="Dari tanggal" className={`${inputSmClass()} w-auto`} />
                </label>
                <label className="inline-flex items-center gap-1.5 text-[12.5px] text-text-muted">
                    <span className="hidden sm:inline">Sampai</span>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} aria-label="Sampai tanggal" className={`${inputSmClass()} w-auto`} />
                </label>
                {hasFilter ? (
                    <button
                        onClick={resetFilter}
                        className="text-[13px] font-medium text-text-muted underline-offset-2 transition-colors hover:text-text-main hover:underline"
                    >
                        Bersihkan
                    </button>
                ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-surface">
                {loading ? (
                    <div>
                        {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
                    </div>
                ) : loadError ? (
                    <ErrorState message="Gagal memuat transaksi." onRetry={fetchTransactions} />
                ) : transactions.length === 0 ? (
                    <EmptyState
                        title={hasFilter ? 'Tidak ada bon yang cocok.' : 'Belum ada bon yang dibuat.'}
                        description={hasFilter ? 'Coba ubah kata kunci atau rentang tanggalnya.' : 'Mulai catat penjualan dengan membuat bon pertama.'}
                        action={hasFilter
                            ? <Button size="sm" variant="secondary" onClick={resetFilter}>Bersihkan filter</Button>
                            : <Link to="/bon/buat"><Button size="sm">Buat Bon</Button></Link>}
                    />
                ) : (
                    <>
                        {/* Desktop: tabel bisnis — header muted kecil, nominal kanan, divider halus */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-2 text-[11.5px] font-medium text-text-muted">No Bon</th>
                                        <th className="px-4 py-2 text-[11.5px] font-medium text-text-muted">Pelanggan</th>
                                        <th className="px-4 py-2 text-[11.5px] font-medium text-text-muted">Tanggal</th>
                                        <th className="px-4 py-2 text-[11.5px] font-medium text-text-muted text-right">Total</th>
                                        <th className="px-4 py-2 text-[11.5px] font-medium text-text-muted">Status</th>
                                        <th className="px-4 py-2 text-[11.5px] font-medium text-text-muted text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="transition-colors duration-150 hover:bg-[#F7F8FA]">
                                            <td className="px-4 py-2.5 text-[13px] text-text-muted tnum whitespace-nowrap">{t.transaction_number}</td>
                                            <td className="px-4 py-2.5 max-w-[200px] truncate font-medium">{t.customer?.name || '-'}</td>
                                            <td className="px-4 py-2.5 text-[13px] text-text-muted whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                            <td className="px-4 py-2.5 text-right font-semibold tnum">{formatRupiah(t.total_amount)}</td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <StatusBadge status={t.payment_status} />
                                                    {t.status === 'draft' && <Badge>Draft</Badge>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <ActionRow t={t} className="justify-end" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/tablet: compact list, bukan tabel diperkecil */}
                        <ul className="lg:hidden divide-y divide-border">
                            {transactions.map((t) => (
                                <li key={t.id} className="px-4 py-3">
                                    <button onClick={() => navigate(`/bon/${t.id}`)} className="w-full text-left">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{t.customer?.name || '-'}</p>
                                                <p className="text-[12px] text-text-muted mt-0.5 tnum">{t.transaction_number} · {formatDate(t.transaction_date)}</p>
                                            </div>
                                            <p className="text-sm font-semibold tnum shrink-0">{formatRupiah(t.total_amount)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <StatusBadge status={t.payment_status} />
                                            {t.status === 'draft' && <Badge>Draft</Badge>}
                                        </div>
                                    </button>
                                    <ActionRow t={t} className="mt-2 pt-2 border-t border-border" />
                                </li>
                            ))}
                        </ul>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="px-4 py-2.5 border-t border-border flex items-center justify-between gap-3">
                                <span className="text-[13px] text-text-muted">
                                    Hal. <span className="font-semibold text-text-main tnum">{meta.current_page}</span> / <span className="tnum">{meta.last_page}</span>
                                    <span className="ml-2 tnum">({meta.total} bon)</span>
                                </span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Sebelumnya</Button>
                                    <Button size="sm" variant="secondary" disabled={page === meta.last_page} onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}>Berikutnya</Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                onConfirm={doDelete}
                loading={deleting}
                title="Hapus bon ini?"
                message={`Bon ${confirmTarget?.transaction_number || ''} beserta semua catatan itemnya akan dihapus permanen dan tidak dapat dikembalikan.`}
                confirmText="Ya, Hapus"
            />
        </div>
    );
}
