import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import api from '../../api/client';
import { formatRupiah, formatNumber, formatDateShort } from '../../utils/format';
import { globalActiveDevice, setGlobalActiveDevice, getSavedPrinterName, getSavedPrinterId } from '../../utils/printer';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/States';
import { toast } from '../../stores/toastStore';

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

    // Print states
    const [thermalSize, setThermalSize] = useState(localStorage.getItem('thermalSize') || '58mm');
    const [isPrinting, setIsPrinting] = useState(false);
    const [printError, setPrintError] = useState('');

    const savedPrinter = getSavedPrinterName();

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

    // Generator raw text untuk Copy dan RawBT
    const generateRawText = () => {
        if (!transaction) return '';
        const maxChars = THERMAL_SIZES[thermalSize].chars;
        const lineDash = '-'.repeat(maxChars);

        const wrapText = (text) => {
            const lines = [];
            let currentLine = '';
            const words = String(text).split(' ');
            for (const word of words) {
                if ((currentLine + word).length > maxChars) {
                    if (currentLine) lines.push(currentLine.trim());
                    currentLine = word + ' ';
                } else {
                    currentLine += word + ' ';
                }
            }
            if (currentLine) lines.push(currentLine.trim());
            return lines;
        };

        const centerText = (text) => {
            const spaces = Math.max(0, Math.floor((maxChars - text.length) / 2));
            return ' '.repeat(spaces) + text;
        };

        const rightAlign = (label, value) => {
            const available = maxChars - label.length;
            const padding = Math.max(1, available - value.length);
            return label + ' '.repeat(padding) + value;
        };

        let text = [];
        text.push(centerText('WARUNG LUPI'));
        text.push(centerText('Ke pasar membeli semangka'));
        text.push(centerText('Jangan lupa mampir ke Lupi'));
        text.push(lineDash);

        const dateStr = transaction.transaction_date ? formatDateShort(transaction.transaction_date.includes('T') ? transaction.transaction_date : transaction.transaction_date + 'T00:00:00') : '';
        text.push(`No   : ${transaction.transaction_number || '-'}`);
        text.push(`Tgl  : ${dateStr}`);
        text.push(`Plg  : ${transaction.customer?.name || 'Umum'}`);
        text.push(lineDash);

        (transaction.items || []).forEach(item => {
            const name = item.description ? `${item.product_name} - ${item.description}` : item.product_name;
            const nameLines = wrapText(name);
            text.push(...nameLines);

            const leftStr = `${item.quantity} x ${formatNumber(item.unit_price)}`;
            const rightStr = formatNumber(item.subtotal);
            text.push(rightAlign(leftStr, rightStr));
        });

        text.push(lineDash);
        text.push(rightAlign('TOTAL', formatNumber(transaction.total_amount)));

        if (transaction.notes) {
            text.push(`\nCatatan: ${transaction.notes}`);
        }
        text.push('');
        text.push(centerText('Terima kasih sudah belanja'));
        text.push(centerText('Semoga puas di hati'));

        return text.join('\n');
    };

    // Cetak ke Printer Bluetooth
    const handleCetak = async () => {
        setPrintError('');

        if (!navigator.bluetooth) {
            setPrintError("Browser tidak mendukung pencetakan langsung ke printer Bluetooth. Gunakan opsi Export PDF.");
            return;
        }

        if (!savedPrinter) {
            setPrintError("Printer belum dikonfigurasi. Silakan buka menu Pengaturan → Printer Thermal terlebih dahulu.");
            return;
        }

        setIsPrinting(true);

        try {
            let device = globalActiveDevice;

            if (!device && navigator.bluetooth.getDevices) {
                const devices = await navigator.bluetooth.getDevices();
                const savedId = getSavedPrinterId();
                device = devices.find(d => (savedId && d.id === savedId) || (savedPrinter && d.name === savedPrinter));
                if (device) setGlobalActiveDevice(device);
            }

            if (!device) {
                throw new Error("Koneksi ke printer terputus atau browser mencabut izin akses. Buka menu Pengaturan → Printer Thermal untuk menghubungkan kembali.");
            }

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

            const encoder = new TextEncoder();
            let buffer = [];

            const addText = (str) => buffer.push(...encoder.encode(str));
            const addBytes = (arr) => buffer.push(...arr);

            const maxChars = THERMAL_SIZES[thermalSize].chars;
            const lineDash = '-'.repeat(maxChars) + '\n';

            const wrapText = (text) => {
                const lines = [];
                let currentLine = '';
                const words = String(text).split(' ');
                for (const word of words) {
                    if ((currentLine + word).length > maxChars) {
                        if (currentLine) lines.push(currentLine.trim());
                        currentLine = word + ' ';
                    } else {
                        currentLine += word + ' ';
                    }
                }
                if (currentLine) lines.push(currentLine.trim());
                return lines;
            };

            const rightAlign = (label, value) => {
                const available = maxChars - label.length;
                const padding = Math.max(1, available - value.length);
                return label + ' '.repeat(padding) + value;
            };

            const boldOn = () => {
                addBytes([0x1B, 0x45, 1]); // Emphasized
                addBytes([0x1B, 0x47, 1]); // Double-strike
            };
            const boldOff = () => {
                addBytes([0x1B, 0x45, 0]);
                addBytes([0x1B, 0x47, 0]);
            };

            addBytes([0x1B, 0x40]); // Initialize
            addBytes([0x1B, 0x4D, 0x00]); // Force Font A (Standard 32/48 chars)

            // Header
            addBytes([0x1B, 0x61, 0x01]); // Center
            addBytes([0x1B, 0x21, 0x30]); // Big font (Double width & height)
            boldOn();
            addText('WARUNG LUPI\n');
            boldOff();
            addBytes([0x1B, 0x21, 0x00]); // Normal size
            addText('Ke pasar membeli semangka\n');
            addText('Jangan lupa mampir ke Lupi\n');

            // Info
            addBytes([0x1B, 0x61, 0x00]); // Left
            addText(lineDash);
            const dateStr = transaction.transaction_date ? formatDateShort(transaction.transaction_date.includes('T') ? transaction.transaction_date : transaction.transaction_date + 'T00:00:00') : '';

            addText(rightAlign('No.', transaction.transaction_number || '-') + '\n');
            addText(rightAlign('Tanggal', dateStr) + '\n');
            addText(rightAlign('Pelanggan', transaction.customer?.name || 'Umum') + '\n');
            addText(lineDash);

            // Items
            (transaction.items || []).forEach(item => {
                const name = item.description ? `${item.product_name} - ${item.description}` : item.product_name;
                boldOn();
                const nameLines = wrapText(name);
                nameLines.forEach(l => addText(l + '\n'));
                boldOff();

                const leftStr = `${item.quantity} x ${formatNumber(item.unit_price)}`;
                const rightStr = formatNumber(item.subtotal);
                addText(rightAlign(leftStr, rightStr) + '\n');
            });

            addText(lineDash);

            // Total
            boldOn();
            addBytes([0x1B, 0x21, 0x10]); // Double height only
            addText(rightAlign('TOTAL', formatNumber(transaction.total_amount)) + '\n');
            addBytes([0x1B, 0x21, 0x00]); // Normal size
            boldOff();

            if (transaction.notes) {
                addText(`\nCatatan: ${transaction.notes}\n`);
            }
            addText('\n');

            // QR Code QRIS
            const qrisData = "00020101021126610014COM.GO-JEK.WWW01189360091431908993800210G1908993800303UMI51440014ID.CO.QRIS.WWW0215ID10253695702010303UMI5204549953033605802ID5923WARUNG LUPI, Pagedangan6009TANGERANG61051533062070703A0163044C4B";
            const qrisBytes = encoder.encode(qrisData);
            const pL = (qrisBytes.length + 3) % 256;
            const pH = Math.floor((qrisBytes.length + 3) / 256);

            addBytes([0x1B, 0x61, 0x01]); // Center align for QR
            addBytes([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]); // Model 2
            addBytes([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x05]); // Size 5
            addBytes([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]); // Error Correction M
            addBytes([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]); // Store Data
            addBytes(Array.from(qrisBytes));
            addBytes([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]); // Print QR

            addText('\n');
            addBytes([0x1B, 0x61, 0x01]); // Center
            addText('Terima kasih sudah belanja\n');
            addText('Semoga puas di hati\n\n\n');

            const data = new Uint8Array(buffer);
            const CHUNK_SIZE = 100;
            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                const chunk = data.slice(i, i + CHUNK_SIZE);
                await printCharacteristic.writeValue(chunk);
                await new Promise(r => setTimeout(r, 20));
            }

            device.gatt.disconnect();
            toast.success('Struk dikirim ke printer.');

        } catch (error) {
            console.error(error);
            setPrintError(`Printer bermasalah: ${error.message}`);
        } finally {
            setIsPrinting(false);
        }
    };

    const handleExportPDF = () => window.print();

    const handleRawBT = () => {
        const text = generateRawText();
        const encoded = encodeURIComponent(text);
        window.location.href = `intent:${encoded}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
    };

    const handleCopy = () => {
        const text = generateRawText();
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            toast.success('Teks struk disalin. Buka aplikasi printer Bluetooth lalu paste.');
        } catch (err) {
            toast.error('Gagal menyalin teks struk.');
        }
        document.body.removeChild(textArea);
    };

    const handleDownloadImage = async () => {
        const previewElement = document.querySelector('.thermal-receipt-preview');
        if (!previewElement) return;

        try {
            const canvas = await html2canvas(previewElement, {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            const image = canvas.toDataURL("image/png");

            const link = document.createElement('a');
            link.href = image;
            link.download = `Nota_${transaction?.transaction_number || 'WarungLupi'}.png`;
            link.click();
            toast.success('Gambar nota diunduh.');
        } catch (err) {
            toast.error('Gagal mengunduh gambar nota.');
            console.error(err);
        }
    };

    const handleSizeChange = (size) => {
        setThermalSize(size);
        localStorage.setItem('thermalSize', size);
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-[320px] w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="py-12 px-6 text-center">
                    <span className="inline-flex w-12 h-12 rounded-2xl bg-red-50 text-red-500 items-center justify-center mb-3">
                        <Icon name="alert" className="w-6 h-6" />
                    </span>
                    <p className="text-sm font-semibold text-gray-900">{error || 'Bon tidak ditemukan.'}</p>
                    <div className="mt-4">
                        <Link to="/bon"><Button variant="secondary" size="sm" icon="arrowLeft">Kembali ke Riwayat</Button></Link>
                    </div>
                </Card>
            </div>
        );
    }

    const sizeConfig = THERMAL_SIZES[thermalSize];
    const dateStr = transaction.transaction_date
        ? formatDateShort(transaction.transaction_date.includes('T') ? transaction.transaction_date : transaction.transaction_date + 'T00:00:00')
        : '';

    return (
        <div className="max-w-2xl mx-auto print:max-w-none print:m-0 print:p-0">
            <style>
                {`
                    @media print {
                        @page { margin: 0; size: ${sizeConfig.width} auto; }
                        body { margin: 0; padding: 0; background: white; }
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                    @media screen {
                        .print-only { display: none !important; }
                    }
                `}
            </style>

            <div className="no-print">
                <Link to="/bon" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium mb-4 transition-colors">
                    <Icon name="arrowLeft" className="w-4 h-4" /> Riwayat Bon
                </Link>

                {/* Header bon */}
                <Card className="p-4 md:p-5 mb-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                            <p className="font-mono text-xs text-gray-400">{transaction.transaction_number}</p>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5 truncate">
                                {transaction.customer?.name || 'Umum'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{dateStr} · {transaction.items?.length ?? 0} item</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Total</p>
                            <p className={`text-2xl font-bold tnum ${Number(transaction.total_amount) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatRupiah(transaction.total_amount)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link to={`/bon/${id}/edit`}>
                            <Button variant="secondary" size="sm" icon="edit">Edit Bon</Button>
                        </Link>
                        <Button variant="secondary" size="sm" onClick={handleExportPDF} icon="printer">Export PDF</Button>
                    </div>
                </Card>

                {printError && (
                    <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex flex-col gap-2" role="alert">
                        <span className="flex items-start gap-2">
                            <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{printError}</span>
                        </span>
                        {(!navigator.bluetooth || !savedPrinter || printError.includes("kedaluwarsa") || printError.includes("terputus")) && (
                            <Link to="/pengaturan" className="text-brand-700 font-semibold underline hover:text-brand-800 self-start ml-6">
                                Buka Pengaturan Printer →
                            </Link>
                        )}
                    </div>
                )}

                {/* Toolbar cetak */}
                <Card className="p-3 md:p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex border border-gray-200 rounded-[10px] overflow-hidden" role="group" aria-label="Ukuran struk">
                            {Object.keys(THERMAL_SIZES).map(size => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    aria-pressed={thermalSize === size}
                                    className={`h-10 px-3.5 text-xs font-semibold transition-colors ${
                                        thermalSize === size ? 'bg-ink text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1" />
                        <Button variant="secondary" size="sm" onClick={handleDownloadImage} icon="box">PNG</Button>
                        <Button variant="secondary" size="sm" onClick={handleCopy} icon="edit" className="hidden sm:inline-flex">Copy Teks</Button>
                        <Button variant="secondary" size="sm" onClick={handleRawBT} icon="bluetooth" className="hidden sm:inline-flex">RawBT</Button>
                        <Button
                            onClick={handleCetak}
                            loading={isPrinting}
                            loadingText="Mencetak..."
                            icon="printer"
                            className="flex-1 sm:flex-none sm:px-6"
                        >
                            Cetak
                        </Button>
                    </div>
                    {/* Opsi mobile: Copy & RawBT di baris kedua */}
                    <div className="sm:hidden flex gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={handleCopy} icon="edit" className="flex-1">Copy Teks</Button>
                        <Button variant="ghost" size="sm" onClick={handleRawBT} icon="bluetooth" className="flex-1">RawBT</Button>
                    </div>
                </Card>
            </div>

            {/* Preview Container */}
            <div className="no-print bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 flex justify-center mb-8 overflow-x-auto shadow-[0_1px_2px_rgb(16_19_24/0.05)]">
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
    const { customer, items = [], transaction_date, total_amount, notes, transaction_number } = transaction;

    const formattedDate = transaction_date
        ? formatDateShort(transaction_date.includes('T') ? transaction_date : transaction_date + 'T00:00:00')
        : '';

    const containerStyle = preview
        ? {
            width: size === '58mm' ? '300px' : '400px',
            fontFamily: "'Courier New', Courier, monospace",
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            padding: '24px',
            margin: '0 auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: '#000',
            lineHeight: '1.4'
        }
        : {
            width: size === '58mm' ? '58mm' : '80mm',
            fontFamily: "'Courier New', Courier, monospace",
            padding: '4mm',
            margin: '0',
            color: '#000',
            lineHeight: '1.4'
        };

    return (
        <div className={preview ? 'thermal-receipt-preview' : ''} style={containerStyle}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0, fontSize: preview ? '22px' : '18px', fontWeight: '900', letterSpacing: '1px' }}>WARUNG LUPI</h2>
                <div style={{ fontSize: preview ? '13px' : '11px', marginTop: '4px' }}>Ke pasar membeli semangka</div>
                <div style={{ fontSize: preview ? '13px' : '11px' }}>Jangan lupa mampir ke Lupi</div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

            {/* Info */}
            <div style={{ fontSize: preview ? '14px' : '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>No.</span>
                    <span>{transaction_number || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tanggal</span>
                    <span>{formattedDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pelanggan</span>
                    <span>{customer?.name || 'Umum'}</span>
                </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

            {/* Items */}
            <div style={{ fontSize: preview ? '14px' : '12px' }}>
                {items.map((item, idx) => {
                    const name = item.description ? `${item.product_name} - ${item.description}` : item.product_name;
                    return (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: 'bold' }}>{name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.quantity} x {formatNumber(item.unit_price)}</span>
                                <span>{formatNumber(item.subtotal)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: preview ? '18px' : '15px', fontWeight: '900', margin: '12px 0' }}>
                <span>TOTAL</span>
                <span>{formatNumber(total_amount)}</span>
            </div>

            {notes && (
                <div style={{ fontSize: preview ? '13px' : '11px', marginTop: '8px' }}>
                    <strong>Catatan:</strong> {notes}
                </div>
            )}

            {/* QR Code & Footer */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <QRCodeSVG value="00020101021126610014COM.GO-JEK.WWW01189360091431908993800210G1908993800303UMI51440014ID.CO.QRIS.WWW0215ID10253695702010303UMI5204549953033605802ID5923WARUNG LUPI, Pagedangan6009TANGERANG61051533062070703A0163044C4B" size={preview ? 140 : 100} />
                </div>
                <div style={{ fontSize: preview ? '13px' : '11px', marginTop: '12px', fontWeight: 'bold' }}>Terima kasih sudah belanja</div>
                <div style={{ fontSize: preview ? '13px' : '11px' }}>Semoga puas di hati</div>
            </div>
        </div>
    );
}

export { ThermalReceipt };
