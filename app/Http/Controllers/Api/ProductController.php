<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $products = $query->orderBy('name')->get();

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:255',
            'default_price' => 'required|integer|min:0',
            'unit'          => 'required|string|max:50',
            'is_active'     => 'sometimes|boolean',
        ]);

        $product = Product::create($validated);
        $product->load('category');

        return response()->json($product, 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('category');
        return response()->json($product);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'category_id'   => 'sometimes|exists:categories,id',
            'name'          => 'sometimes|required|string|max:255',
            'default_price' => 'sometimes|required|integer|min:0',
            'unit'          => 'sometimes|required|string|max:50',
            'is_active'     => 'sometimes|boolean',
        ]);

        $product->update($validated);
        $product->load('category');

        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Item berhasil dihapus.']);
    }
}
