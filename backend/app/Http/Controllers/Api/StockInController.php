<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StockInRequest;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockInController extends Controller
{
    /**
     * POST /api/inventory/stock-in
     *
     * Receives a stock-in request, creates an InventoryBatch and an IN
     * InventoryTransaction inside a single short database transaction.
     *
     * Business rules enforced here:
     *  - Perishable products MUST provide an expiration_date.
     *  - Quantity must be a positive integer (handled by StockInRequest).
     *  - Both the batch and the transaction are committed atomically.
     */
    public function store(StockInRequest $request): JsonResponse
    {
        $data = $request->validated();

        /** @var Product $product */
        $product = Product::findOrFail($data['product_id']);

        // Perishable products require an expiration date.
        if ($product->is_perishable && empty($data['expiration_date'])) {
            throw ValidationException::withMessages([
                'expiration_date' => ['An expiration date is required for perishable products.'],
            ]);
        }

        $result = DB::transaction(function () use ($data, $product, $request) {
            // 1. Create the inventory batch.
            $batch = InventoryBatch::create([
                'product_id'         => $product->id,
                'quantity_received'  => $data['quantity'],
                'quantity_available' => $data['quantity'],
                'received_date'      => $data['received_date'],
                'expiration_date'    => $data['expiration_date'] ?? null,
                'batch_number'       => $data['batch_number'] ?? null,
                'location'           => $data['location'] ?? null,
                'unit_cost'          => $data['unit_cost'] ?? null,
            ]);

            // 2. Record the IN transaction for audit trail.
            $transaction = InventoryTransaction::create([
                'product_id'         => $product->id,
                'inventory_batch_id' => $batch->id,
                'user_id'            => $request->user()->id,
                'type'               => InventoryTransaction::TYPE_IN,
                'quantity_change'    => $data['quantity'],   // positive for IN
                'notes'              => $data['notes'] ?? null,
            ]);

            return compact('batch', 'transaction');
        });

        return response()->json([
            'message' => 'Stock-in recorded successfully.',
            'data'    => [
                'batch'       => $result['batch'],
                'transaction' => $result['transaction'],
                'product'     => [
                    'id'            => $product->id,
                    'sku'           => $product->sku,
                    'name'          => $product->name,
                    'current_stock' => $product->currentStock(),
                ],
            ],
        ], 201);
    }

    /**
     * GET /api/inventory/stock-in/{product}
     *
     * Returns all batches (stock-in history) for a specific product,
     * ordered by received_date descending (newest first).
     */
    public function history(Product $product): JsonResponse
    {
        $batches = $product->batches()
            ->orderByDesc('received_date')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => [
                'product'       => [
                    'id'            => $product->id,
                    'sku'           => $product->sku,
                    'name'          => $product->name,
                    'current_stock' => $product->currentStock(),
                ],
                'batches'       => $batches,
                'total_batches' => $batches->count(),
            ],
        ]);
    }
}
