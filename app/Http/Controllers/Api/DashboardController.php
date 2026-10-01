<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();

        $todayTransactions = Transaction::whereDate('transaction_date', $today)->get();

        $totalToday = $todayTransactions->sum('total_amount');
        $countToday = $todayTransactions->count();
        $totalCustomers = Customer::where('is_active', true)->count();

        // Keuntungan/Lunas
        $lunasHariIni = $todayTransactions->where('payment_status', 'paid')->sum('total_amount');
        $lunasTotal = Transaction::where('payment_status', 'paid')->sum('total_amount');
        
        // Hutang
        $masihHutang = Transaction::where('payment_status', 'unpaid')->sum('total_amount');

        $recentTransactions = Transaction::with('customer')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'transaction_number' => $t->transaction_number,
                'customer_name' => $t->customer ? $t->customer->name : 'Tanpa Nama',
                'transaction_date' => $t->transaction_date->format('d M Y'),
                'total_amount' => $t->total_amount,
                'status' => $t->status,
                'payment_status' => $t->payment_status,
            ]);

        return response()->json([
            'stats' => [
                'bon_hari_ini' => $countToday,
                'total_hari_ini' => $totalToday,
                'lunas_hari_ini' => $lunasHariIni,
                'lunas_total' => $lunasTotal,
                'masih_hutang' => $masihHutang,
                'total_pelanggan' => $totalCustomers,
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
