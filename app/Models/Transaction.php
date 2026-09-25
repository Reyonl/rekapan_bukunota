<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Transaction extends Model
{
    protected $fillable = [
        'customer_id',
        'transaction_number',
        'transaction_date',
        'total_amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'total_amount' => 'integer',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Generate unique transaction number: INV-YYYYMMDD-XXX
     */
    public static function generateTransactionNumber(string $date): string
    {
        $dateStr = \Carbon\Carbon::parse($date)->format('Ymd');
        $prefix = "INV-{$dateStr}-";

        // Count existing transactions for this date
        $count = static::where('transaction_number', 'like', $prefix . '%')->count();
        $sequence = str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        // Ensure uniqueness
        $number = $prefix . $sequence;
        while (static::where('transaction_number', $number)->exists()) {
            $count++;
            $sequence = str_pad($count + 1, 3, '0', STR_PAD_LEFT);
            $number = $prefix . $sequence;
        }

        return $number;
    }

    /**
     * Recalculate and update total_amount from items
     */
    public function recalculateTotal(): void
    {
        $total = $this->items()->sum('subtotal');
        $this->update(['total_amount' => $total]);
    }
}
