<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\CigaretteReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CigaretteReportController extends Controller
{
    public function __construct(private readonly CigaretteReportService $service)
    {
    }

    /**
     * GET /api/reports/cigarettes?date_from&date_to&product&search&page
     * Ringkas: summary + breakdown item + breakdown bon (hanya transaksi completed).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'product' => 'nullable|string|max:255',
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
        ]);

        return response()->json($this->service->report(
            $validated['date_from'] ?? null,
            $validated['date_to'] ?? null,
            $validated['product'] ?? null,
            $validated['search'] ?? null,
            (int) ($validated['page'] ?? 1),
        ));
    }

    /**
     * GET /api/transactions/{transaction}/cigarettes
     * Ringkasan rokok satu bon; items kosong bila bon tidak punya rokok.
     */
    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json($this->service->bonSummary($transaction));
    }
}
