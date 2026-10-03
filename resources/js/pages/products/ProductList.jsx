import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { formatRupiah } from '../../utils/format';
import { Card, PageHeader, Badge } from '../../components/ui/Card';
import Button, { Spinner } from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Field, { inputClass, inputSmClass } from '../../components/ui/Form';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState, ErrorState } from '../../components/ui/States';
import { toast } from '../../stores/toastStore';

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
        if (!form.category_id) e.category_id = 'Kategori wajib dipilih.';
        if (!form.name.trim()) e.name = 'Nama item wajib diisi.';
        if (form.default_price === '' || isNaN(Number(form.default_price)) || Number(form.default_price) < 0)
            e.default_price = 'Harga tidak valid (min 0).';
        if (!form.unit.trim()) e.unit = 'Satuan wajib diisi.';
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
                setErrors({ _global: 'Gagal menyimpan item. Coba lagi.' });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open onClose={saving ? undefined : onClose} title={isEdit ? 'Edit Item' : 'Tambah Item Baru'} size="lg">
            <form onSubmit={handleSubmit} className="mt-3 space-y-4">
                {errors._global && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {errors._global}
                    </div>
                )}

                <Field label="Kategori" required error={errors.category_id}>
                    <select
                        value={form.category_id}
                        onChange={(e) => set('category_id', e.target.value)}
                        className={inputClass(!!errors.category_id)}
                    >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Nama Item" required error={errors.name}>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="Contoh: Teh Manis Botol"
                        className={inputClass(!!errors.name)}
                    />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Harga Default" required error={errors.default_price}>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={form.default_price}
                            onChange={(e) => set('default_price', e.target.value)}
                            className={`${inputClass(!!errors.default_price)} text-right tnum`}
                        />
                    </Field>
                    <Field label="Satuan" required error={errors.unit}>
                        <input
                            type="text"
                            value={form.unit}
                            onChange={(e) => set('unit', e.target.value)}
                            placeholder="pcs, box, kg..."
                            className={inputClass(!!errors.unit)}
                        />
                    </Field>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 w-fit">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => set('is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#0284c7]"
                    />
                    <span className="text-sm text-gray-700">Status Aktif</span>
                </label>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>Batal</Button>
                    <Button type="submit" variant="primary" loading={saving} loadingText="Menyimpan...">
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Item'}
                    </Button>
                </div>
            </form>
        </Modal>
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
            setError('Gagal memuat data item.');
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
        toast.success(modalProduct ? 'Item berhasil diperbarui.' : 'Item berhasil ditambahkan.');
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
            toast.success(`Status item diubah menjadi ${updated.is_active ? 'Aktif' : 'Nonaktif'}.`);
        } catch {
            toast.error('Gagal mengubah status item.');
        } finally {
            setToggling((s) => { const n = new Set(s); n.delete(product.id); return n; });
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            toast.success('Item berhasil dihapus.');
            setDeleteTarget(null);
        } catch {
            toast.error('Gagal menghapus item.');
        } finally {
            setDeleting(false);
        }
    }

    const Actions = ({ p }) => (
        <div className="flex items-center justify-end gap-1">
            <button
                onClick={() => openEdit(p)}
                aria-label={`Edit item ${p.name}`}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-text-muted hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
                <Icon name="edit" className="w-4 h-4" />
            </button>
            <button
                onClick={() => setDeleteTarget(p)}
                aria-label={`Hapus item ${p.name}`}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:bg-danger-soft hover:text-danger transition-colors"
            >
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
    );

    const StatusToggle = ({ p }) => (
        <button
            onClick={() => handleToggle(p)}
            disabled={toggling.has(p.id)}
            title={p.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
            className="focus:outline-none disabled:opacity-60"
        >
            {toggling.has(p.id)
                ? <Spinner className="h-4 w-4 text-gray-400" />
                : <Badge tone={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Aktif' : 'Nonaktif'}</Badge>}
        </button>
    );

    return (
        <div>
            <PageHeader
                title="Daftar Item"
                subtitle={!loading && !error ? `${products.length} item` : undefined}
                actions={
                    <div className="flex gap-2">
                        <Link to="/item/kategori" className="hidden sm:block">
                            <Button variant="secondary" size="md">Kategori</Button>
                        </Link>
                        <Button onClick={openAdd}>Tambah Item</Button>
                    </div>
                }
            />

            {/* Filter plain satu baris */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <input
                    type="search"
                    placeholder="Cari nama item..."
                    aria-label="Cari item"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputSmClass()} min-w-[180px] flex-1 sm:max-w-xs`}
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    aria-label="Filter kategori"
                    className={`${inputSmClass()} w-auto`}
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    aria-label="Filter status"
                    className={`${inputSmClass()} w-auto`}
                >
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                </select>
                <Link to="/item/kategori" className="sm:hidden inline-flex items-center text-[13px] font-medium text-brand-600 hover:text-brand-700">
                    Kelola Kategori
                </Link>
            </div>

            <Card className="overflow-hidden">
                {error ? (
                    <ErrorState message={error} onRetry={fetchProducts} />
                ) : loading ? (
                    <div className="divide-y divide-gray-100 px-4 py-2">
                        {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState
                        icon="box"
                        title="Tidak ada item ditemukan."
                        description={search || filterCategory || filterActive ? 'Coba ubah kata kunci atau filternya.' : 'Tambahkan item agar bisa dipilih saat membuat bon.'}
                        action={<Button onClick={openAdd} icon="plus">Tambah Item</Button>}
                    />
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2 px-4 text-[11.5px] font-medium text-text-muted">Nama Item</th>
                                        <th className="py-2 px-4 text-[11.5px] font-medium text-text-muted">Kategori</th>
                                        <th className="py-2 px-4 text-[11.5px] font-medium text-text-muted text-right">Harga Default</th>
                                        <th className="py-2 px-4 text-[11.5px] font-medium text-text-muted">Satuan</th>
                                        <th className="py-2 px-4 text-[11.5px] font-medium text-text-muted">Status</th>
                                        <th className="py-2 px-4 text-[11.5px] font-medium text-text-muted text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.map((p) => {
                                        const cat = categories.find((c) => c.id === p.category_id);
                                        return (
                                            <tr key={p.id} className="transition-colors duration-150 hover:bg-[#F7F8FA]">
                                                <td className="py-2.5 px-4 font-medium text-gray-900">{p.name}</td>
                                                <td className="py-2.5 px-4 text-[13px] text-text-muted">{cat ? cat.name : '—'}</td>
                                                <td className="py-2.5 px-4 text-right text-gray-900 font-semibold tnum">{formatRupiah(p.default_price)}</td>
                                                <td className="py-2.5 px-4 text-gray-600">{p.unit}</td>
                                                <td className="py-2.5 px-4"><StatusToggle p={p} /></td>
                                                <td className="py-2.5 px-4 text-right"><Actions p={p} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <ul className="lg:hidden divide-y divide-border">
                            {products.map((p) => {
                                const cat = categories.find((c) => c.id === p.category_id);
                                return (
                                    <li key={p.id} className="p-4 flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                                                <StatusToggle p={p} />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {cat ? cat.name : 'Tanpa kategori'} · {p.unit}
                                            </p>
                                            <p className="text-sm font-bold text-gray-900 tnum mt-1">{formatRupiah(p.default_price)}</p>
                                        </div>
                                        <Actions p={p} />
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </Card>

            {showModal && (
                <ProductFormModal
                    product={modalProduct}
                    categories={categories}
                    onSave={handleSaved}
                    onClose={closeModal}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Hapus Item?"
                message={`Item "${deleteTarget?.name}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.`}
                confirmText="Hapus"
            />
        </div>
    );
}
