<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StockOutRequest;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\StockOutAllocation;
use App\Models\StockOutRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockOutController extends Controller
{
    /**
     * POST /api/inventory/stock-out
     *
     * Issues stock using FIFO (First-In, First-Out) logic:
     *  - Perishable products: order batches by earliest expiration_date first, then received_date.
     *  - Non-perishable products: order batches by received_date first, then id.
     *  - Expired batches (expiration_date in the past) are excluded from normal picking.
     *  - The entire operation is wrapped in a short DB::transaction.
     *  - Quantity cannot go negative: a guarded update is used per batch.
     *
     * Business rules enforced:
     *  1. Total available stock must be >= requested quantity.
     *  2. Stock quantities cannot become negative.
     *  3. Each batch used creates one StockOutAllocation record.
     *  4. One InventoryTransaction (TYPE_OUT) is created per allocation.
     *  5. One StockOutRecord ties the entire operation together.
     */
    public function store(StockOutRequest $request): JsonResponse
    {
        $data = $request->validated();

        /** @var Product $product */
        $product = Product::findOrFail($data['product_id']);

        $quantityRequested = (int) $data['quantity'];

        // Fetch eligible batches in FIFO order (inside the transaction for consistency).
        $result = DB::transaction(function () use ($data, $product, $quantityRequested, $request) {

            // Build the base batch query: only batches with stock remaining.
            $batchQuery = InventoryBatch::where('product_id', $product->id)
                ->where('quantity_available', '>', 0);

            // Exclude fully expired batches from normal stock-out.
            // (Expired batches show in alerts but cannot be issued normally.)
            $batchQuery->where(function ($q) {
                $q->whereNull('expiration_date')
                  ->orWhere('expiration_date', '>=', now()->toDateString());
            });

            // FIFO ordering:
            // Perishable → earliest expiration_date first, then received_date, then id.
            // Non-perishable → earliest received_date first, then id.
            if ($product->is_perishable) {
                $batchQuery
                    ->orderBy('expiration_date', 'asc')
                    ->orderBy('received_date', 'asc')
                    ->orderBy('id', 'asc');
            } else {
                $batchQuery
                    ->orderBy('received_date', 'asc')
                    ->orderBy('id', 'asc');
            }

            $batches = $batchQuery->get();

            // Validate that there is enough stock across all eligible batches.
            $totalAvailable = $batches->sum('quantity_available');

            if ($totalAvailable < $quantityRequested) {
                throw ValidationException::withMessages([
                    'quantity' => [
                        "Insufficient stock. Requested {$quantityRequested} unit(s), "
                        . "but only {$totalAvailable} unit(s) are available.",
                    ],
                ]);
            }

            // Create the parent stock-out record.
            $stockOutRecord = StockOutRecord::create([
                'product_id'          => $product->id,
                'user_id'             => $request->user()->id,
                'quantity_requested'  => $quantityRequested,
                'quantity_fulfilled'  => $quantityRequested, // fulfilled = requested (we validate above)
                'reason'              => $data['reason'] ?? null,
                'notes'               => $data['notes'] ?? null,
            ]);

            $remaining   = $quantityRequested;
            $allocations = [];

            // Walk through batches in FIFO order and deplete them.
            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                $used = min($remaining, $batch->quantity_available);

                // Guarded update: only decrement if quantity_available is still >= $used.
                // This prevents a race condition from making quantity negative.
                $updated = InventoryBatch::whereKey($batch->id)
                    ->where('quantity_available', '>=', $used)
                    ->update([
                        'quantity_available' => DB::raw('quantity_available - ' . (int) $used),
                        'updated_at'         => now(),
                    ]);

                if ($updated !== 1) {
                    // The batch quantity changed between our read and update — abort.
                    throw ValidationException::withMessages([
                        'quantity' => ['The batch quantity changed during processing. Please try again.'],
                    ]);
                }

                // Create an allocation record linking the stock-out to this batch.
                $allocation = StockOutAllocation::create([
                    'stock_out_record_id' => $stockOutRecord->id,
                    'inventory_batch_id'  => $batch->id,
                    'quantity_taken'      => $used,
                ]);

                // Create an OUT inventory transaction for each allocation (audit trail).
                InventoryTransaction::create([
                    'product_id'         => $product->id,
                    'inventory_batch_id' => $batch->id,
                    'user_id'            => $request->user()->id,
                    'type'               => InventoryTransaction::TYPE_OUT,
                    'quantity_change'    => -$used, // negative for OUT
                    'notes'              => $data['notes'] ?? null,
                ]);

                $allocations[] = $allocation->load('batch');
                $remaining    -= $used;
            }

            return [
                'stock_out_record' => $stockOutRecord->load('product', 'user', 'allocations.batch'),
                'allocations'      => $allocations,
            ];
        });

        $product->refresh();

        return response()->json([
            'message' => 'Stock-out recorded successfully.',
            'data'    => [
                'stock_out_record' => $result['stock_out_record'],
                'allocations'      => $result['allocations'],
                'product'          => [
                    'id'            => $product->id,
                    'sku'           => $product->sku,
                    'name'          => $product->name,
                    'current_stock' => $product->currentStock(),
                ],
            ],
        ], 201);
    }

    /**
     * GET /api/inventory/stock-out
     *
     * Returns a paginated list of all stock-out records, newest first.
     * Eager-loads product, user, and allocations for the audit view.
     */
    public function index(): JsonResponse
    {
        $records = StockOutRecord::with([
            'product:id,sku,name',
            'user:id,name,role',
            'allocations.batch',
        ])
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json(['data' => $records]);
    }

    /**
     * GET /api/inventory/stock-out/{stockOutRecord}
     *
     * Returns one stock-out record with full allocation detail.
     */
    public function show(StockOutRecord $stockOutRecord): JsonResponse
    {
        $stockOutRecord->load([
            'product:id,sku,name,is_perishable',
            'user:id,name,role',
            'allocations.batch',
        ]);

        return response()->json(['data' => $stockOutRecord]);
    }
}
