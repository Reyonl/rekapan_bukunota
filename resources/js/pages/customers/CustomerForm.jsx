import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------
function Field({ label, required, error, children }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function CustomerForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // ---- form state ----
    const [form, setForm] = useState({
        name: '',
        phone: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});

    // ---- loading flags ----
    const [fetchLoading, setFetchLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // ---- top-level error/success message ----
    const [serverError, setServerError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // ---- fetch existing customer on edit mode ----
    useEffect(() => {
        if (!isEdit) return;

        const fetchCustomer = async () => {
            setFetchLoading(true);
            setServerError('');
            try {
                const res = await api.get(`/customers/${id}`);
                const data = res.data?.data ?? res.data;
                setForm({
                    name: data.name ?? '',
                    phone: data.phone ?? '',
                    notes: data.notes ?? '',
                });
            } catch (err) {
                setServerError(
                    err.response?.data?.message ?? 'Gagal memuat data pelanggan.'
                );
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCustomer();
    }, [id, isEdit]);

    // ---- handlers ----
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) {
            errs.name = 'Nama pelanggan wajib diisi.';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccessMsg('');

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSubmitLoading(true);

        // Build payload — omit empty optional fields
        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim() || null,
            notes: form.notes.trim() || null,
        };

        try {
            if (isEdit) {
                await api.put(`/customers/${id}`, payload);
                setSuccessMsg('Data pelanggan berhasil diperbarui.');
            } else {
                await api.post('/customers', payload);
                setSuccessMsg('Pelanggan baru berhasil ditambahkan.');
            }

            // Brief delay to show success message before redirect
            setTimeout(() => navigate('/pelanggan'), 800);
        } catch (err) {
            const data = err.response?.data;

            // Laravel validation errors: { errors: { field: [msg] } }
            if (data?.errors) {
                const mapped = {};
                Object.entries(data.errors).forEach(([field, msgs]) => {
                    mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
                });
                setErrors(mapped);
            } else {
                setServerError(data?.message ?? 'Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // ---- loading skeleton while fetching ----
    if (fetchLoading) {
        return (
            <div className="py-8 px-4">
                <div className="max-w-lg mx-auto text-sm text-gray-500">
                    Memuat data...
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <div className="max-w-lg mx-auto">
                
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/pelanggan"
                        className="text-sm text-gray-500 hover:text-gray-900 mb-2 inline-block"
                    >
                        &larr; Kembali
                    </Link>
                    <h1 className="text-xl font-medium text-gray-900">
                        {isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
                    </h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded border border-gray-200 p-6">

                    {/* Server-level error */}
                    {serverError && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                            {serverError}
                        </div>
                    )}

                    {/* Success message */}
                    {successMsg && (
                        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                            {successMsg}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate>
                        <Field label="Nama Pelanggan" required error={errors.name}>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Contoh: Budi Santoso"
                                autoComplete="name"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                                    ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                            />
                        </Field>

                        <Field label="No. HP" error={errors.phone}>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Contoh: 08123456789"
                                autoComplete="tel"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                                    ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                            />
                        </Field>

                        <Field label="Catatan" error={errors.notes}>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Catatan opsional..."
                                rows={3}
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-none
                                    ${errors.notes ? 'border-red-400' : 'border-gray-300'}`}
                            />
                        </Field>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <Link
                                to="/pelanggan"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50"
                            >
                                {submitLoading
                                    ? (isEdit ? 'Menyimpan...' : 'Menambahkan...')
                                    : (isEdit ? 'Simpan' : 'Tambah')
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
