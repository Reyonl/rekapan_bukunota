import React, { useState } from 'react';
import { globalActiveDevice, setGlobalActiveDevice, getSavedPrinterName } from '../../utils/printer';
import { Card, PageHeader, Badge } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { toast } from '../../stores/toastStore';

export default function PrintSettings() {
    const [size, setSize] = useState(localStorage.getItem('thermalSize') || '58mm');
    const [savedPrinter, setSavedPrinter] = useState(getSavedPrinterName());
    const [isTesting, setIsTesting] = useState(false);
    const [testError, setTestError] = useState('');
    const [testSuccess, setTestSuccess] = useState('');

    const handleSaveSize = (e) => {
        e.preventDefault();
        localStorage.setItem('thermalSize', size);
        toast.success('Pengaturan ukuran kertas berhasil disimpan.');
    };

    const handlePairPrinter = async () => {
        setTestError('');
        setTestSuccess('');
        if (!navigator.bluetooth) {
            toast.error('Fitur Bluetooth tidak didukung di browser ini.');
            return;
        }

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '000018f0-0000-1000-8000-00805f9b34fb',
                    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                    '49535343-fe7d-4ae5-8fa9-9fafd205e455'
                ]
            });
            if (device) {
                const pName = device.name || 'Printer Bluetooth';
                localStorage.setItem('savedPrinterName', pName);
                if (device.id) localStorage.setItem('savedPrinterId', device.id);
                setSavedPrinter(pName);
                setGlobalActiveDevice(device);

                device.addEventListener('gattserverdisconnected', () => {
                    console.log('Printer disconnected');
                });

                setTestSuccess(`Printer ${pName} berhasil disimpan sebagai Printer Utama!`);
            }
        } catch (e) {
            console.error(e);
            if (e.name !== 'NotFoundError') {
                setTestError(`Gagal melakukan pairing: ${e.message}`);
            }
        }
    };

    const handleTestPrint = async () => {
        setTestError('');
        setTestSuccess('');
        if (!savedPrinter) {
            setTestError('Belum ada printer yang dikonfigurasi.');
            return;
        }

        setIsTesting(true);
        try {
            let device = globalActiveDevice;

            // Jika memory kosong, coba kembalikan dari getDevices
            if (!device && navigator.bluetooth && navigator.bluetooth.getDevices) {
                const devices = await navigator.bluetooth.getDevices();
                const savedId = localStorage.getItem('savedPrinterId');
                device = devices.find(d =>
                    (savedId && d.id === savedId) ||
                    (savedPrinter && d.name === savedPrinter)
                );
                if (device) setGlobalActiveDevice(device);
            }

            if (!device) {
                throw new Error("Koneksi ke printer tersimpan terputus atau izin browser kedaluwarsa. Silakan klik 'Ganti / Pair Printer' untuk menghubungkan ulang.");
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

            let printData = '\x1B\x40'; // Initialize
            printData += '\x1B\x61\x01'; // Center
            printData += 'TES PRINTER BERHASIL\n\n';
            printData += '\x1B\x61\x00'; // Left
            printData += 'Printer Utama Anda siap digunakan.\n\n\n';

            const encoder = new TextEncoder();
            const data = encoder.encode(printData);

            const CHUNK_SIZE = 100;
            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                const chunk = data.slice(i, i + CHUNK_SIZE);
                await printCharacteristic.writeValue(chunk);
                await new Promise(r => setTimeout(r, 20));
            }

            device.gatt.disconnect();
            setTestSuccess('Tes cetak berhasil dikirim ke printer!');
        } catch (e) {
            console.error(e);
            setTestError(`Printer tidak dapat terhubung: ${e.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <PageHeader title="Pengaturan" subtitle="Konfigurasi aplikasi Warung Lupi." />

            {/* Printer */}
            <Card className="mb-6 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-[10px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Icon name="printer" className="w-4 h-4" />
                    </span>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Printer Thermal</h2>
                        <p className="text-xs text-gray-500">Hubungkan printer bluetooth untuk mencetak bon.</p>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {testError && (
                        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2" role="alert">
                            <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{testError}</span>
                        </div>
                    )}

                    {testSuccess && (
                        <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2" role="status">
                            <Icon name="checkCircle" className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{testSuccess}</span>
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium text-gray-800 mb-2">Printer Utama</p>

                        {savedPrinter ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="min-w-0">
                                    <span className="text-[15px] font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                                        <Icon name="bluetooth" className="w-4 h-4 text-brand-600 shrink-0" />
                                        {savedPrinter}
                                    </span>
                                    <Badge tone={globalActiveDevice ? 'green' : 'gray'}>
                                        {globalActiveDevice ? 'Siap digunakan (aktif di sesi ini)' : 'Konfigurasi tersimpan'}
                                    </Badge>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="soft" onClick={handleTestPrint} loading={isTesting} loadingText="Mencetak..." icon="printer" className="flex-1 sm:flex-none">
                                        Tes Cetak
                                    </Button>
                                    <Button variant="secondary" onClick={handlePairPrinter} disabled={isTesting}>
                                        Ganti Printer
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                                <span className="inline-flex w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-400 items-center justify-center mb-3">
                                    <Icon name="printer" className="w-6 h-6" />
                                </span>
                                <p className="text-sm font-medium text-gray-800">Belum ada printer yang dikonfigurasi.</p>
                                <p className="text-xs text-gray-500 mt-1 mb-4">Pilih printer bluetooth dari daftar perangkat di browser Anda.</p>
                                <Button icon="bluetooth" onClick={handlePairPrinter}>Pair / Pilih Printer</Button>
                            </div>
                        )}
                    </div>

                    {/* Perilaku cetak */}
                    <form onSubmit={handleSaveSize} className="pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-800 mb-2">Ukuran Kertas Default</p>
                        <div className="flex border border-gray-200 rounded-[10px] overflow-hidden bg-white w-fit" role="group" aria-label="Ukuran kertas default">
                            {['58mm', '80mm'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSize(s)}
                                    aria-pressed={size === s}
                                    className={`h-10 px-5 text-sm font-semibold transition-colors ${
                                        size === s ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-50'
                                    } ${s === '80mm' ? 'border-l border-gray-200' : ''}`}
                                >
                                    {s} {s === '58mm' ? '(Kecil)' : '(Besar)'}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                            Ukuran kertas yang akan digunakan secara otomatis saat Anda mencetak bon.
                            Anda tetap dapat mengubahnya sementara saat melihat preview bon.
                        </p>
                        <div className="mt-4">
                            <Button type="submit" variant="dark" icon="check">Simpan Pengaturan</Button>
                        </div>
                    </form>
                </div>
            </Card>

            {/* Info dukungan browser */}
            <Card className="p-4">
                <div className="flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed">
                    <Icon name="info" className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    <p>
                        Pencetakan langsung memakai Bluetooth Web (Chrome/Edge di Android &amp; desktop).
                        Jika printer tidak tersedia, gunakan tombol <span className="font-semibold text-gray-700">Copy Teks</span> atau
                        unduh <span className="font-semibold text-gray-700">PNG</span> pada halaman detail bon lalu cetak lewat aplikasi printer.
                    </p>
                </div>
            </Card>
        </div>
    );
}
