<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with('customer');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('transaction_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->paginate(20);

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'      => 'required|exists:customers,id',
            'transaction_date' => 'required|date',
            'notes'            => 'nullable|string|max:500',
        ]);

        $transactionNumber = Transaction::generateTransactionNumber($validated['transaction_date']);

        $transaction = Transaction::create([
            ...$validated,
            'transaction_number' => $transactionNumber,
            'status' => 'draft',
            'total_amount' => 0,
        ]);

        $transaction->load('customer');

        return response()->json($transaction, 201);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load(['customer', 'items']);

        return response()->json($transaction);
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'      => 'sometimes|exists:customers,id',
            'transaction_date' => 'sometimes|date',
            'status'           => 'sometimes|in:draft,completed',
            'notes'            => 'nullable|string|max:500',
        ]);

        $transaction->update($validated);
        $transaction->load(['customer', 'items']);

        return response()->json($transaction);
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $transaction->items()->delete();
        $transaction->delete();

        return response()->json(['message' => 'Bon berhasil dihapus.']);
    }
}
