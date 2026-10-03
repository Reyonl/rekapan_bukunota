<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Klasifikasi & agregasi penjualan ROKOK — satu-satunya tempat rule rokok hidup.
 *
 * Deteksi SATU KALI per item (boolean), berbasis:
 *  1. nama kategori produk (relasi saat ini, bila masih tersedia)
 *  2. snapshot product_name pada transaction_items (aman untuk histori & manual item)
 *  3. snapshot description pada transaction_items
 *
 * Aturan keras: TIDAK ada kolom is_cigarette, TIDAK ada migration.
 */
class CigaretteReportService
{
    /** Keyword klasifikasi. Case-insensitive, substring. */
    public const KEYWORDS = ['rokok'];

    public static function keyword(): string
    {
        return self::KEYWORDS[0];
    }

    /** Normalisasi teks sebelum matching: lowercase, trim, rapikan spasi ganda. */
    public static function normalize(?string $value): string
    {
        return trim(preg_replace('/\s+/u', ' ', mb_strtolower((string) $value)));
    }

    /** Apakah teks terklasifikasi rokok? */
    public static function textIsCigarette(?string $value): bool
    {
        $text = self::normalize($value);
        if ($text === '') {
            return false;
        }

        foreach (self::KEYWORDS as $keyword) {
            if (str_contains($text, self::normalize($keyword))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Classifier CANONICAL untuk satu item.
     * Satu item cocok lewat beberapa jalur tetap menghasilkan true (dihitung sekali).
     */
    public static function isCigarette(TransactionItem $item): bool
    {
        if (self::textIsCigarette($item->product_name)) {
            return true;
        }

        if (self::textIsCigarette($item->description)) {
            return true;
        }

        // Category-based: hanya bila relasi product/category masih tersedia.
        if ($item->product_id !== null) {
            $categoryName = optional($item->product?->category)->name;
            if (self::textIsCigarette($categoryName)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Prefilter SQL SEMANTIS SAMA dengan isCigarette() — hanya untuk membatasi baris,
     * hasil akhir tetap dikonfirmasi oleh classifier di PHP (satu sumber kebenaran).
     *
     * @param  Builder<\App\Models\TransactionItem>  $query
     */
    public static function applyItemFilter(Builder $query, ?string $productName = null): Builder
    {
        $like = '%' . self::keyword() . '%';

        $query->where(function ($q) use ($like) {
            $q->where(DB::raw('lower(product_name)'), 'like', $like)
                ->orWhere(DB::raw('lower(description)'), 'like', $like)
                ->orWhereHas('product.category', fn ($cq) => $cq->where(DB::raw('lower(name)'), 'like', $like));
        });

        if ($productName !== null && $productName !== '') {
            $query->where(DB::raw('lower(product_name)'), 'like', '%' . mb_strtolower(trim($productName)) . '%');
        }

        return $query;
    }

    /**
     * Ringkasan rokok satu bon (semua status — untuk section detail bon).
     *
     * @return array{items: array<int, array<string, mixed>>, total_quantity: int, total_amount: int}
     */
    public function bonSummary(Transaction $transaction): array
    {
        $items = $transaction->items
            ->loadMissing('product.category')
            ->filter(fn (TransactionItem $item) => self::isCigarette($item))
            ->map(fn (TransactionItem $item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'unit' => $item->unit,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ])
            ->values()
            ->all();

        return [
            'items' => $items,
            'total_quantity' => array_sum(array_column($items, 'quantity')),
            'total_amount' => array_sum(array_column($items, 'subtotal')),
        ];
    }

    /**
     * Laporan rokok — HANYA transaksi completed (draft bukan penjualan;
     * completed + unpaid tetap masuk: ini penjualan, bukan uang diterima).
     *
     * @return array{summary: array<string, int>, items: array<int, array<string, mixed>>, transactions: array<string, mixed>, products: array<int, string>}
     */
    public function report(?string $dateFrom, ?string $dateTo, ?string $productFilter = null, ?string $search = null, int $page = 1, int $perPage = 20): array
    {
        $page = max(1, $page);

        $baseQuery = fn () => TransactionItem::query()
            ->where('transactions.status', 'completed')
            ->when($dateFrom, fn ($q) => $q->whereDate('transactions.transaction_date', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('transactions.transaction_date', '<=', $dateTo))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('transactions.transaction_number', 'like', "%{$search}%")
                        ->orWhereHas('transaction.customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
                });
            });

        $smokeQuery = fn (?string $product = null) => self::applyItemFilter(
            $baseQuery()->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id'),
            $product
        );

        // --- Summary (mengikuti filter aktif; 2 query agregat ringan, tanpa N+1) ---
        $summaryRow = $smokeQuery($productFilter)
            ->selectRaw('COALESCE(SUM(transaction_items.quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(transaction_items.subtotal), 0) as total_sales')
            ->selectRaw('COUNT(DISTINCT transactions.id) as bon_count')
            ->first();

        $paidRow = $smokeQuery($productFilter)
            ->where('transactions.payment_status', 'paid')
            ->selectRaw('COALESCE(SUM(transaction_items.subtotal), 0) as paid_sales')
            ->first();

        // --- Breakdown per item (nama snapshot, GROUP BY; manual item tetap terlihat) ---
        $itemRows = $smokeQuery($productFilter)
            ->groupBy(DB::raw('lower(transaction_items.product_name)'), 'transaction_items.product_name')
            ->orderByDesc('total_sales')
            ->get([
                'transaction_items.product_name',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.subtotal) as total_sales'),
            ]);

        // --- Breakdown per bon (paginated; join dulu, agregasi, lalu baru paginate count) ---
        $bonBase = fn () => $smokeQuery($productFilter)
            ->leftJoin('customers', 'transactions.customer_id', '=', 'customers.id')
            ->groupBy('transactions.id', 'transactions.transaction_number', 'transactions.transaction_date', 'transactions.payment_status', 'customers.name');

        $bonTotal = DB::query()->fromSub($bonBase()->selectRaw('1 as one'), 'bon_groups')->count();

        $bonPage = $bonBase()
            ->orderByDesc('transactions.transaction_date')
            ->orderByDesc('transactions.id')
            ->forPage($page, $perPage)
            ->get([
                'transactions.id',
                'transactions.transaction_number',
                'transactions.transaction_date',
                'transactions.payment_status',
                'customers.name as customer_name',
                DB::raw('SUM(transaction_items.quantity) as cigarette_quantity'),
                DB::raw('SUM(transaction_items.subtotal) as cigarette_total'),
            ]);

        // --- Daftar nama item rokok untuk filter produk (distinct, tanpa filter produk) ---
        $products = $smokeQuery(null)
            ->distinct()
            ->pluck('transaction_items.product_name')
            ->unique(fn ($name) => mb_strtolower(self::normalize((string) $name)))
            ->sort(fn ($a, $b) => strcasecmp($a, $b))
            ->values()
            ->all();

        return [
            'summary' => [
                'cigarette_quantity' => (int) $summaryRow->total_quantity,
                'cigarette_sales' => (int) $summaryRow->total_sales,
                'bon_count' => (int) $summaryRow->bon_count,
                'paid_sales' => (int) $paidRow->paid_sales,
                'unpaid_sales' => (int) $summaryRow->total_sales - (int) $paidRow->paid_sales,
            ],
            'items' => $itemRows->map(fn ($r) => [
                'product_name' => $r->product_name,
                'total_quantity' => (int) $r->total_quantity,
                'total_sales' => (int) $r->total_sales,
            ])->all(),
            'transactions' => [
                'data' => $bonPage->map(fn ($r) => [
                    'id' => (int) $r->id,
                    'transaction_number' => $r->transaction_number,
                    'transaction_date' => $r->transaction_date,
                    'customer_name' => $r->customer_name,
                    'payment_status' => $r->payment_status,
                    'cigarette_quantity' => (int) $r->cigarette_quantity,
                    'cigarette_total' => (int) $r->cigarette_total,
                ])->all(),
                'total' => $bonTotal,
                'per_page' => $perPage,
                'current_page' => (int) (request()->get('page', 1) ?: 1),
                'last_page' => (int) ceil($bonTotal / $perPage),
            ],
            'products' => $products,
        ];
    }
}
