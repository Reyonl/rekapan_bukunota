<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionItemController extends Controller
{
    public function store(Request $request, Transaction $transaction): JsonResponse
    {
        $validated = $request->validate([
            'product_id'   => 'nullable|exists:products,id',
            'product_name' => 'required|string|max:255',
            'description'  => 'nullable|string|max:255',
            'quantity'     => 'required|integer|min:1',
            'unit'         => 'required|string|max:50',
            'unit_price'   => 'required|integer|min:0',
            'subtotal'     => 'nullable|integer|min:0',
        ]);

        if (!isset($validated['subtotal'])) {
            $validated['subtotal'] = $validated['quantity'] * $validated['unit_price'];
        }

        $item = $transaction->items()->create($validated);

        return response()->json($item, 201);
    }

    public function update(Request $request, TransactionItem $transactionItem): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'sometimes|required|string|max:255',
            'description'  => 'nullable|string|max:255',
            'quantity'     => 'sometimes|required|integer|min:1',
            'unit'         => 'sometimes|required|string|max:50',
            'unit_price'   => 'sometimes|required|integer|min:0',
            'subtotal'     => 'nullable|integer|min:0',
        ]);

        if (!isset($validated['subtotal'])) {
            $qty = $validated['quantity'] ?? $transactionItem->quantity;
            $price = $validated['unit_price'] ?? $transactionItem->unit_price;
            $validated['subtotal'] = $qty * $price;
        }

        $transactionItem->update($validated);

        return response()->json($transactionItem);
    }

    public function destroy(TransactionItem $transactionItem): JsonResponse
    {
        $transactionItem->delete();
        return response()->json(['message' => 'Item berhasil dihapus.']);
    }
}
