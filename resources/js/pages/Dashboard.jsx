import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatRupiah, formatDate } from '../utils/format';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        today_count: 0,
        today_total: 0,
        customer_count: 0,
        recent: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then(res => {
                const data = res.data;
                setStats({
                    today_count: data.stats?.bon_hari_ini ?? 0,
                    today_total: data.stats?.total_hari_ini ?? 0,
                    customer_count: data.stats?.total_pelanggan ?? 0,
                    recent: data.recent_transactions ?? []
                });
            })
            .catch(err => {
                console.error("Dashboard error", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl pt-6">
                <div className="text-sm text-gray-500">Memuat dashboard...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-sm text-gray-500">Selamat datang kembali di sistem operasional Warung Lupi.</p>
            </div>

            {/* Primary Action */}
            <div className="mb-10">
                <Link
                    to="/bon/buat"
                    className="inline-flex items-center px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
                >
                    + Buat Bon
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 border-t border-gray-200 pt-8">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bon Hari Ini</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.today_count}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Hari Ini</p>
                    <p className="text-3xl font-bold text-gray-900">{formatRupiah(stats.today_total)}</p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Bon Terbaru</h2>
                    <Link to="/bon" className="text-sm font-medium text-brand-600 hover:text-brand-800">
                        Lihat semua &rarr;
                    </Link>
                </div>

                {stats.recent.length === 0 ? (
                    <div className="py-8 text-sm text-gray-500">
                        Belum ada bon hari ini.
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-600">Pelanggan</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.recent.map(t => (
                                    <tr 
                                        key={t.id} 
                                        onClick={() => navigate(`/bon/${t.id}`)}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-gray-900 font-medium">
                                            {t.customer_name}
                                            <div className="text-xs text-gray-500 font-normal mt-0.5">{t.transaction_date}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                            {formatRupiah(t.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
