<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSupplierRequest;
use App\Http\Requests\Api\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    /**
     * GET /api/suppliers
     */
    public function index(): JsonResponse
    {
        $suppliers = Supplier::orderBy('name')->get();

        return response()->json(['data' => $suppliers]);
    }

    /**
     * POST /api/suppliers
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = Supplier::create($request->validated());

        return response()->json(['data' => $supplier], 201);
    }

    /**
     * GET /api/suppliers/{supplier}
     */
    public function show(Supplier $supplier): JsonResponse
    {
        return response()->json(['data' => $supplier]);
    }

    /**
     * PUT/PATCH /api/suppliers/{supplier}
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $supplier->update($request->validated());

        return response()->json(['data' => $supplier]);
    }

    /**
     * DELETE /api/suppliers/{supplier}
     */
    public function destroy(Supplier $supplier): JsonResponse
    {
        if ($supplier->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a supplier that has associated products.',
            ], 422);
        }

        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted.']);
    }
}
