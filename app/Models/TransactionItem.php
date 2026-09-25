<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id',
        'product_id',
        'product_name',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'subtotal' => 'integer',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withDefault();
    }

    /**
     * Auto-calculate subtotal before saving
     */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (TransactionItem $item) {
            if (!isset($item->subtotal) || $item->subtotal === 0 || $item->subtotal === '0' || $item->subtotal === 0.0) {
                $item->subtotal = $item->quantity * $item->unit_price;
            }
        });

        static::saved(function (TransactionItem $item) {
            $item->transaction->recalculateTotal();
        });

        static::deleted(function (TransactionItem $item) {
            $item->transaction->recalculateTotal();
        });
    }
}
