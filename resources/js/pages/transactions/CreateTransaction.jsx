import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Select from 'react-select';
import api from '../../api/client';
import { formatRupiah, today } from '../../utils/format';

export default function CreateTransaction() {
    const { id } = useParams();
    const navigate = useNavigate();

    // -- State: Header
    const [transactionId, setTransactionId] = useState(id || null);
    const [transactionNumber, setTransactionNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [transactionDate, setTransactionDate] = useState(today());
    const [notes, setNotes] = useState('');
    const [headerSaved, setHeaderSaved] = useState(false);

    // -- State: Data
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // -- State: UI & Form
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form Item
    const [formItem, setFormItem] = useState(null); // Selected product object
    const [formDescription, setFormDescription] = useState('');
    const [formQty, setFormQty] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formSubtotal, setFormSubtotal] = useState('');
    const [formManualName, setFormManualName] = useState('');
    const [isManualItem, setIsManualItem] = useState(false);
    
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
                    notes
                });
                setTransactionId(r.data.id);
                setTransactionNumber(r.data.transaction_number);
                setHeaderSaved(true);
                navigate(`/bon/${r.data.id}/edit`, { replace: true });
            } else {
                await api.put(`/transactions/${transactionId}`, {
                    customer_id: Number(customerId),
                    transaction_date: transactionDate,
                    notes
                });
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Gagal menyimpan bon.');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        const qty = Number(formQty);
        const price = Number(formPrice);
        const sub = Number(formSubtotal);
        const name = isManualItem ? formManualName : formItem?.name;
        
        if (!name || qty <= 0 || price < 0) {
            setError('Item, Qty, dan Harga harus valid.');
            return;
        }
        
        setError('');
        try {
            await api.post(`/transactions/${transactionId}/items`, {
                product_id: isManualItem ? null : formItem.id,
                product_name: name,
                description: formDescription,
                quantity: qty,
                unit_price: price,
                subtotal: sub
            });
            
            // Refresh transaction to get updated items & total
            const r = await api.get(`/transactions/${transactionId}`);
            setItems(r.data.items);
            setTotalAmount(r.data.total_amount);
            
            // Reset form
            setFormItem(null);
            setFormManualName('');
            setFormDescription('');
            setFormQty('');
            setFormPrice('');
            setFormSubtotal('');
            
            if (itemSelectRef.current) itemSelectRef.current.focus();
        } catch (e) {
            setError('Gagal menambah item.');
        }
    };

    const removeItem = async (itemId) => {
        try {
            await api.delete(`/transaction-items/${itemId}`);
            const r = await api.get(`/transactions/${transactionId}`);
            setItems(r.data.items);
            setTotalAmount(r.data.total_amount);
        } catch (e) {
            setError('Gagal menghapus item.');
        }
    };

    const finalizeBon = async () => {
        if (!transactionId) return;
        try {
            await api.put(`/transactions/${transactionId}`, {
                status: 'completed'
            });
            navigate(`/bon/${transactionId}`);
        } catch (e) {
            setError('Gagal menyelesaikan bon.');
        }
    };

    // React-Select options mapping
    const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
    const productOptions = [
        { value: 'MANUAL', label: '+ Input Manual / Item Lain' },
        ...products.map(p => ({ value: p.id, label: p.name, product: p }))
    ];

    if (loading && !customers.length) {
        return <div className="p-4 text-sm text-gray-500">Memuat...</div>;
    }

    return (
        <div className="max-w-3xl pb-24">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{id ? 'Edit Bon' : 'Buat Bon'}</h1>
            
            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded">
                    {error}
                </div>
            )}

            {/* 1. Header Section */}
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Pelanggan</label>
                        <Select
                            options={customerOptions}
                            value={customerOptions.find(o => o.value.toString() === customerId.toString()) || null}
                            onChange={(opt) => {
                                setCustomerId(opt ? opt.value : '');
                                if (headerSaved) {
                                    // if already saved, update immediately when changed is optional, but let's require explicit save or just auto save.
                                    // for safety we don't auto save customer change unless they click save header.
                                }
                            }}
                            placeholder="Cari pelanggan..."
                            className="text-sm"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#E5E5E5',
                                    borderRadius: '0.375rem',
                                    minHeight: '40px'
                                })
                            }}
                            isDisabled={headerSaved}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Tanggal</label>
                        <input
                            type="date"
                            value={transactionDate}
                            onChange={e => setTransactionDate(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                            disabled={headerSaved}
                        />
                    </div>
                </div>
                {!headerSaved && (
                    <div className="mt-4">
                        <button
                            onClick={saveHeader}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
                        >
                            Mulai Input Catatan
                        </button>
                    </div>
                )}
            </div>

            {headerSaved && (
                <>
                    <hr className="border-t border-gray-200 mb-8" />
                    
                    {/* 2. Form Input */}
                    <div className="mb-10">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Tambah Catatan</h2>
                        <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                            <div className="sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">Item</label>
                                {isManualItem ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formManualName}
                                            onChange={e => setFormManualName(e.target.value)}
                                            placeholder="Nama item"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsManualItem(false);
                                                setFormManualName('');
                                            }}
                                            className="px-2 py-2 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 text-sm"
                                        >
                                            ✕
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
                                        className="text-sm"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#E5E5E5',
                                                borderRadius: '0.375rem',
                                                minHeight: '40px'
                                            })
                                        }}
                                    />
                                )}
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">Keterangan <span className="text-gray-400 font-normal">(opsional)</span></label>
                                <input
                                    type="text"
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    placeholder="Contoh: Tegar"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">Qty</label>
                                <input
                                    type="number"
                                    ref={qtyInputRef}
                                    value={formQty}
                                    onChange={e => setFormQty(e.target.value)}
                                    min="1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none text-right"
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">Harga</label>
                                <input
                                    type="number"
                                    value={formPrice}
                                    onChange={e => setFormPrice(e.target.value)}
                                    min="0"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none text-right"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded hover:bg-gray-200 border border-gray-200"
                                >
                                    + Tambah
                                </button>
                            </div>
                        </form>
                    </div>

                    <hr className="border-t border-gray-200 mb-8" />

                    {/* 3. Daftar Catatan */}
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Daftar Catatan</h2>
                        
                        {/* Desktop view */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-2 pr-4 text-left font-medium text-gray-500 w-1/3">Item</th>
                                        <th className="py-2 px-4 text-left font-medium text-gray-500">Ket.</th>
                                        <th className="py-2 px-4 text-right font-medium text-gray-500">Qty</th>
                                        <th className="py-2 px-4 text-right font-medium text-gray-500">Harga</th>
                                        <th className="py-2 pl-4 pr-8 text-right font-medium text-gray-500">Total</th>
                                        <th className="py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-400">
                                                Belum ada item ditambahkan.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, idx) => (
                                            <tr key={item.id} className="border-b border-gray-100 group">
                                                <td className="py-3 pr-4 text-gray-900">
                                                    {item.product_name}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {item.description || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-600">
                                                    {formatRupiah(item.unit_price)}
                                                </td>
                                                <td className="py-3 pl-4 pr-8 text-right font-medium text-gray-900">
                                                    {formatRupiah(item.subtotal)}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                                        aria-label="Hapus item"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view */}
                        <div className="md:hidden divide-y divide-gray-100 border-t border-gray-200">
                            {items.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm">
                                    Belum ada item ditambahkan.
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="py-3 flex justify-between items-center group">
                                        <div className="flex-1 pr-4">
                                            <div className="font-medium text-gray-900">{item.product_name}</div>
                                            {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                                            <div className="text-xs text-gray-600 mt-1">
                                                {item.quantity} x {formatRupiah(item.unit_price)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900">{formatRupiah(item.subtotal)}</div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-xs text-gray-400 hover:text-red-600 mt-1"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 4. Total */}
                    <div className="flex items-center justify-between py-4 mb-8">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-bold text-gray-900">{formatRupiah(totalAmount)}</span>
                    </div>

                    {/* 5. Action */}
                    <div className="pt-4">
                        <button
                            onClick={finalizeBon}
                            disabled={items.length === 0}
                            className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Simpan Bon
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
