import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatRupiah, formatDate } from '../../utils/format';

export default function TransactionList() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (dateFrom) params.set('date_from', dateFrom);
            if (dateTo) params.set('date_to', dateTo);
            params.set('page', page);

            const r = await api.get(`/transactions?${params.toString()}`);
            setTransactions(r.data.data || []);
            setMeta(r.data);
        } catch {
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [search, dateFrom, dateTo, page]);

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus bon ini? Semua catatan di dalamnya akan ikut terhapus.')) return;
        setDeleting(id);
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch {
            alert('Gagal menghapus bon.');
        } finally {
            setDeleting(null);
        }
    };

    const statusBadge = (status) => {
        if (status === 'completed') {
            return <span className="border border-gray-300 px-2 py-0.5 rounded text-xs text-gray-700 bg-gray-50">Selesai</span>;
        }
        return <span className="border border-gray-300 px-2 py-0.5 rounded text-xs text-gray-500">Draft</span>;
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-medium text-gray-900">Riwayat Bon</h1>
                <Link
                    to="/bon/buat"
                    className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                    Buat Bon
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Cari</label>
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Pelanggan / nomor bon"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Dari Tanggal</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="border border-gray-200 rounded bg-white">
                {loading ? (
                    <div className="p-8 text-center text-sm text-gray-500">Memuat...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-900 font-medium mb-1">Belum ada bon</div>
                        <div className="text-gray-500 text-sm">
                            {search || dateFrom || dateTo ? 'Coba ubah filter pencarian.' : 'Mulai dengan membuat bon baru.'}
                        </div>
                        {!search && !dateFrom && !dateTo && (
                            <Link to="/bon/buat" className="inline-block mt-4 bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800">
                                Buat Bon Pertama
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 font-medium text-gray-500">No Bon</th>
                                        <th className="px-4 py-3 font-medium text-gray-500">Pelanggan</th>
                                        <th className="px-4 py-3 font-medium text-gray-500">Tanggal</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 text-right">Total</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 text-center">Status</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 font-mono text-xs">{t.transaction_number}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">{t.customer?.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{formatDate(t.transaction_date)}</td>
                                            <td className="px-4 py-3 text-right text-gray-900 tabular-nums">{formatRupiah(t.total_amount)}</td>
                                            <td className="px-4 py-3 text-center">{statusBadge(t.status)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link to={`/bon/${t.id}`} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Lihat</Link>
                                                    <span className="text-gray-300">|</span>
                                                    <Link to={`/bon/${t.id}/edit`} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Edit</Link>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        disabled={deleting === t.id}
                                                        className="text-gray-600 hover:text-red-600 text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile list */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {transactions.map(t => (
                                <div key={t.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{t.customer?.name}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{t.transaction_number}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900 tabular-nums">{formatRupiah(t.total_amount)}</div>
                                            <div className="text-sm mt-1">{statusBadge(t.status)}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">{formatDate(t.transaction_date)}</div>
                                    <div className="flex gap-4 border-t border-gray-100 pt-3">
                                        <Link to={`/bon/${t.id}`} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Lihat</Link>
                                        <Link to={`/bon/${t.id}/edit`} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Edit</Link>
                                        <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="text-gray-600 hover:text-red-600 text-sm font-medium disabled:opacity-50">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b">
                                <span className="text-sm text-gray-600">
                                    Hal {meta.current_page} / {meta.last_page}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                        disabled={page === meta.last_page}
                                        className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
