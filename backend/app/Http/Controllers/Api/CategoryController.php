<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCategoryRequest;
use App\Http\Requests\Api\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * List all categories (any authenticated user can read).
     */
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * POST /api/categories
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json(['data' => $category], 201);
    }

    /**
     * GET /api/categories/{category}
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json(['data' => $category]);
    }

    /**
     * PUT/PATCH /api/categories/{category}
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json(['data' => $category]);
    }

    /**
     * DELETE /api/categories/{category}
     * Blocked if any products are linked (restrictOnDelete on migration).
     */
    public function destroy(Category $category): JsonResponse
    {
        // Guard: refuse deletion when products exist under this category.
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that has associated products.',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
