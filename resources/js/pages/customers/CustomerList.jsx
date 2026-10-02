import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Card, PageHeader, Badge } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { inputClass } from '../../components/ui/Form';
import { ConfirmDialog } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState } from '../../components/ui/States';
import { toast } from '../../stores/toastStore';

export default function CustomerList() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState(true); // true = Aktif only
    const [loading, setLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null); // { id, name }
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Toggle loading tracker
    const [togglingId, setTogglingId] = useState(null);

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
            toast.error(err.response?.data?.message ?? 'Gagal memuat data pelanggan.');
        } finally {
            setLoading(false);
            setFirstLoad(false);
        }
    }, [search, filterActive]);

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
            toast.success(`Pelanggan "${confirmTarget.name}" berhasil dihapus.`);
            setConfirmOpen(false);
            setConfirmTarget(null);
            fetchCustomers();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal menghapus pelanggan.');
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
            toast.success(`Pelanggan "${customer.name}" berhasil ${action}.`);
            fetchCustomers();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal mengubah status pelanggan.');
        } finally {
            setTogglingId(null);
        }
    };

    const ActionButtons = ({ customer }) => (
        <div className="flex items-center justify-end gap-1">
            <button
                onClick={() => navigate(`/pelanggan/${customer.id}/edit`)}
                aria-label={`Edit pelanggan ${customer.name}`}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
                <Icon name="edit" className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleToggleActive(customer)}
                disabled={togglingId === customer.id}
                aria-label={customer.is_active ? `Nonaktifkan ${customer.name}` : `Aktifkan ${customer.name}`}
                title={customer.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
                {togglingId === customer.id
                    ? <Icon name="clock" className="w-4 h-4 animate-spin" />
                    : <Icon name={customer.is_active ? 'x' : 'check'} className="w-4 h-4" />}
            </button>
            <button
                onClick={() => handleDeleteRequest(customer)}
                aria-label={`Hapus pelanggan ${customer.name}`}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Pelanggan"
                subtitle={firstLoad || loading ? undefined : `${customers.length} pelanggan`}
                actions={<Button icon="plus" onClick={() => navigate('/pelanggan/tambah')}>Tambah Pelanggan</Button>}
            />

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                onConfirm={handleDeleteConfirm}
                loading={deleteLoading}
                title="Hapus Pelanggan"
                message={`Apakah Anda yakin ingin menghapus pelanggan "${confirmTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
            />

            {/* Toolbar */}
            <Card className="p-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Cari nama pelanggan..."
                            aria-label="Cari pelanggan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputClass()} pl-9`}
                        />
                    </div>
                    <div className="flex border border-gray-200 rounded-[10px] overflow-hidden bg-white shrink-0" role="group" aria-label="Filter status">
                        <button
                            onClick={() => setFilterActive(true)}
                            aria-pressed={filterActive}
                            className={`h-10 px-4 text-sm font-medium transition-colors ${filterActive ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => setFilterActive(false)}
                            aria-pressed={!filterActive}
                            className={`h-10 px-4 text-sm font-medium transition-colors border-l border-gray-200 ${!filterActive ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Semua
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden">
                {firstLoad && loading ? (
                    <div className="divide-y divide-gray-100 px-4 py-2">
                        {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
                    </div>
                ) : customers.length === 0 ? (
                    <EmptyState
                        icon="users"
                        title="Tidak ada pelanggan ditemukan"
                        description={search ? 'Sesuaikan kata kunci pencarian atau filter status.' : 'Tambahkan pelanggan pertama untuk mulai mencatat bon.'}
                        action={<Button onClick={() => navigate('/pelanggan/tambah')} icon="plus">Tambah Pelanggan</Button>}
                    />
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60">
                                        <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nama</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">No. HP</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map((c) => (
                                        <tr key={c.id} className="hover:bg-brand-50/30 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-gray-900">
                                                <Link to={`/bon?search=${encodeURIComponent(c.name)}`} className="hover:text-brand-700">
                                                    {c.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 tnum">
                                                {c.phone || <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge tone={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <ActionButtons customer={c} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <ul className="xl:hidden divide-y divide-gray-100">
                            {customers.map((c) => (
                                <li key={c.id} className="p-4 flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 text-[13px] font-bold">
                                        {c.name.trim().charAt(0).toUpperCase()}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 tnum">
                                            {c.phone || 'Tanpa nomor'} · <Badge tone={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                        </p>
                                    </div>
                                    <ActionButtons customer={c} />
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Card>
        </div>
    );
}
