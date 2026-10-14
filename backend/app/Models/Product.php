<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'supplier_id',
        'unit',
        'unit_price',
        'is_perishable',
        'abc_class',
        'reorder_point',
        'safety_stock',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unit_price'    => 'decimal:2',
            'is_perishable' => 'boolean',
            'is_active'     => 'boolean',
            'reorder_point' => 'integer',
            'safety_stock'  => 'integer',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * All inventory batches for this product.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    /**
     * All inventory transactions (IN and OUT) for this product.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    // -------------------------------------------------------------------------
    // Computed helpers
    // -------------------------------------------------------------------------

    /**
     * Current available stock = sum of quantity_available across all batches.
     * Never store this as a column — always calculate from batch records.
     */
    public function currentStock(): int
    {
        return (int) $this->batches()->sum('quantity_available');
    }
}
