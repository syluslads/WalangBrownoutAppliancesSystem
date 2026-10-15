<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreProductRequest;
use App\Http\Requests\Api\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Supports optional query params: ?category_id=&supplier_id=&is_active=&search=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category:id,name', 'supplier:id,name'])
            ->orderBy('name');

        // Optional filters
        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->query('category_id'));
        }
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', (int) $request->query('supplier_id'));
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('search')) {
            $term = '%' . $request->query('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', $term)
                  ->orWhere('sku', 'LIKE', $term);
            });
        }

        $perPage   = (int) ($request->query('per_page', 25));
        $paginated = $query->paginate($perPage);
        $paginated->getCollection()->transform(fn (Product $p) => $this->productPayload($p));

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * POST /api/products
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());
        $product->load(['category:id,name', 'supplier:id,name']);

        return response()->json(['data' => $this->productPayload($product)], 201);
    }

    /**
     * GET /api/products/{product}
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['category:id,name', 'supplier:id,name']);

        return response()->json(['data' => $this->productPayload($product)]);
    }

    /**
     * PUT/PATCH /api/products/{product}
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());
        $product->load(['category:id,name', 'supplier:id,name']);

        return response()->json(['data' => $this->productPayload($product)]);
    }

    /**
     * DELETE /api/products/{product}
     * Soft-deactivate instead of hard delete to preserve audit history.
     */
    public function destroy(Product $product): JsonResponse
    {
        // Hard delete is blocked if inventory batches exist — preserve audit trail.
        if ($product->batches()->exists()) {
            // Deactivate instead of deleting so transaction history is not orphaned.
            $product->update(['is_active' => false]);

            return response()->json([
                'message' => 'Product has inventory records and cannot be deleted. It has been deactivated instead.',
                'data'    => $this->productPayload($product->fresh(['category:id,name', 'supplier:id,name'])),
            ]);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function productPayload(Product $product): array
    {
        return [
            'id'              => $product->id,
            'sku'             => $product->sku,
            'name'            => $product->name,
            'description'     => $product->description,
            'category'        => $product->category,
            'supplier'        => $product->supplier,
            'unit'            => $product->unit,
            'unit_price'      => $product->unit_price,
            'is_perishable'   => $product->is_perishable,
            'is_seasonal'     => $product->is_seasonal,
            'abc_class'       => $product->abc_class ?? 'C',
            'reorder_point'   => $product->reorder_point,
            'safety_stock'    => $product->safety_stock,
            'max_stock_level' => $product->max_stock_level,
            'current_stock'   => $product->currentStock(),
            'is_active'       => $product->is_active,
            'created_at'      => $product->created_at,
            'updated_at'      => $product->updated_at,
        ];
    }
}
