import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Card, PageHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { inputClass } from '../../components/ui/Form';
import { ConfirmDialog } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState, ErrorState } from '../../components/ui/States';
import { toast } from '../../stores/toastStore';

function AddCategoryForm({ onSave, onCancel }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setError('Nama kategori wajib diisi.'); return; }
        setSaving(true);
        try {
            const { data } = await api.post('/categories', { name: name.trim() });
            onSave(data.data ?? data);
        } catch (err) {
            if (err.response?.data?.errors?.name) {
                setError(Array.isArray(err.response.data.errors.name) ? err.response.data.errors.name[0] : err.response.data.errors.name);
            } else {
                setError('Gagal menyimpan kategori. Coba lagi.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        placeholder="Nama kategori..."
                        aria-label="Nama kategori baru"
                        className={inputClass(!!error)}
                    />
                    {error && <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
                </div>
                <div className="flex gap-2">
                    <Button type="submit" variant="primary" loading={saving} loadingText="Menyimpan...">Simpan</Button>
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Batal</Button>
                </div>
            </div>
        </form>
    );
}

function EditCategoryRow({ category, onSave, onCancel }) {
    const [name, setName] = useState(category.name);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setError('Nama kategori wajib diisi.'); return; }
        if (name.trim() === category.name) { onCancel(); return; }
        setSaving(true);
        try {
            const { data } = await api.put(`/categories/${category.id}`, { name: name.trim() });
            onSave(data.data ?? data);
        } catch (err) {
            if (err.response?.data?.errors?.name) {
                setError(Array.isArray(err.response.data.errors.name) ? err.response.data.errors.name[0] : err.response.data.errors.name);
            } else {
                setError('Gagal menyimpan. Coba lagi.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Escape' && onCancel()}
                    aria-label={`Edit nama kategori ${category.name}`}
                    className={inputClass(!!error)}
                />
                {error && <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
            </div>
            <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" loading={saving} loadingText="Menyimpan...">Simpan</Button>
                <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={saving}>Batal</Button>
            </div>
        </form>
    );
}

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');

    async function fetchCategories() {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/categories');
            setCategories(data.data ?? data);
        } catch {
            setError('Gagal memuat kategori.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchCategories(); }, []);

    function handleAdded(saved) {
        setCategories((prev) => [saved, ...prev]);
        setShowAddForm(false);
        toast.success('Kategori berhasil ditambahkan.');
    }

    function handleUpdated(saved) {
        setCategories((prev) => prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)));
        setEditingId(null);
        toast.success('Kategori berhasil diperbarui.');
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/categories/${deleteTarget.id}`);
            setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            toast.success('Kategori berhasil dihapus.');
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal menghapus kategori. Mungkin masih ada item yang terkait.');
        } finally {
            setDeleting(false);
        }
    }

    const filtered = search.trim()
        ? categories.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
        : categories;

    const totalItems = categories.reduce((sum, c) => sum + (c.products_count ?? c.products?.length ?? 0), 0);

    return (
        <div className="max-w-2xl">
            <PageHeader
                title="Kategori"
                subtitle={!loading && !error ? `${categories.length} kategori · ${totalItems} total item` : undefined}
                back={<Link to="/item" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"><Icon name="arrowLeft" className="w-4 h-4" /> Daftar Item</Link>}
                actions={!showAddForm && <Button icon="plus" onClick={() => { setShowAddForm(true); setEditingId(null); }}>Tambah Kategori</Button>}
            />

            <Card className="p-4">
                {showAddForm && (
                    <AddCategoryForm onSave={handleAdded} onCancel={() => setShowAddForm(false)} />
                )}

                <div className="relative mb-4">
                    <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Cari nama kategori..."
                        aria-label="Cari kategori"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClass()} pl-9`}
                    />
                </div>

                {error ? (
                    <ErrorState message={error} onRetry={fetchCategories} />
                ) : loading ? (
                    <div className="divide-y divide-gray-100">
                        {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon="tag"
                        title={search ? 'Tidak ada kategori yang cocok.' : 'Belum ada kategori.'}
                        description={search ? 'Coba kata kunci lain.' : 'Kategori dipakai untuk mengelompokkan item.'}
                        action={!search && <Button size="sm" icon="plus" onClick={() => setShowAddForm(true)}>Tambah Kategori</Button>}
                    />
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {filtered.map((category) => {
                            const count = category.products_count ?? category.products?.length ?? 0;
                            if (editingId === category.id) {
                                return (
                                    <li key={category.id} className="py-3">
                                        <EditCategoryRow
                                            category={category}
                                            onSave={handleUpdated}
                                            onCancel={() => setEditingId(null)}
                                        />
                                    </li>
                                );
                            }
                            return (
                                <li key={category.id} className="flex items-center gap-3 py-2.5 group">
                                    <span className="w-8 h-8 rounded-[10px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                                        <Icon name="tag" className="w-4 h-4" />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{category.name}</p>
                                        <p className="text-xs text-gray-500 tnum">{count} item</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setShowAddForm(false); setEditingId(category.id); }}
                                            aria-label={`Edit kategori ${category.name}`}
                                            className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                                        >
                                            <Icon name="edit" className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(category)}
                                            disabled={count > 0}
                                            aria-label={`Hapus kategori ${category.name}`}
                                            title={count > 0 ? 'Tidak bisa dihapus — masih ada item' : 'Hapus'}
                                            className="w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                                        >
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                loading={deleting}
                title="Hapus Kategori?"
                message={`Kategori "${deleteTarget?.name}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.`}
                confirmText="Hapus"
            />
        </div>
    );
}
