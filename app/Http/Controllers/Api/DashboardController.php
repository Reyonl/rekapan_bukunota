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

        $recentTransactions = Transaction::with('customer')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'transaction_number' => $t->transaction_number,
                'customer_name' => $t->customer->name,
                'transaction_date' => $t->transaction_date->format('d M Y'),
                'total_amount' => $t->total_amount,
                'status' => $t->status,
            ]);

        return response()->json([
            'stats' => [
                'bon_hari_ini' => $countToday,
                'total_hari_ini' => $totalToday,
                'total_pelanggan' => $totalCustomers,
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
