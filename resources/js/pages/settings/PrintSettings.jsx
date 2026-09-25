import React, { useState } from 'react';

export default function PrintSettings() {
    const [size, setSize] = useState(localStorage.getItem('thermalSize') || '80mm');

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('thermalSize', size);
        alert('Pengaturan cetak berhasil disimpan.');
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengaturan</h1>
                <p className="text-sm text-gray-500">Konfigurasi aplikasi Warung Lupi.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Pengaturan Printer Thermal</h2>
                
                <form onSubmit={handleSave} className="max-w-md">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Ukuran Kertas Default</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
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
