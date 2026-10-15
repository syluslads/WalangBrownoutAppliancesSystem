<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Unified dashboard endpoint.
     *
     * Returns all dashboard data in one call:
     *  - KPI cards (total products, low-stock, overstock, near-expiry, available units)
     *  - System alerts (reorder, overstock, seasonal, expiry warnings)
     *  - Recent inventory transactions (last 10)
     */
    public function index(): JsonResponse
    {
        $kpis         = $this->buildKPIs();
        $alerts       = $this->generateAlerts();
        $transactions = $this->recentTransactions();

        return response()->json([
            'data' => [
                'kpis'                  => $kpis,
                'alerts'                => $alerts,
                'recent_transactions'   => $transactions,
            ],
        ]);
    }

    /**
     * Separate KPI endpoint (optional, if you ever want to fetch them independently).
     */
    public function kpisEndpoint(): JsonResponse
    {
        return response()->json(['data' => $this->buildKPIs()]);
    }

    /**
     * Separate alerts endpoint (optional).
     */
    public function alertsEndpoint(): JsonResponse
    {
        return response()->json(['data' => $this->generateAlerts()]);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Build KPI cards for the dashboard.
     */
    private function buildKPIs(): array
    {
        $totalProducts = Product::where('is_active', true)->count();

        // Low-stock: active products whose current stock is at or below reorder_point.
        $lowStockCount = Product::where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->withSum('batches as current_stock', 'quantity_available')
            ->get()
            ->filter(fn ($p) => (int) ($p->current_stock ?? 0) <= $p->reorder_point)
            ->count();

        // Overstock: products whose current stock exceeds max_stock_level
        $overstockCount = Product::where('is_active', true)
            ->where('max_stock_level', '>', 0)
            ->withSum('batches as current_stock', 'quantity_available')
            ->get()
            ->filter(fn ($p) => (int) ($p->current_stock ?? 0) > $p->max_stock_level)
            ->count();

        // Near expiry: batches expiring within 3 months.
        $nearExpiryCount = \DB::table('inventory_batches')
            ->where('quantity_available', '>', 0)
            ->whereNotNull('expiration_date')
            ->where('expiration_date', '<=', now()->addMonths(3))
            ->count();

        // Total available units across all active products.
        $totalAvailableUnits = \DB::table('inventory_batches')
            ->join('products', 'inventory_batches.product_id', '=', 'products.id')
            ->where('products.is_active', true)
            ->sum('inventory_batches.quantity_available');

        return [
            ['label' => 'Total Active Products', 'value' => (string) $totalProducts,        'icon' => 'box',        'tone' => 'blue'],
            ['label' => 'Low Stock Items',        'value' => (string) $lowStockCount,        'icon' => 'trend-down', 'tone' => 'amber'],
            ['label' => 'Overstock Items',        'value' => (string) $overstockCount,       'icon' => 'alert',      'tone' => 'orange'],
            ['label' => 'Near Expiry Items',      'value' => (string) $nearExpiryCount,      'icon' => 'clock',      'tone' => 'red'],
            ['label' => 'Available Units',        'value' => number_format($totalAvailableUnits), 'icon' => 'lock',  'tone' => 'violet'],
        ];
    }

    /**
     * Generate system alerts based on current inventory state.
     */
    private function generateAlerts(): array
    {
        $alerts = [];

        // -------------------------------------------------------------------------
        // 1. Overstock alerts - products exceeding max_stock_level
        // -------------------------------------------------------------------------
        $overstockProducts = Product::where('is_active', true)
            ->where('max_stock_level', '>', 0)
            ->with('supplier:id,name', 'category:id,name')
            ->withSum('batches as current_stock', 'quantity_available')
            ->get()
            ->filter(fn ($p) => (int) ($p->current_stock ?? 0) > $p->max_stock_level);

        foreach ($overstockProducts as $product) {
            $currentStock = (int) ($product->current_stock ?? 0);
            $excess = $currentStock - $product->max_stock_level;
            
            $alerts[] = [
                'type'            => 'Overstock',
                'severity'        => 'medium',
                'message'         => "{$product->name} (SKU: {$product->sku}) is overstocked. "
                    . "Current stock: {$currentStock} unit(s). "
                    . "Max level: {$product->max_stock_level}. "
                    . "Excess: {$excess} unit(s). Consider reducing orders.",
                'product_id'      => $product->id,
                'current_stock'   => $currentStock,
                'max_stock_level' => $product->max_stock_level,
            ];
        }

        // -------------------------------------------------------------------------
        // 2. Reorder point alerts — products whose current stock <= reorder_point.
        // -------------------------------------------------------------------------
        $lowStockProducts = Product::where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->with('supplier:id,name,lead_time_days', 'category:id,name')
            ->withSum('batches as current_stock', 'quantity_available')
            ->get()
            ->filter(fn ($p) => (int) ($p->current_stock ?? 0) <= $p->reorder_point);

        foreach ($lowStockProducts as $product) {
            $currentStock = (int) ($product->current_stock ?? 0);
            $severity     = $currentStock <= $product->safety_stock ? 'high' : 'medium';

            $alerts[] = [
                'type'          => 'Reorder Point',
                'severity'      => $severity,
                'message'       => "{$product->name} (SKU: {$product->sku}) has reached its Reorder Point. "
                    . "Current stock: {$currentStock} unit(s). "
                    . "ROP: {$product->reorder_point}. "
                    . "Safety stock: {$product->safety_stock}.",
                'product_id'    => $product->id,
                'current_stock' => $currentStock,
                'reorder_point' => $product->reorder_point,
                'safety_stock'  => $product->safety_stock,
            ];
        }

        // -------------------------------------------------------------------------
        // 3. Seasonal items alert - products marked as seasonal
        // -------------------------------------------------------------------------
        $seasonalProducts = Product::where('is_active', true)
            ->where('is_seasonal', true)
            ->withSum('batches as current_stock', 'quantity_available')
            ->get();

        if ($seasonalProducts->count() > 0) {
            $seasonalList = $seasonalProducts->map(fn($p) => 
                "{$p->name} (Stock: " . ((int)($p->current_stock ?? 0)) . ")"
            )->implode(', ');

            $alerts[] = [
                'type'     => 'Seasonal Items',
                'severity' => 'low',
                'message'  => "Seasonal products currently in inventory: {$seasonalList}. Monitor demand patterns and adjust stock levels accordingly.",
            ];
        }

        // -------------------------------------------------------------------------
        // 4. Expiry warnings for perishable products
        // -------------------------------------------------------------------------
        $expiringBatches = \DB::table('inventory_batches')
            ->join('products', 'inventory_batches.product_id', '=', 'products.id')
            ->where('inventory_batches.quantity_available', '>', 0)
            ->whereNotNull('inventory_batches.expiration_date')
            ->where('inventory_batches.expiration_date', '<=', now()->addMonths(3))
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.sku',
                'inventory_batches.batch_number',
                'inventory_batches.expiration_date',
                'inventory_batches.quantity_available'
            )
            ->orderBy('inventory_batches.expiration_date')
            ->get();

        foreach ($expiringBatches as $batch) {
            $daysUntil = Carbon::parse($batch->expiration_date)->diffInDays(now(), false);
            $daysUntil = abs($daysUntil);

            $severity = $daysUntil <= 30 ? 'high' : 'medium';
            $expDate  = Carbon::parse($batch->expiration_date)->format('Y-m-d');

            $alerts[] = [
                'type'            => 'Expiry (FIFO)',
                'severity'        => $severity,
                'message'         => "Batch {$batch->batch_number} of {$batch->product_name} (SKU: {$batch->sku}) "
                    . "expires on {$expDate} (~{$daysUntil} day(s)). "
                    . "Quantity: {$batch->quantity_available} unit(s). Prioritize FIFO picking.",
                'product_id'      => $batch->product_id,
                'batch_number'    => $batch->batch_number,
                'expiration_date' => $expDate,
                'quantity'        => $batch->quantity_available,
            ];
        }

        return $alerts;
    }

    /**
     * Recent inventory transactions for the activity feed.
     */
    private function recentTransactions(): array
    {
        return InventoryTransaction::with('product:id,name,sku', 'user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($t) => [
                'id'      => $t->id,
                'type'    => $t->type,
                'product' => $t->product ? ($t->product->name . ' (SKU: ' . $t->product->sku . ')') : '—',
                'qty'     => $t->quantity_change >= 0 ? '+' . $t->quantity_change : (string) $t->quantity_change,
                'staff'   => $t->user?->name ?? 'System',
                'notes'   => $t->notes,
                'date'    => $t->created_at->format('Y-m-d H:i'),
            ])
            ->toArray();
    }
}
