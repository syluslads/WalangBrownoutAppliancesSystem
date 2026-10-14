<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    /**
     * GET /api/audit
     *
     * Returns a paginated, filterable list of every inventory transaction
     * (both IN and OUT), ordered newest first. This is the primary audit
     * trail endpoint.
     *
     * Query parameters:
     *  - product_id  (integer)  — filter by a specific product
     *  - type        (IN|OUT)   — filter by transaction type
     *  - user_id     (integer)  — filter by the staff member who performed it
     *  - date_from   (date)     — filter from this date (inclusive)
     *  - date_to     (date)     — filter to this date (inclusive)
     *  - search      (string)   — search across product name and SKU
     *  - per_page    (integer)  — items per page, default 25, max 100
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'type'       => ['nullable', 'string', 'in:IN,OUT,ADJUSTMENT'],
            'user_id'    => ['nullable', 'integer', 'exists:users,id'],
            'date_from'  => ['nullable', 'date'],
            'date_to'    => ['nullable', 'date', 'after_or_equal:date_from'],
            'search'     => ['nullable', 'string', 'max:100'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = InventoryTransaction::with([
            'product:id,sku,name',
            'user:id,name,role',
            'batch:id,batch_number,received_date,expiration_date,location',
        ])->orderByDesc('created_at');

        // Apply filters.
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', strtoupper($request->string('type')));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->string('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->string('date_to'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->whereHas('product', function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%");
            });
        }

        $perPage = $request->integer('per_page', 25);
        $records = $query->paginate($perPage);

        // Transform for the frontend table.
        $records->getCollection()->transform(function ($tx) {
            return [
                'id'           => $tx->id,
                'timestamp'    => $tx->created_at->format('m/d/y H:i'),
                'product'      => $tx->product->name ?? 'Unknown',
                'product_id'   => $tx->product_id,
                'sku'          => $tx->product->sku ?? null,
                'type'         => $tx->type,
                'qty_change'   => ($tx->type === 'IN' ? '+' : '') . $tx->quantity_change,
                'staff'        => $tx->user->name ?? 'Unknown',
                'staff_role'   => $tx->user->role ?? null,
                'batch_number' => $tx->batch->batch_number ?? null,
                'location'     => $tx->batch->location ?? null,
                'notes'        => $tx->notes,
                'created_at'   => $tx->created_at,
            ];
        });

        return response()->json(['data' => $records]);
    }
}
