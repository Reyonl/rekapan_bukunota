import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/client';
import { formatRupiah, formatNumber, formatDateShort } from '../../utils/format';

const THERMAL_SIZES = {
    '58mm': { width: '58mm', chars: 32 },
    '80mm': { width: '80mm', chars: 48 },
};

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [thermalSize, setThermalSize] = useState(
        localStorage.getItem('thermalSize') || '80mm'
    );

    useEffect(() => {
        api.get(`/transactions/${id}`)
            .then(r => {
                setTransaction(r.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Bon tidak ditemukan.');
                setLoading(false);
            });
    }, [id]);

    const handlePrint = () => window.print();

    const handleRawBT = () => {
        const pre = document.querySelector('.no-print pre');
        if (!pre) return;
        const encoded = encodeURIComponent(pre.innerText);
        window.location.href = `intent:${encoded}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
    };

    const handleWebBT = async () => {
        if (!navigator.bluetooth) {
            alert("Fitur Bluetooth tidak tersedia di browser ini!");
            return;
        }

        try {
            let device = null;
            const savedPrinterName = localStorage.getItem('savedPrinterName') || 'RPP02N';

            // 1. Coba cari di history device yang sudah pernah diizinkan (Otomatis tanpa pop-up)
            if (navigator.bluetooth.getDevices) {
                const devices = await navigator.bluetooth.getDevices();
                device = devices.find(d => d.name === savedPrinterName || (d.name && d.name.includes('RPP')));
            }

            // 2. Jika tidak ada di history, paksa munculkan pop-up
            if (!device) {
                device = await navigator.bluetooth.requestDevice({
                    filters: [{ name: savedPrinterName }],
                    optionalServices: [
                        '000018f0-0000-1000-8000-00805f9b34fb',
                        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                        '49535343-fe7d-4ae5-8fa9-9fafd205e455'
                    ]
                }).catch(e => {
                    // Fallback jika nama tidak persis RPP02N
                    return navigator.bluetooth.requestDevice({
                        acceptAllDevices: true,
                        optionalServices: [
                            '000018f0-0000-1000-8000-00805f9b34fb',
                            'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                            '49535343-fe7d-4ae5-8fa9-9fafd205e455'
                        ]
                    });
                });
                
                if (device && device.name) {
                    localStorage.setItem('savedPrinterName', device.name);
                }
            }

            if (!device) return;

            const server = await device.gatt.connect();
            const services = await server.getPrimaryServices();
            
            let printCharacteristic = null;
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        printCharacteristic = char;
                        break;
                    }
                }
                if (printCharacteristic) break;
            }

            if (!printCharacteristic) {
                throw new Error("Tidak menemukan akses cetak di perangkat ini.");
            }

            const pre = document.querySelector('.no-print pre');
            let textLines = pre ? pre.innerText.split('\n') : [];
            
            let printData = '\x1B\x40'; // Initialize
            
            if (textLines.length > 0) {
                 // Judul toko dibuat besar (Double Height + Double Width) & Center
                 printData += '\x1B\x61\x01'; 
                 printData += '\x1B\x21\x30'; 
                 printData += textLines[0].trim() + '\n';
                 
                 // Kembalikan ke kiri
                 printData += '\x1B\x61\x00'; 
                 // Isi struk dibuat Double Height agar lebih besar tapi tetap muat 32 karakter
                 printData += '\x1B\x21\x10'; 
                 
                 for (let i = 1; i < textLines.length; i++) {
                     printData += textLines[i] + '\n';
                 }
            }
            
            printData += '\n\n\n'; 
            
            const encoder = new TextEncoder();
            const data = encoder.encode(printData);

            const CHUNK_SIZE = 100;
            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                const chunk = data.slice(i, i + CHUNK_SIZE);
                await printCharacteristic.writeValue(chunk);
                await new Promise(r => setTimeout(r, 20));
            }

            device.gatt.disconnect();

        } catch (error) {
            console.error(error);
            if (error.name === 'NotFoundError') return; 
            alert("Error Web Bluetooth: " + error.message);
        }
    };
    const handleCopy = () => {
        const pre = document.querySelector('.no-print pre');
        if (!pre) return;
        const textArea = document.createElement("textarea");
        textArea.value = pre.innerText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Teks struk berhasil disalin! Buka aplikasi Printer Bluetooth Anda lalu paste.');
        } catch (err) {
            alert('Gagal menyalin teks.');
        }
        document.body.removeChild(textArea);
    };

    const handleSizeChange = (size) => {
        setThermalSize(size);
        localStorage.setItem('thermalSize', size);
    };

    if (loading) {
        return <div className="p-4 text-sm text-gray-500">Memuat detail bon...</div>;
    }

    if (error || !transaction) {
        return (
            <div className="p-4">
                <div className="text-red-600 text-sm mb-4">{error}</div>
                <Link to="/bon" className="text-gray-600 hover:text-gray-900 text-sm font-medium">← Kembali ke Riwayat</Link>
            </div>
        );
    }

    const sizeConfig = THERMAL_SIZES[thermalSize];

    return (
        <div className="max-w-2xl print:max-w-none print:m-0 print:p-0">
            <style>
                {`
                    @media print {
                        @page {
                            margin: 0;
                            size: ${sizeConfig.width} auto;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                    }
                `}
            </style>

            <div className="no-print mb-8">
                <Link to="/bon" className="text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 inline-block">← Kembali</Link>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Preview Bon</h1>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex border border-gray-200 rounded overflow-hidden">
                            {Object.keys(THERMAL_SIZES).map(size => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                        thermalSize === size
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        <Link
                            to={`/bon/${id}/edit`}
                            className="px-4 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleWebBT}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                        >
                            Web Bluetooth
                        </button>
                        <button
                            onClick={handleCopy}
                            className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm font-medium hover:bg-gray-600"
                        >
                            Copy
                        </button>
                        <button
                            onClick={handleRawBT}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                        >
                            RawBT
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 bg-brand-600 text-white rounded text-sm font-medium hover:bg-brand-700"
                        >
                            Cetak
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Container */}
            <div className="no-print bg-white border border-gray-200 rounded-lg p-4 md:p-8 md:flex md:justify-center mb-8 overflow-x-auto shadow-sm">
                <ThermalReceipt transaction={transaction} size={thermalSize} preview={true} />
            </div>

            {/* Print Only Container */}
            <div className="print-only">
                <ThermalReceipt transaction={transaction} size={thermalSize} preview={false} />
            </div>
        </div>
    );
}

function ThermalReceipt({ transaction, size, preview }) {
    const { customer, items = [], transaction_date, total_amount, notes } = transaction;
    const sizeConfig = THERMAL_SIZES[size];

    const wrapperStyle = preview
        ? {
            width: 'max-content',
            minWidth: sizeConfig.width,
            fontFamily: "monospace",
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            padding: '16px',
            margin: '0 auto'
        }
        : {
            width: '100%',
            fontFamily: "monospace",
            fontSize: '12px',
            padding: '4mm',
            margin: '0 auto',
        };

    const maxChars = sizeConfig.chars;
    const line = '-'.repeat(maxChars);

    const formatItemLine = (name, qty, total) => {
        const totalStr = formatNumber(total);
        const nameAndQty = name + ' x' + qty;
        
        let finalNameAndQty = nameAndQty;
        const availableForName = maxChars - totalStr.length - 1;
        
        if (nameAndQty.length > availableForName) {
            const allowedNameLen = availableForName - (String(qty).length + 3);
            finalNameAndQty = name.substring(0, allowedNameLen) + '.. x' + qty;
        }

        const padding = maxChars - finalNameAndQty.length - totalStr.length;
        return finalNameAndQty + ' '.repeat(Math.max(1, padding)) + totalStr;
    };
    const centerText = (text) => {
        const spaces = Math.max(0, Math.floor((maxChars - text.length) / 2));
        return ' '.repeat(spaces) + text;
    };

    const rightAlign = (label, value) => {
        const available = maxChars - label.length;
        const valueStr = String(value);
        const padding = available - valueStr.length;
        return label + ' '.repeat(Math.max(1, padding)) + valueStr;
    };

    const formattedDate = transaction_date
        ? formatDateShort(transaction_date.includes('T') ? transaction_date : transaction_date + 'T00:00:00')
        : '';

    return (
        <div style={wrapperStyle}>
            <pre className={preview ? "text-[10px] sm:text-xs" : ""} style={{ margin: 0, whiteSpace: 'pre', lineHeight: '1.4' }}>
{[
    centerText('WARUNG LUPI'),
    line,
    `Plg: ${customer?.name || '-'}`,
    `Tgl: ${formattedDate}`,
    line,
    ...items.map(item => {
        const name = item.description
            ? `${item.product_name} - ${item.description}`
            : item.product_name;
        return formatItemLine(name, item.quantity, item.subtotal);
    }),
    line,
    rightAlign('TOTAL', formatNumber(total_amount)),
    notes ? `\nCatatan: ${notes}` : null,
    ``,
    centerText('Ke pasar membeli semangka,'),
    centerText('Jangan lupa mampir ke Lupi.'),
    centerText('Terima kasih sudah belanja,'),
    centerText('Semoga puas di hati.')
].filter(v => v !== null).join('\n')}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '8px' }}>
                <QRCodeSVG value="00020101021126610014COM.GO-JEK.WWW01189360091431908993800210G1908993800303UMI51440014ID.CO.QRIS.WWW0215ID10253695702010303UMI5204549953033605802ID5923WARUNG LUPI, Pagedangan6009TANGERANG61051533062070703A0163044C4B" size={140} />
            </div>
        </div>
    );
}

export { ThermalReceipt };




