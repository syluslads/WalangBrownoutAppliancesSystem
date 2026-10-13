<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity_received',
        'quantity_available',
        'received_date',
        'expiration_date',
        'batch_number',
        'location',
        'unit_cost',
    ];

    protected function casts(): array
    {
        return [
            'quantity_received'  => 'integer',
            'quantity_available' => 'integer',
            'received_date'      => 'date',
            'expiration_date'    => 'date',
            'unit_cost'          => 'decimal:2',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Inventory transaction records linked to this batch.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Stock-out allocations that consumed from this batch.
     */
    public function stockOutAllocations(): HasMany
    {
        return $this->hasMany(StockOutAllocation::class);
    }
}
