import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';

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

function DeleteConfirmModal({ category, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="mb-2 text-lg font-medium text-gray-900">Hapus Kategori?</h3>
                <p className="mb-6 text-sm text-gray-500">
                    Kategori "{category?.name}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
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

function AddCategoryForm({ onSave, onCancel }) {
    const [name, setName]       = useState('');
    const [error, setError]     = useState('');
    const [saving, setSaving]   = useState(false);
    const inputRef              = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setError('Nama kategori wajib diisi'); return; }
        setSaving(true);
        try {
            const { data } = await api.post('/categories', { name: name.trim() });
            onSave(data.data ?? data);
        } catch (err) {
            if (err.response?.data?.errors?.name) {
                setError(
                    Array.isArray(err.response.data.errors.name)
                        ? err.response.data.errors.name[0]
                        : err.response.data.errors.name
                );
            } else {
                setError('Terjadi kesalahan. Coba lagi.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4 rounded border border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-3">
                <div className="flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        placeholder="Nama kategori..."
                        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                            error ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2"
                >
                    {saving && <Spinner sm />}
                    Simpan
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}

function EditCategoryRow({ category, onSave, onCancel }) {
    const [name, setName]       = useState(category.name);
    const [error, setError]     = useState('');
    const [saving, setSaving]   = useState(false);
    const inputRef              = useRef(null);

    useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setError('Nama kategori wajib diisi'); return; }
        if (name.trim() === category.name) { onCancel(); return; }
        setSaving(true);
        try {
            const { data } = await api.put(`/categories/${category.id}`, { name: name.trim() });
            onSave(data.data ?? data);
        } catch (err) {
            if (err.response?.data?.errors?.name) {
                setError(
                    Array.isArray(err.response.data.errors.name)
                        ? err.response.data.errors.name[0]
                        : err.response.data.errors.name
                );
            } else {
                setError('Terjadi kesalahan. Coba lagi.');
            }
        } finally {
            setSaving(false);
        }
    }

    function handleKey(e) {
        if (e.key === 'Escape') onCancel();
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
            <div className="flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    onKeyDown={handleKey}
                    className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                        error ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
            <button
                type="submit"
                disabled={saving}
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2"
            >
                {saving && <Spinner sm />}
                Simpan
            </button>
            <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
                Batal
            </button>
        </form>
    );
}

function CategoryItem({ category, onEdit, onDelete }) {
    const count = category.products_count ?? category.products?.length ?? 0;

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-sm text-gray-900">{category.name}</td>
            <td className="py-3 px-4 text-sm text-gray-600 text-right">{count} item</td>
            <td className="py-3 px-4 text-sm text-right">
                <button
                    onClick={() => onEdit(category)}
                    className="text-gray-500 hover:text-gray-800 mr-3"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(category)}
                    disabled={count > 0}
                    className="text-gray-500 hover:text-red-600 disabled:opacity-40 disabled:hover:text-gray-500"
                    title={count > 0 ? "Tidak bisa dihapus — masih ada item" : ""}
                >
                    Hapus
                </button>
            </td>
        </tr>
    );
}

export default function CategoryList() {
    const [categories, setCategories]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting]       = useState(false);

    const [search, setSearch]           = useState('');

    const [toast, setToast]             = useState(null);
    const toastRef                      = useRef(null);

    function showToast(message, type = 'success') {
        setToast({ message, type });
        clearTimeout(toastRef.current);
        toastRef.current = setTimeout(() => setToast(null), 3000);
    }

    async function fetchCategories() {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/categories');
            setCategories(data.data ?? data);
        } catch {
            setError('Gagal memuat data. Coba refresh halaman.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchCategories(); }, []);

    function handleAdded(saved) {
        setCategories((prev) => [saved, ...prev]);
        setShowAddForm(false);
        showToast('Kategori berhasil ditambahkan!');
    }

    function handleUpdated(saved) {
        setCategories((prev) =>
            prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c))
        );
        setEditingId(null);
        showToast('Kategori berhasil diperbarui!');
    }

    function handleEdit(category) {
        setShowAddForm(false);
        setEditingId(category.id);
    }

    function handleDeleteRequest(category) {
        const count = category.products_count ?? category.products?.length ?? 0;
        if (count > 0) return;
        setDeleteTarget(category);
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/categories/${deleteTarget.id}`);
            setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            showToast('Kategori berhasil dihapus.');
            setDeleteTarget(null);
        } catch (err) {
            const msg =
                err.response?.data?.message ??
                'Gagal menghapus kategori. Mungkin masih ada item yang terkait.';
            showToast(msg, 'error');
        } finally {
            setDeleting(false);
        }
    }

    const filtered = search.trim()
        ? categories.filter((c) =>
              c.name.toLowerCase().includes(search.trim().toLowerCase())
          )
        : categories;

    const totalItems = categories.reduce(
        (sum, c) => sum + (c.products_count ?? c.products?.length ?? 0),
        0
    );

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
                    <h1 className="text-xl font-medium text-gray-900">Kategori</h1>
                    {!loading && !error && (
                        <p className="mt-1 text-sm text-gray-500">
                            {categories.length} kategori · {totalItems} total item
                        </p>
                    )}
                </div>
                <button
                    onClick={() => { setShowAddForm(true); setEditingId(null); }}
                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Tambah Kategori
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Cari nama kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-sm rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
            </div>

            {error && (
                <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">
                    {error}
                    <button onClick={fetchCategories} className="underline">Coba lagi</button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            )}

            {!loading && !error && (
                <div>
                    {showAddForm && (
                        <AddCategoryForm
                            onSave={handleAdded}
                            onCancel={() => setShowAddForm(false)}
                        />
                    )}

                    {filtered.length === 0 && !showAddForm && (
                        <div className="py-12 text-center text-sm text-gray-500 border border-gray-200 rounded bg-white">
                            {search ? 'Tidak ada kategori cocok.' : 'Belum ada kategori.'}
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="overflow-x-auto bg-white border border-gray-200 rounded">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500">
                                            Nama Kategori
                                        </th>
                                        <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500 text-right">
                                            Total Item
                                        </th>
                                        <th className="border-b border-gray-200 py-3 px-4 text-sm font-medium text-gray-500 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((category) =>
                                        editingId === category.id ? (
                                            <tr key={category.id} className="border-b border-gray-200">
                                                <td colSpan={3} className="py-3 px-4">
                                                    <EditCategoryRow
                                                        category={category}
                                                        onSave={handleUpdated}
                                                        onCancel={() => setEditingId(null)}
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            <CategoryItem
                                                key={category.id}
                                                category={category}
                                                onEdit={handleEdit}
                                                onDelete={handleDeleteRequest}
                                            />
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    category={deleteTarget}
                    loading={deleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
