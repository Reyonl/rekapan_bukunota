import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Card, PageHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Field, { inputClass } from '../../components/ui/Form';
import { Skeleton } from '../../components/ui/States';
import { toast } from '../../stores/toastStore';

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

    // ---- top-level error message ----
    const [serverError, setServerError] = useState('');

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
                toast.success('Data pelanggan berhasil diperbarui.');
            } else {
                await api.post('/customers', payload);
                toast.success('Pelanggan baru berhasil ditambahkan.');
            }
            navigate('/pelanggan');
        } catch (err) {
            const data = err.response?.data;

            // Laravel validation errors: { errors: { field: [msg] } }
            if (data?.errors) {
                const mapped = {};
                Object.entries(data.errors).forEach(([field, msgs]) => {
                    mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
                });
                setErrors(mapped);
                toast.error('Periksa kembali isian formulir.');
            } else {
                setServerError(data?.message ?? 'Gagal menyimpan data pelanggan.');
                toast.error(data?.message ?? 'Gagal menyimpan data pelanggan.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // ---- loading skeleton while fetching ----
    if (fetchLoading) {
        return (
            <div className="max-w-lg space-y-4">
                <Skeleton className="h-8 w-48" />
                <Card className="p-6 space-y-5">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-lg">
            <PageHeader
                title={isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
                back={<Link to="/pelanggan" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"><Icon name="arrowLeft" className="w-4 h-4" /> Daftar Pelanggan</Link>}
            />

            <Card className="p-5 md:p-6">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <Field label="Nama Pelanggan" required error={errors.name} htmlFor="name">
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Contoh: Budi Santoso"
                            autoComplete="name"
                            className={inputClass(!!errors.name)}
                        />
                    </Field>

                    <Field label="No. HP" error={errors.phone} htmlFor="phone" hint="(opsional)">
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Contoh: 08123456789"
                            autoComplete="tel"
                            className={`${inputClass(!!errors.phone)} tnum`}
                        />
                    </Field>

                    <Field label="Catatan" error={errors.notes} htmlFor="notes" hint="(opsional)">
                        <textarea
                            id="notes"
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Contoh: langganan gorengan, bayar mingguan"
                            rows={3}
                            className={`${inputClass(!!errors.notes)} h-auto py-2 resize-y`}
                        />
                    </Field>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Link to="/pelanggan">
                            <Button variant="secondary">Batal</Button>
                        </Link>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitLoading}
                            loadingText={isEdit ? 'Menyimpan...' : 'Menambahkan...'}
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
