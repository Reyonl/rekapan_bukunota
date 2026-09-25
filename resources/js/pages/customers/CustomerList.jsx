import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';

// ---------------------------------------------------------------------------
// Toast component
// ---------------------------------------------------------------------------
function Toast({ toasts, onDismiss }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-start gap-3 rounded px-4 py-3 border text-sm transition-all shadow-sm
                        ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    <span className="flex-1">{t.message}</span>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="ml-2 font-bold leading-none opacity-70 hover:opacity-100"
                        aria-label="Tutup"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Confirm Dialog component
// ---------------------------------------------------------------------------
function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded shadow-sm w-full max-w-sm p-6 border border-gray-200">
                <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 text-sm mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-3 py-1.5 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------
function StatusBadge({ isActive }) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
        >
            {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function CustomerList() {
    const navigate = useNavigate();

    // ---- state ----
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState(true); // true = Aktif only
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null); // { id, name }
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Toggle loading tracker
    const [togglingId, setTogglingId] = useState(null);

    // ---- toast helpers ----
    const pushToast = useCallback((type, message) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ---- fetch ----
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (filterActive) params.is_active = 1;

            const res = await api.get('/customers', { params });
            const data = res.data;

            // Support both paginated { data: [...] } and plain array responses
            setCustomers(Array.isArray(data) ? data : data.data ?? []);
        } catch (err) {
            pushToast('error', err.response?.data?.message ?? 'Gagal memuat data pelanggan.');
        } finally {
            setLoading(false);
        }
    }, [search, filterActive, pushToast]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(fetchCustomers, 350);
        return () => clearTimeout(timer);
    }, [fetchCustomers]);

    // ---- delete ----
    const handleDeleteRequest = (customer) => {
        setConfirmTarget(customer);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!confirmTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/customers/${confirmTarget.id}`);
            pushToast('success', `Pelanggan "${confirmTarget.name}" berhasil dihapus.`);
            setConfirmOpen(false);
            setConfirmTarget(null);
            fetchCustomers();
        } catch (err) {
            pushToast('error', err.response?.data?.message ?? 'Gagal menghapus pelanggan.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // ---- toggle active ----
    const handleToggleActive = async (customer) => {
        setTogglingId(customer.id);
        try {
            await api.put(`/customers/${customer.id}`, {
                is_active: !customer.is_active,
            });
            const action = customer.is_active ? 'dinonaktifkan' : 'diaktifkan';
            pushToast('success', `Pelanggan "${customer.name}" berhasil ${action}.`);
            fetchCustomers();
        } catch (err) {
            pushToast('error', err.response?.data?.message ?? 'Gagal mengubah status pelanggan.');
        } finally {
            setTogglingId(null);
        }
    };

    // ---- render helpers ----
    const ActionButtons = ({ customer }) => (
        <div className="flex items-center justify-end gap-3">
            <button
                onClick={() => navigate(`/pelanggan/${customer.id}/edit`)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
                Edit
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => handleToggleActive(customer)}
                disabled={togglingId === customer.id}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
            >
                {togglingId === customer.id
                    ? '...'
                    : customer.is_active
                        ? 'Nonaktifkan'
                        : 'Aktifkan'}
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => handleDeleteRequest(customer)}
                className="text-sm text-gray-600 hover:text-red-600 font-medium"
            >
                Hapus
            </button>
        </div>
    );

    return (
        <>
            {/* Toasts */}
            <Toast toasts={toasts} onDismiss={dismissToast} />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                title="Hapus Pelanggan"
                message={`Apakah Anda yakin ingin menghapus pelanggan "${confirmTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                loading={deleteLoading}
            />

            {/* Page */}
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-medium text-gray-900">Pelanggan</h1>
                    <button
                        onClick={() => navigate('/pelanggan/tambah')}
                        className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded transition"
                    >
                        Tambah Pelanggan
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="search"
                            placeholder="Cari nama pelanggan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        />
                    </div>

                    {/* Filter toggle */}
                    <div className="flex rounded border border-gray-300 overflow-hidden bg-white shrink-0">
                        <button
                            onClick={() => setFilterActive(true)}
                            className={`px-4 py-2 text-sm font-medium transition
                                ${filterActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => setFilterActive(false)}
                            className={`px-4 py-2 text-sm font-medium transition border-l border-gray-300
                                ${!filterActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Semua
                        </button>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="py-12 text-center text-sm text-gray-500">
                        Memuat data...
                    </div>
                )}

                {/* Empty state */}
                {!loading && customers.length === 0 && (
                    <div className="py-12 text-center border border-gray-200 rounded bg-white">
                        <p className="text-sm font-medium text-gray-900">Tidak ada pelanggan ditemukan</p>
                        <p className="text-sm text-gray-500 mt-1">Sesuaikan kata kunci pencarian atau filter status.</p>
                    </div>
                )}

                {/* ---- DESKTOP TABLE ---- */}
                {!loading && customers.length > 0 && (
                    <div className="bg-white rounded border border-gray-200 overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-sm text-gray-500 font-medium border-b border-gray-200">Nama</th>
                                    <th className="px-4 py-3 text-sm text-gray-500 font-medium border-b border-gray-200">No. HP</th>
                                    <th className="px-4 py-3 text-sm text-gray-500 font-medium border-b border-gray-200">Status</th>
                                    <th className="px-4 py-3 text-sm text-gray-500 font-medium border-b border-gray-200 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-gray-900 font-medium">
                                            <Link
                                                to={`/bon?search=${c.name}`}
                                                className="hover:underline"
                                            >
                                                {c.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {c.phone || <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge isActive={c.is_active} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <ActionButtons customer={c} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!loading && customers.length > 0 && (
                    <p className="text-xs text-gray-500 mt-4 text-right">
                        Menampilkan {customers.length} pelanggan
                    </p>
                )}
            </div>
        </>
    );
}
