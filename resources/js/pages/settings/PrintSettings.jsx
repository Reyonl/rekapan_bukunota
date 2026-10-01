import React, { useState } from 'react';
import { globalActiveDevice, setGlobalActiveDevice, getSavedPrinterName } from '../../utils/printer';

export default function PrintSettings() {
    const [size, setSize] = useState(localStorage.getItem('thermalSize') || '58mm');
    const [savedPrinter, setSavedPrinter] = useState(getSavedPrinterName());
    const [isTesting, setIsTesting] = useState(false);
    const [testError, setTestError] = useState('');
    const [testSuccess, setTestSuccess] = useState('');

    const handleSaveSize = (e) => {
        e.preventDefault();
        localStorage.setItem('thermalSize', size);
        alert('Pengaturan ukuran kertas berhasil disimpan.');
    };

    const handlePairPrinter = async () => {
        setTestError('');
        setTestSuccess('');
        if (!navigator.bluetooth) {
            alert("Fitur Bluetooth tidak didukung di browser ini.");
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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengaturan</h1>
                <p className="text-sm text-gray-500">Konfigurasi aplikasi Warung Lupi.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Printer Thermal</h2>
                
                {testError && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {testError}
                    </div>
                )}
                
                {testSuccess && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {testSuccess}
                    </div>
                )}

                <div className="mb-8">
                    <span className="block text-sm font-medium text-gray-900 mb-1">Printer Utama</span>
                    
                    {savedPrinter ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <span className="text-base font-semibold text-gray-900 block mb-1">{savedPrinter}</span>
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                    {globalActiveDevice ? '● Siap digunakan (Aktif di memori)' : 'Konfigurasi tersimpan'}
                                </span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <button 
                                    onClick={handleTestPrint}
                                    disabled={isTesting}
                                    className="px-4 py-2 border border-brand-600 text-brand-600 bg-white hover:bg-brand-50 rounded text-sm font-medium w-full sm:w-auto disabled:opacity-50"
                                >
                                    {isTesting ? 'Mencetak...' : 'Tes Cetak'}
                                </button>
                                <button 
                                    onClick={handlePairPrinter}
                                    className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded text-sm font-medium w-full sm:w-auto"
                                >
                                    Ganti Printer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-500 mb-4">Belum ada printer yang dikonfigurasi.</p>
                            <button 
                                onClick={handlePairPrinter}
                                className="px-6 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded text-sm font-medium inline-block"
                            >
                                Pair / Pilih Printer
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSaveSize}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Ukuran Kertas Default</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full sm:w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                        >
                            <option value="58mm">58mm (Kecil)</option>
                            <option value="80mm">80mm (Besar)</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                            Ukuran kertas yang akan digunakan secara otomatis saat Anda mencetak bon. Anda tetap dapat mengubahnya secara sementara saat melihat preview bon.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
                    >
                        Simpan Pengaturan
                    </button>
                </form>
            </div>
        </div>
    );
}
