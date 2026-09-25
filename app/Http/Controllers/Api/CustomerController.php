<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $customers = $query->orderBy('name')->get();

        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        $customer = Customer::create($validated);

        return response()->json($customer, 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->loadCount('transactions');
        return response()->json($customer);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'notes'     => 'nullable|string|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        $customer->update($validated);

        return response()->json($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        if ($customer->transactions()->exists()) {
            return response()->json([
                'message' => 'Pelanggan tidak dapat dihapus karena memiliki riwayat bon.'
            ], 422);
        }

        $customer->delete();
        return response()->json(['message' => 'Pelanggan berhasil dihapus.']);
    }

    public function transactions(Customer $customer): JsonResponse
    {
        $transactions = $customer->transactions()
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'transaction_number' => $t->transaction_number,
                'transaction_date' => $t->transaction_date->format('d M Y'),
                'total_amount' => $t->total_amount,
                'status' => $t->status,
            ]);

        return response()->json([
            'customer' => $customer,
            'transactions' => $transactions,
        ]);
    }
}
