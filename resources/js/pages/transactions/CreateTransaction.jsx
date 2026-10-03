import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Select from 'react-select';
import api from '../../api/client';
import { formatRupiah, today } from '../../utils/format';
import { Card, PageHeader, StatusBadge } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Field, { inputClass, reactSelectStyles } from '../../components/ui/Form';
import { ConfirmDialog } from '../../components/ui/Modal';
import { toast } from '../../stores/toastStore';

export default function CreateTransaction() {
    const { id } = useParams();
    const navigate = useNavigate();

    // -- State: Header
    const [transactionId, setTransactionId] = useState(id || null);
    const [transactionNumber, setTransactionNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [transactionDate, setTransactionDate] = useState(today());
    const [notes, setNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('unpaid');
    const [headerSaved, setHeaderSaved] = useState(false);

    // -- State: Data
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // -- State: UI & Form
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deletingItem, setDeletingItem] = useState(null);

    // Form Item
    const [formItem, setFormItem] = useState(null); // Selected product object
    const [formDescription, setFormDescription] = useState('');
    const [formQty, setFormQty] = useState('1');
    const [formPrice, setFormPrice] = useState('');
    const [formSubtotal, setFormSubtotal] = useState('');
    const [formManualName, setFormManualName] = useState('');
    const [isManualItem, setIsManualItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [addingItem, setAddingItem] = useState(false);

    // Focus refs
    const itemSelectRef = useRef(null);
    const qtyInputRef = useRef(null);

    // Calculate promo logic
    const calculatePromoSubtotal = (name, qty, unitPrice) => {
        if (!name) return (qty * unitPrice) || 0;
        const lowerName = name.toLowerCase();
        let subtotal = qty * unitPrice;

        if (lowerName.includes('gorengan')) {
            const promoQty = Math.floor(qty / 3);
            const remainder = qty % 3;
            subtotal = (promoQty * 5000) + (remainder * unitPrice);
        } else if (['donat', 'nagasari', 'lemper', 'jajanan'].some(k => lowerName.includes(k))) {
            const promoQty = Math.floor(qty / 2);
            const remainder = qty % 2;
            subtotal = (promoQty * 5000) + (remainder * unitPrice);
        }
        return subtotal || 0;
    };

    const handlePriceChange = (e) => {
        let raw = e.target.value;
        raw = raw.replace(/[^\d-]/g, '');
        if (raw.lastIndexOf('-') > 0) {
            raw = raw.replace(/-/g, '');
        }
        if (raw !== '0' && raw !== '-' && raw !== '-0') {
             raw = raw.replace(/^(-?)0+(?=\d)/, '$1');
        }
        setFormPrice(raw);
    };

    const formatPriceDisplay = (val) => {
        if (val === '' || val === '-' || val === undefined || val === null) return val;
        if (val === '-0') return '-0';
        let isNeg = val.toString().startsWith('-');
        let numStr = val.toString().replace('-', '');
        let formatted = Number(numStr).toLocaleString('id-ID');
        return isNeg ? '-' + formatted : formatted;
    };

    // Auto calculate subtotal on form change
    useEffect(() => {
        const qty = Number(formQty) || 0;
        const price = Number(formPrice) || 0;
        const name = isManualItem ? formManualName : (formItem?.name || '');
        setFormSubtotal(calculatePromoSubtotal(name, qty, price).toString());
    }, [formQty, formPrice, formItem, isManualItem, formManualName]);

    // Load initial data
    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/customers?is_active=1'),
            api.get('/products?is_active=1')
        ]).then(([custRes, prodRes]) => {
            const custList = Array.isArray(custRes.data) ? custRes.data : custRes.data.data || [];
            const prodList = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.data || [];
            setCustomers(custList);
            setProducts(prodList);

            if (id) {
                api.get(`/transactions/${id}`).then(res => {
                    const data = res.data;
                    setTransactionId(data.id);
                    setTransactionNumber(data.transaction_number);
                    setCustomerId(data.customer_id?.toString() || '');
                    setTransactionDate(data.transaction_date?.split('T')[0] || today());
                    setNotes(data.notes || '');
                    setPaymentStatus(data.payment_status || 'unpaid');
                    setItems(data.items || []);
                    setTotalAmount(data.total_amount || 0);
                    setHeaderSaved(true);
                }).catch(() => {
                    setError('Gagal memuat draft bon.');
                }).finally(() => {
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
    }, [id]);

    const saveHeader = async () => {
        if (!customerId || !transactionDate) {
            setError('Pelanggan dan tanggal wajib diisi.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (!transactionId) {
                const r = await api.post('/transactions', {
                    customer_id: Number(customerId),
                    transaction_date: transactionDate,
                    notes,
                    payment_status: paymentStatus
                });
                setTransactionId(r.data.id);
                setTransactionNumber(r.data.transaction_number);
                setHeaderSaved(true);
                toast.success('Bon dibuat. Silakan tambah catatan item.');
                navigate(`/bon/${r.data.id}/edit`, { replace: true });
            } else {
                await api.put(`/transactions/${transactionId}`, {
                    customer_id: Number(customerId),
                    transaction_date: transactionDate,
                    notes,
                    payment_status: paymentStatus
                });
                toast.success('Perubahan bon tersimpan.');
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Gagal menyimpan bon.');
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (status) => {
        setPaymentStatus(status);
        if (transactionId) {
            try {
                await api.put(`/transactions/${transactionId}`, {
                    payment_status: status
                });
            } catch (e) {
                setError('Gagal mengubah status pembayaran.');
            }
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        const qty = Number(formQty);
        const price = Number(formPrice);
        const sub = Number(formSubtotal);
        const name = isManualItem ? formManualName : formItem?.name;

        if (!name || qty <= 0 || isNaN(price)) {
            setError('Item, Qty, dan Harga harus valid.');
            return;
        }

        setError('');
        setAddingItem(true);
        try {
            if (editingItemId) {
                await api.put(`/transaction-items/${editingItemId}`, {
                    product_id: isManualItem ? null : (formItem ? formItem.id : null),
                    product_name: name,
                    description: formDescription,
                    quantity: qty,
                    unit_price: price,
                    subtotal: sub
                });
                setEditingItemId(null);
            } else {
                await api.post(`/transactions/${transactionId}/items`, {
                    product_id: isManualItem ? null : formItem.id,
                    product_name: name,
                    description: formDescription,
                    quantity: qty,
                    unit_price: price,
                    subtotal: sub
                });
            }

            // Refresh transaction to get updated items & total
            const r = await api.get(`/transactions/${transactionId}`);
            setItems(r.data.items);
            setTotalAmount(r.data.total_amount);

            // Reset form
            setFormItem(null);
            setFormManualName('');
            setFormDescription('');
            setFormQty('1');
            setFormPrice('');
            setFormSubtotal('');

            toast.success('Item tersimpan.');
            if (itemSelectRef.current) itemSelectRef.current.focus();
        } catch (e) {
            setError('Gagal menyimpan item.');
        } finally {
            setAddingItem(false);
        }
    };

    const handleEditItem = (item) => {
        setEditingItemId(item.id);
        if (item.product_id) {
            setIsManualItem(false);
            const prod = products.find(p => p.id === item.product_id);
            setFormItem(prod || { id: item.product_id, name: item.product_name });
        } else {
            setIsManualItem(true);
            setFormManualName(item.product_name);
            setFormItem(null);
        }
        setFormDescription(item.description || '');
        setFormQty(item.quantity.toString());
        setFormPrice(item.unit_price.toString());
        setFormSubtotal(item.subtotal.toString());

        // Scroll to form smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetItemForm = () => {
        setEditingItemId(null);
        setFormItem(null);
        setFormManualName('');
        setFormDescription('');
        setFormQty('1');
        setFormPrice('');
        setFormSubtotal('');
    };

    const removeItem = async (itemId) => {
        try {
            await api.delete(`/transaction-items/${itemId}`);
            const r = await api.get(`/transactions/${transactionId}`);
            setItems(r.data.items);
            setTotalAmount(r.data.total_amount);
            toast.success('Item dihapus.');
            if (editingItemId === itemId) resetItemForm();
        } catch (e) {
            setError('Gagal menghapus item.');
        } finally {
            setDeletingItem(null);
        }
    };

    const finalizeBon = async () => {
        if (!transactionId) return;
        setLoading(true);
        try {
            await api.put(`/transactions/${transactionId}`, {
                status: 'completed'
            });
            toast.success('Bon selesai disimpan.');
            navigate(`/bon/${transactionId}`);
        } catch (e) {
            setError('Gagal menyelesaikan bon.');
        } finally {
            setLoading(false);
        }
    };

    // React-Select options mapping
    const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
    const productOptions = [
        { value: 'MANUAL', label: '+ Input Manual / Item Lain' },
        ...products.map(p => ({ value: p.id, label: p.name, product: p }))
    ];

    return (
        <div className="max-w-3xl">
            <PageHeader
                title={id ? 'Edit Bon' : 'Buat Bon'}
                subtitle={headerSaved && transactionNumber ? transactionNumber : 'Isi pelanggan & tanggal, lalu tambahkan catatan item.'}
                actions={headerSaved ? (
                    <Link to={`/bon/${transactionId}`}>
                        <Button variant="secondary" size="sm" icon="arrowLeft">Detail Bon</Button>
                    </Link>
                ) : undefined}
            />

            {error && (
                <div className="mb-5 flex items-start gap-2 p-3 bg-danger-soft text-danger text-sm border border-[#FECACA] rounded-xl" role="alert">
                    <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* 1. Informasi Bon */}
            <Card className="p-4 md:p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Pelanggan" required>
                        <Select
                            options={customerOptions}
                            value={customerOptions.find(o => o.value.toString() === customerId.toString()) || null}
                            onChange={(opt) => setCustomerId(opt ? opt.value : '')}
                            placeholder="Cari pelanggan..."
                            isDisabled={headerSaved}
                            styles={reactSelectStyles}
                        />
                    </Field>
                    <Field label="Tanggal" required>
                        <input
                            type="date"
                            value={transactionDate}
                            onChange={e => setTransactionDate(e.target.value)}
                            className={inputClass()}
                            disabled={headerSaved}
                        />
                    </Field>
                    {!headerSaved && (
                        <div className="sm:col-span-2">
                            <Field label="Catatan" hint="(opsional)">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Contoh: bayar akhir bulan"
                                    className={`${inputClass()} h-auto py-2 resize-y`}
                                />
                            </Field>
                        </div>
                    )}
                </div>

                {headerSaved && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Icon name="info" className="w-4 h-4 text-gray-400 shrink-0" />
                            Pelanggan & tanggal terkunci setelah bon dibuat.
                        </div>
                        <StatusBadge status={paymentStatus} />
                    </div>
                )}

                {!headerSaved && (
                    <div className="mt-4">
                        <Button onClick={saveHeader} loading={loading} loadingText="Menyimpan...">
                            Lanjut ke Input Item
                        </Button>
                    </div>
                )}
            </Card>

            {headerSaved && (
                <>
                    {/* 2. Tambah item */}
                    <Card className={`p-4 md:p-5 mb-6 ${editingItemId ? 'ring-2 ring-brand-100' : ''}`}>
                        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name={editingItemId ? 'edit' : 'plus'} className="w-4 h-4 text-brand-600" />
                            {editingItemId ? 'Edit Item' : 'Tambah Catatan Item'}
                        </h2>
                        <form onSubmit={addItem} className="grid grid-cols-12 gap-3">
                            <div className="col-span-12 sm:col-span-6">
                                <Field label="Item">
                                    {isManualItem ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formManualName}
                                                onChange={e => setFormManualName(e.target.value)}
                                                placeholder="Nama item"
                                                className={inputClass()}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setIsManualItem(false); setFormManualName(''); }}
                                                aria-label="Batal input manual"
                                                className="w-10 h-10 shrink-0 inline-flex items-center justify-center border border-gray-300 rounded-[10px] text-gray-500 hover:bg-gray-50 transition-colors"
                                            >
                                                <Icon name="x" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Select
                                            ref={itemSelectRef}
                                            options={productOptions}
                                            value={formItem ? { value: formItem.id, label: formItem.name } : null}
                                            onChange={(opt) => {
                                                if (!opt) {
                                                    setFormItem(null);
                                                } else if (opt.value === 'MANUAL') {
                                                    setIsManualItem(true);
                                                    setFormItem(null);
                                                    setFormPrice('');
                                                } else {
                                                    setFormItem(opt.product);
                                                    setFormPrice(opt.product.default_price.toString());
                                                    setTimeout(() => qtyInputRef.current?.focus(), 50);
                                                }
                                            }}
                                            placeholder="Cari item..."
                                            styles={reactSelectStyles}
                                        />
                                    )}
                                </Field>
                            </div>
                            <div className="col-span-12 sm:col-span-6">
                                <Field label="Keterangan" hint="(opsional)">
                                    <input
                                        type="text"
                                        value={formDescription}
                                        onChange={e => setFormDescription(e.target.value)}
                                        placeholder="Contoh: Tegar"
                                        className={inputClass()}
                                    />
                                </Field>
                            </div>
                            <div className="col-span-4 sm:col-span-3">
                                <Field label="Qty">
                                    <input
                                        type="number"
                                        ref={qtyInputRef}
                                        value={formQty}
                                        onChange={e => setFormQty(e.target.value)}
                                        min="1"
                                        className={`${inputClass()} text-right tnum`}
                                    />
                                </Field>
                            </div>
                            <div className="col-span-8 sm:col-span-6">
                                <Field label="Harga" hint="(minus = potongan)">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatPriceDisplay(formPrice)}
                                        onChange={handlePriceChange}
                                        className={`${inputClass()} text-right tnum`}
                                    />
                                </Field>
                            </div>
                            <div className="col-span-12 sm:col-span-3 flex flex-col justify-end">
                                <p className="text-xs text-gray-500 mb-1.5">Subtotal</p>
                                <p className="h-10 flex items-center justify-end text-sm font-bold text-gray-900 tnum">{formatRupiah(formSubtotal)}</p>
                            </div>
                            <div className="col-span-12 flex gap-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={addingItem}
                                    loadingText="Menyimpan..."
                                    icon={editingItemId ? 'check' : 'plus'}
                                    className="flex-1 sm:flex-none sm:px-6"
                                >
                                    {editingItemId ? 'Update Item' : 'Tambah Item'}
                                </Button>
                                {editingItemId && (
                                    <Button variant="ghost" onClick={resetItemForm}>Batal Edit</Button>
                                )}
                            </div>
                        </form>
                    </Card>

                    {/* 3. Daftar item */}
                    <Card className="mb-6 overflow-hidden">
                        <div className="px-4 md:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900">Daftar Catatan</h2>
                            <span className="text-xs text-gray-400 tnum">{items.length} item</span>
                        </div>

                        {items.length === 0 ? (
                            <p className="py-10 px-6 text-center text-sm text-gray-400">
                                Belum ada item. Tambahkan lewat form di atas.
                            </p>
                        ) : (
                            <>
                                {/* Desktop */}
                                <table className="hidden md:w-full text-sm md:block">
                                    <thead>
                                        <tr className="border-b border-border text-left">
                                            <th className="px-5 py-2.5 text-[11.5px] font-medium text-text-muted w-2/5">Item</th>
                                            <th className="px-3 py-2.5 text-[11.5px] font-medium text-text-muted">Ket.</th>
                                            <th className="px-3 py-2.5 text-[11.5px] font-medium text-text-muted text-right">Qty</th>
                                            <th className="px-3 py-2.5 text-[11.5px] font-medium text-text-muted text-right">Harga</th>
                                            <th className="px-3 py-2.5 text-[11.5px] font-medium text-text-muted text-right">Total</th>
                                            <th className="px-5 py-2.5 w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {items.map((item) => (
                                            <tr key={item.id} className={`group transition-colors ${editingItemId === item.id ? 'bg-brand-50/60' : 'hover:bg-gray-50'}`}>
                                                <td className="px-5 py-3 font-medium text-gray-900">{item.product_name}</td>
                                                <td className="px-3 py-3 text-gray-500">{item.description || '-'}</td>
                                                <td className="px-3 py-3 text-right text-gray-700 tnum">{item.quantity}</td>
                                                <td className="px-3 py-3 text-right text-gray-600 tnum">{formatRupiah(item.unit_price)}</td>
                                                <td className="px-3 py-3 text-right font-semibold text-gray-900 tnum">{formatRupiah(item.subtotal)}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex justify-end gap-0.5 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditItem(item)}
                                                            aria-label={`Edit item ${item.product_name}`}
                                                            className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition-colors ${editingItemId === item.id ? 'bg-brand-100 text-brand-700' : 'text-text-muted hover:bg-brand-50 hover:text-brand-600'}`}
                                                        >
                                                            <Icon name="edit" className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingItem(item)}
                                                            aria-label={`Hapus item ${item.product_name}`}
                                                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-danger-soft hover:text-danger transition-colors"
                                                        >
                                                            <Icon name="trash" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Mobile */}
                                <ul className="md:hidden divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <li key={item.id} className={`p-4 ${editingItemId === item.id ? 'bg-brand-50/60' : ''}`}>
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                                                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                                                    <p className="text-xs text-gray-500 mt-1 tnum">{item.quantity} × {formatRupiah(item.unit_price)}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-gray-900 tnum">{formatRupiah(item.subtotal)}</p>
                                                    <div className="flex gap-1 justify-end mt-1.5">
                                                        <button
                                                            onClick={() => handleEditItem(item)}
                                                            aria-label={`Edit item ${item.product_name}`}
                                                            className={`w-8 h-8 inline-flex items-center justify-center rounded-lg ${editingItemId === item.id ? 'bg-brand-100 text-brand-700' : 'text-text-muted hover:bg-brand-50 hover:text-brand-600'}`}
                                                        >
                                                            <Icon name="edit" className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingItem(item)}
                                                            aria-label={`Hapus item ${item.product_name}`}
                                                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-danger-soft hover:text-danger"
                                                        >
                                                            <Icon name="trash" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {/* Total — selalu terlihat */}
                        <div className="border-t border-gray-100 bg-gray-50/60 px-4 md:px-5 py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Total</span>
                                <span className={`text-2xl font-bold tnum ${Number(totalAmount) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatRupiah(totalAmount)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* 4. Status pembayaran & catatan */}
                    <Card className="p-4 md:p-5 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Status Pembayaran</p>
                                <p className={`text-xs mt-0.5 flex items-center gap-1 ${paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                    <Icon name={paymentStatus === 'paid' ? 'checkCircle' : 'alert'} className="w-3.5 h-3.5" />
                                    {paymentStatus === 'paid' ? 'Transaksi ini sudah lunas' : 'Masih ada hutang yang belum dibayar'}
                                </p>
                            </div>
                            <div className="flex gap-2" role="group" aria-label="Status pembayaran">
                                <button
                                    type="button"
                                    onClick={() => updatePaymentStatus('paid')}
                                    aria-pressed={paymentStatus === 'paid'}
                                    className={`h-10 px-4 inline-flex items-center gap-1.5 text-sm font-semibold rounded-[10px] border transition-colors ${
                                        paymentStatus === 'paid'
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'bg-white text-gray-500 border-gray-300 hover:border-green-400 hover:text-green-600'
                                    }`}
                                >
                                    <Icon name="check" className="w-4 h-4" />
                                    Sudah Dibayar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updatePaymentStatus('unpaid')}
                                    aria-pressed={paymentStatus === 'unpaid'}
                                    className={`h-10 px-4 inline-flex items-center gap-1.5 text-sm font-semibold rounded-[10px] border transition-colors ${
                                        paymentStatus === 'unpaid'
                                            ? 'bg-amber-500 text-white border-amber-500'
                                            : 'bg-white text-gray-500 border-gray-300 hover:border-amber-400 hover:text-amber-600'
                                    }`}
                                >
                                    <Icon name="clock" className="w-4 h-4" />
                                    Berhutang
                                </button>
                            </div>
                        </div>
                        <Field label="Catatan" hint="(opsional)" className="mt-4">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Contoh: bayar akhir bulan"
                                className={`${inputClass()} h-auto py-2 resize-y`}
                            />
                        </Field>
                        <div className="mt-3">
                            <Button variant="soft" size="sm" onClick={saveHeader} loading={loading} loadingText="Menyimpan..." icon="check">
                                Simpan Perubahan Header
                            </Button>
                        </div>
                    </Card>

                    {/* 5. Finalize — sticky agar total & aksi tidak hilang di bawah (mobile) */}
                    <div className="sticky bottom-[70px] md:bottom-4 z-10">
                        <Card className="p-3 md:p-4 flex items-center justify-between gap-3 shadow-[0_-2px_14px_rgb(20_23_28/0.07)]">
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Total bon</p>
                                <p className={`text-lg font-bold tnum truncate ${Number(totalAmount) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatRupiah(totalAmount)}</p>
                            </div>
                            <Button size="lg" onClick={finalizeBon} disabled={items.length === 0} loading={loading} loadingText="Menyimpan..." icon="checkCircle">
                                Simpan Bon
                            </Button>
                        </Card>
                    </div>

                    <ConfirmDialog
                        open={!!deletingItem}
                        onClose={() => setDeletingItem(null)}
                        onConfirm={() => removeItem(deletingItem.id)}
                        title="Hapus item ini?"
                        message={deletingItem ? `"${deletingItem.product_name}" akan dihapus dari bon.` : ''}
                        confirmText="Hapus"
                    />
                </>
            )}
        </div>
    );
}
