<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOutAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_out_record_id',
        'inventory_batch_id',
        'quantity_taken',
    ];

    protected function casts(): array
    {
        return [
            'quantity_taken' => 'integer',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function stockOutRecord(): BelongsTo
    {
        return $this->belongsTo(StockOutRecord::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class, 'inventory_batch_id');
    }
}
