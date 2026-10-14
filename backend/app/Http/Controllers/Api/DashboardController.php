<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     *
     * Returns all dashboard data in one call:
     *  - KPI cards (total products, low-stock, near-expiry, reserved/pending)
     *  - System alerts (reorder, seasonal, expiry warnings)
     *  - Recent inventory transactions (last 10)
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'kpis'                => $this->kpis(),
                'alerts'              => $this->alerts(),
                'recent_transactions' => $this->recentTransactions(),
            ],
        ]);
    }

    /**
     * GET /api/dashboard/kpis
     *
     * Standalone KPI endpoint (wraps the kpis() helper in a JSON response).
     */
    public function kpisEndpoint(): JsonResponse
    {
        return response()->json(['data' => $this->kpis()]);
    }

    /**
     * GET /api/dashboard/alerts
     *
     * Standalone alerts endpoint (wraps the alerts() helper in a JSON response).
     */
    public function alertsEndpoint(): JsonResponse
    {
        return response()->json(['data' => $this->alerts()]);
    }

    /**
     * GET /api/dashboard/kpis
     *
     * Individual KPI endpoint for targeted polling.
     * Returns a JsonResponse when called as a route, or an array when called internally.
     */
    public function kpis(): array
    {
        $totalProducts = Product::where('is_active', true)->count();

        // Low-stock: active products whose current stock (sum of batch quantities) is at or below reorder_point.
        // We compare against reorder_point; products with reorder_point = 0 are excluded to avoid false positives.
        $lowStockCount = Product::where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->withSum('batches as current_stock', 'quantity_available')
            ->get()
            ->filter(fn ($p) => (int) ($p->current_stock ?? 0) <= $p->reorder_point)
            ->count();

        // Near-expiry: batches that still have stock AND expire within 30 days from today.
        $nearExpiryCount = InventoryBatch::where('quantity_available', '>', 0)
            ->whereNotNull('expiration_date')
            ->whereBetween('expiration_date', [
                now()->toDateString(),
                now()->addDays(30)->toDateString(),
            ])
            ->count();

        // Reserved: total quantity across all batches that still have stock (overall available inventory).
        // We surface this as "Available Units" since there is no reservation/order system in this version.
        $totalAvailableUnits = (int) InventoryBatch::sum('quantity_available');

        return [
            ['label' => 'Total Active Products', 'value' => (string) $totalProducts,        'icon' => 'box',        'tone' => 'blue'],
            ['label' => 'Low Stock Items',        'value' => (string) $lowStockCount,        'icon' => 'trend-down', 'tone' => 'amber'],
            ['label' => 'Near Expiry Items',      'value' => (string) $nearExpiryCount,      'icon' => 'clock',      'tone' => 'red'],
            ['label' => 'Available Units',        'value' => number_format($totalAvailableUnits), 'icon' => 'lock',  'tone' => 'violet'],
        ];
    }

    /**
     * GET /api/dashboard/alerts
     *
     * System alerts for reorder, seasonal, and expiry conditions.
     */
    public function alerts(): array
    {
        $alerts = [];

        // -------------------------------------------------------------------------
        // 1. Expiry alerts — batches expiring within 30 days (urgent) or between
        //    30–60 days (warning). Blueprint: "urgent alert 30 days before expiry,
        //    warning at 8 months in storage (for 9-month perishables)."
        // -------------------------------------------------------------------------
        $urgentExpiry = InventoryBatch::with('product:id,sku,name')
            ->where('quantity_available', '>', 0)
            ->whereNotNull('expiration_date')
            ->whereBetween('expiration_date', [
                now()->toDateString(),
                now()->addDays(30)->toDateString(),
            ])
            ->orderBy('expiration_date')
            ->get();

        foreach ($urgentExpiry as $batch) {
            $daysLeft = (int) now()->diffInDays(Carbon::parse($batch->expiration_date), false);
            $alerts[] = [
                'type'     => 'Expiry (FIFO)',
                'severity' => 'high',
                'message'  => "Batch #{$batch->id} — {$batch->product->name}: "
                    . "{$batch->quantity_available} unit(s) expire in {$daysLeft} day(s) "
                    . "({$batch->expiration_date}). Prioritize for picking.",
                'batch_id'          => $batch->id,
                'product_id'        => $batch->product_id,
                'expiration_date'   => $batch->expiration_date,
                'quantity_available'=> $batch->quantity_available,
            ];
        }

        // Batches in storage for >= 8 months (near the 9-month shelf limit) but not yet in the urgent window.
        $eightMonthWarning = InventoryBatch::with('product:id,sku,name')
            ->where('quantity_available', '>', 0)
            ->whereNotNull('expiration_date')
            ->where('expiration_date', '>', now()->addDays(30)->toDateString()) // not already urgent
            ->where('received_date', '<=', now()->subMonths(8)->toDateString()) // in storage >= 8 months
            ->orderBy('received_date')
            ->get();

        foreach ($eightMonthWarning as $batch) {
            $alerts[] = [
                'type'     => 'Expiry (FIFO)',
                'severity' => 'medium',
                'message'  => "Batch #{$batch->id} — {$batch->product->name} has been in storage for "
                    . Carbon::parse($batch->received_date)->diffInMonths(now()) . " months. "
                    . "Approaching shelf-life limit. Prioritize for picking.",
                'batch_id'          => $batch->id,
                'product_id'        => $batch->product_id,
                'expiration_date'   => $batch->expiration_date,
                'quantity_available'=> $batch->quantity_available,
            ];
        }

        // -------------------------------------------------------------------------
        // 2. Reorder point alerts — products whose current stock <= reorder_point.
        //    Blueprint formula: ROP = (Avg Daily Demand × Lead Time) + Safety Stock
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

        // Sort: high severity first, then medium, then low.
        usort($alerts, function ($a, $b) {
            $order = ['high' => 0, 'medium' => 1, 'low' => 2];
            return ($order[$a['severity']] ?? 3) <=> ($order[$b['severity']] ?? 3);
        });

        return $alerts;
    }

    /**
     * Returns the 10 most recent inventory transactions for the dashboard feed.
     */
    private function recentTransactions(): array
    {
        return InventoryTransaction::with([
            'product:id,sku,name',
            'user:id,name',
            'batch:id,batch_number,received_date',
        ])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($tx) {
                return [
                    'id'             => $tx->id,
                    'date'           => $tx->created_at->format('m/d H:i'),
                    'product'        => $tx->product->name ?? 'Unknown',
                    'type'           => $tx->type,
                    'qty'            => ($tx->type === 'IN' ? '+' : '') . $tx->quantity_change,
                    'staff'          => $tx->user->name ?? 'Unknown',
                    'batch_number'   => $tx->batch->batch_number ?? null,
                    'notes'          => $tx->notes,
                    'created_at'     => $tx->created_at,
                ];
            })
            ->toArray();
    }
}
