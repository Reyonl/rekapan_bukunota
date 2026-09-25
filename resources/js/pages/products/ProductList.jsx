import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/client';
import { formatRupiah } from '../../utils/format';

const EMPTY_FORM = {
    category_id: '',
    name: '',
    default_price: '',
    unit: 'pcs',
    is_active: true,
};

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function Spinner({ sm = false }) {
    const sz = sm ? 'h-4 w-4' : 'h-8 w-8';
    return (
        <svg
            className={`${sz} animate-spin text-gray-600`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}

function StatusBadge({ active }) {
    return active ? (
        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">
            Aktif
        </span>
    ) : (
        <span className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 border border-gray-200">
            Nonaktif
        </span>
    );
}

function DeleteConfirmModal({ product, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="mb-2 text-lg font-medium text-gray-900">Hapus Item?</h3>
                <p className="mb-6 text-sm text-gray-500">
                    Item "{product?.name}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading && <Spinner sm />}
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProductFormModal({ product, categories, onSave, onClose }) {
    const [form, setForm] = useState(
        product
            ? {
                  category_id: product.category_id ?? '',
                  name: product.name ?? '',
                  default_price: product.default_price ?? '',
                  unit: product.unit ?? 'pcs',
                  is_active: product.is_active ?? true,
              }
            : { ...EMPTY_FORM }
    );
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const isEdit = Boolean(product);

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    }

    function validate() {
        const e = {};
        if (!form.category_id) e.category_id = 'Kategori wajib dipilih';
        if (!form.name.trim()) e.name = 'Nama item wajib diisi';
        if (form.default_price === '' || isNaN(Number(form.default_price)) || Number(form.default_price) < 0)
            e.default_price = 'Harga tidak valid (min 0)';
        if (!form.unit.trim()) e.unit = 'Satuan wajib diisi';
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            const payload = {
                ...form,
                default_price: Number(form.default_price),
            };
            if (isEdit) {
                const { data } = await api.put(`/products/${product.id}`, payload);
                onSave(data.data ?? data);
            } else {
                const { data } = await api.post('/products', payload);
                onSave(data.data ?? data);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                const serverErrors = {};
                Object.entries(err.response.data.errors).forEach(([k, v]) => {
                    serverErrors[k] = Array.isArray(v) ? v[0] : v;
                });
                setErrors(serverErrors);
            } else {
                setErrors({ _global: 'Terjadi kesalahan. Coba lagi.' });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16 pb-24">
            <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEdit ? 'Edit Item' : 'Tambah Item Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-medium"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5">
                    {errors._global && (
                        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errors._global}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Kategori
                        </label>
                        <select
                            value={form.category_id}
                            onChange={(e) => set('category_id', e.target.value)}
                            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                                errors.category_id
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                            }`}
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Nama Item
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                                errors.name
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                            }`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Harga Default
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="100"
                                value={form.default_price}
                                onChange={(e) => set('default_price', e.target.value)}
                                className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                                    errors.default_price
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.default_price && (
                                <p className="mt-1 text-xs text-red-600">{errors.default_price}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Satuan
                            </label>
                            <input
                                type="text"
                                value={form.unit}
                                onChange={(e) => set('unit', e.target.value)}
                                className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                                    errors.unit
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.unit && (
                                <p className="mt-1 text-xs text-red-600">{errors.unit}</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => set('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">Status Aktif</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                        >
                            {saving && <Spinner sm />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProductRow({ product, categories, onEdit, onToggle, onDelete }) {
    const cat = categories.find((c) => c.id === product.category_id);
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-sm text-gray-900">{product.name}</td>
            <td className="py-3 px-4 text-sm text-gray-600">{cat ? cat.name : '—'}</td>
            <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatRupiah(product.default_price)}</td>
            <td className="py-3 px-4 text-sm text-gray-600">{product.unit}</td>
            <td className="py-3 px-4 text-sm">
                <button
                    onClick={() => onToggle(product)}
                    className="focus:outline-none"
                    title="Ubah status"
                >
                    <StatusBadge active={product.is_active} />
                </button>
            </td>
            <td className="py-3 px-4 text-sm text-right">
                <button
                    onClick={() => onEdit(product)}
                    className="text-gray-500 hover:text-gray-800 mr-3"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(product)}
                    className="text-gray-500 hover:text-red-600"
                >
                    Hapus
                </button>
            </td>
        </tr>
    );
}

function ProductCard({ product, categories, onEdit, onToggle, onDelete }) {
    const cat = categories.find((c) => c.id === product.category_id);
    return (
        <div className="rounded border border-gray-200 p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">{cat ? cat.name : '—'}</div>
                </div>
                <button onClick={() => onToggle(product)}>
                    <StatusBadge active={product.is_active} />
                </button>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
                <div className="text-gray-900 font-medium">{formatRupiah(product.default_price)}</div>
                <div className="text-gray-600">{product.unit}</div>
            </div>
            <div className="flex gap-3 text-sm">
                <button onClick={() => onEdit(product)} className="text-gray-600 hover:text-gray-900 flex-1 border border-gray-200 rounded py-1.5 text-center">Edit</button>
                <button onClick={() => onDelete(product)} className="text-red-600 hover:text-red-700 flex-1 border border-gray-200 rounded py-1.5 text-center">Hapus</button>
            </div>
        </div>
    );
}

export default function ProductList() {
    const [products, setProducts]       = useState([]);
    const [categories, setCategories]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);

    const [search, setSearch]           = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterActive, setFilterActive]     = useState('');
    const debouncedSearch = useDebounce(search);

    const [modalProduct, setModalProduct]   = useState(null);
    const [showModal, setShowModal]         = useState(false);

    const [deleteTarget, setDeleteTarget]   = useState(null);
    const [deleting, setDeleting]           = useState(false);

    const [toggling, setToggling]           = useState(new Set());
    const [toast, setToast]                 = useState(null);
    const toastRef = useRef(null);

    function showToast(message, type = 'success') {
        setToast({ message, type });
        clearTimeout(toastRef.current);
        toastRef.current = setTimeout(() => setToast(null), 3000);
    }

    useEffect(() => {
        api.get('/categories')
            .then(({ data }) => setCategories(data.data ?? data))
            .catch(() => {});
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (filterCategory) params.category_id = filterCategory;
            if (filterActive !== '') params.is_active = filterActive;
            const { data } = await api.get('/products', { params });
            setProducts(data.data ?? data);
        } catch {
            setError('Gagal memuat data. Coba refresh halaman.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filterCategory, filterActive]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    function openAdd() {
        setModalProduct(null);
        setShowModal(true);
    }

    function openEdit(product) {
        setModalProduct(product);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setModalProduct(null);
    }

    function handleSaved(saved) {
        setProducts((prev) => {
            const idx = prev.findIndex((p) => p.id === saved.id);
            if (idx === -1) return [saved, ...prev];
            const next = [...prev];
            next[idx] = saved;
            return next;
        });
        closeModal();
        showToast(modalProduct ? 'Item berhasil diperbarui!' : 'Item berhasil ditambahkan!');
    }

    async function handleToggle(product) {
        if (toggling.has(product.id)) return;
        setToggling((s) => new Set(s).add(product.id));
        try {
            const { data } = await api.put(`/products/${product.id}`, {
                ...product,
                is_active: !product.is_active,
            });
            const updated = data.data ?? data;
            setProducts((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
            );
            showToast(`Status item diubah menjadi ${updated.is_active ? 'Aktif' : 'Nonaktif'}.`);
        } catch {
            showToast('Gagal mengubah status.', 'error');
        } finally {
            setToggling((s) => { const n = new Set(s); n.delete(product.id); return n; });
        }
    }

    function confirmDelete(product) { setDeleteTarget(product); }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            showToast('Item berhasil dihapus.');
            setDeleteTarget(null);
        } catch {
            showToast('Gagal menghapus item.', 'error');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {toast && (
                <div
                    className={`fixed right-4 top-4 z-[100] flex items-center gap-2 rounded px-4 py-3 text-sm font-medium text-white shadow-sm border ${
                        toast.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-gray-900 border-gray-800'
                    }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-xl font-medium text-gray-900">Daftar Item</h1>
                </div>
                <button
                    onClick={openAdd}
                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Tambah Item
                </button>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Cari nama item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:w-48"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:w-40"
                >
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                </select>
            </div>

            {error && (
                <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">
                    {error}
                    <button onClick={fetchProducts} className="underline">Coba lagi</button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="py-12 text-center border border-gray-200 rounded text-sm text-gray-500 bg-white">
                    Tidak ada item ditemukan.
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="bg-white rounded border border-gray-200">
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500">
                                        Nama Item
                                    </th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500">
                                        Kategori
                                    </th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500 text-right">
                                        Harga Default
                                    </th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500">
                                        Satuan
                                    </th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500">
                                        Status
                                    </th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <ProductRow
                                        key={product.id}
                                        product={product}
                                        categories={categories}
                                        onEdit={openEdit}
                                        onToggle={handleToggle}
                                        onDelete={confirmDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="sm:hidden p-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                categories={categories}
                                onEdit={openEdit}
                                onToggle={handleToggle}
                                onDelete={confirmDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <ProductFormModal
                    product={modalProduct}
                    categories={categories}
                    onSave={handleSaved}
                    onClose={closeModal}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    product={deleteTarget}
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
