import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatRupiah, formatDate } from '../../utils/format';
import { Card, PageHeader, StatusBadge, Badge } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Field, { inputClass } from '../../components/ui/Form';
import { ConfirmDialog } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState, ErrorState } from '../../components/ui/States';
import { toast } from '../../stores/toastStore';

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

    // delete via ConfirmDialog — sama persis endpoint & flow, tanpa window.confirm
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

    const ActionRow = ({ t, className = '' }) => (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/bon/${t.id}`)}>Lihat</Button>
            <Button size="sm" variant="soft" icon="edit" onClick={() => navigate(`/bon/${t.id}/edit`)} aria-label={`Edit bon ${t.transaction_number}`}>Edit</Button>
            <button
                onClick={() => setConfirmTarget(t)}
                aria-label={`Hapus bon ${t.transaction_number}`}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Riwayat Bon"
                subtitle={meta ? `${meta.total ?? transactions.length} bon tercatat` : undefined}
                actions={<Link to="/bon/buat"><Button icon="plus">Buat Bon</Button></Link>}
            />

            {/* Filter */}
            <Card className="p-4 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Cari">
                        <div className="relative">
                            <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Pelanggan atau nomor bon"
                                aria-label="Cari bon"
                                className={`${inputClass()} pl-9`}
                            />
                        </div>
                    </Field>
                    <Field label="Dari tanggal">
                        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} aria-label="Dari tanggal" className={inputClass()} />
                    </Field>
                    <Field label="Sampai tanggal">
                        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} aria-label="Sampai tanggal" className={inputClass()} />
                    </Field>
                </div>
                {hasFilter && (
                    <button
                        onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
                        className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                        <Icon name="x" className="w-3.5 h-3.5" /> Bersihkan filter
                    </button>
                )}
            </Card>

            <Card className="overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-gray-100 px-4 py-2">
                        {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
                    </div>
                ) : loadError ? (
                    <ErrorState message="Gagal memuat transaksi." onRetry={fetchTransactions} />
                ) : transactions.length === 0 ? (
                    <EmptyState
                        icon="receipt"
                        title={hasFilter ? 'Tidak ada bon yang cocok.' : 'Belum ada bon yang dibuat.'}
                        description={hasFilter ? 'Coba ubah kata kunci atau rentang tanggalnya.' : 'Mulai catat penjualan dengan membuat bon pertama.'}
                        action={hasFilter
                            ? <Button size="sm" variant="secondary" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}>Bersihkan filter</Button>
                            : <Link to="/bon/buat"><Button>Buat Bon</Button></Link>}
                    />
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60">
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">No Bon</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pelanggan</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Total</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-brand-50/30 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{t.transaction_number}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">{t.customer?.name || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900 tnum">{formatRupiah(t.total_amount)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <StatusBadge status={t.payment_status} />
                                                    {t.status === 'draft' && <Badge tone="brand">Draft</Badge>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ActionRow t={t} className="justify-end" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <ul className="xl:hidden divide-y divide-gray-100">
                            {transactions.map((t) => (
                                <li key={t.id} className="p-4">
                                    <button onClick={() => navigate(`/bon/${t.id}`)} className="w-full text-left">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{t.customer?.name || '-'}</p>
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">{t.transaction_number}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 tnum shrink-0">{formatRupiah(t.total_amount)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <StatusBadge status={t.payment_status} />
                                            {t.status === 'draft' && <Badge tone="brand">Draft</Badge>}
                                            <span className="text-xs text-gray-500 ml-auto">{formatDate(t.transaction_date)}</span>
                                        </div>
                                    </button>
                                    <ActionRow t={t} className="mt-3 pt-3 border-t border-gray-100" />
                                </li>
                            ))}
                        </ul>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                                <span className="text-sm text-gray-500">
                                    Hal. <span className="font-semibold text-gray-800 tnum">{meta.current_page}</span> / <span className="tnum">{meta.last_page}</span>
                                </span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} icon="chevronLeft">Prev</Button>
                                    <Button size="sm" variant="secondary" disabled={page === meta.last_page} onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}>Next <Icon name="chevronRight" className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            <ConfirmDialog
                open={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                onConfirm={doDelete}
                loading={deleting}
                title="Hapus bon ini?"
                message={`Bon ${confirmTarget?.transaction_number || ''} beserta semua catatan itemnya akan dihapus permanen.`}
                confirmText="Hapus"
            />
        </div>
    );
}
