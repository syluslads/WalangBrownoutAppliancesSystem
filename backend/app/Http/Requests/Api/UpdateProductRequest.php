<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'sku'           => ['sometimes', 'required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'name'          => ['sometimes', 'required', 'string', 'max:255'],
            'description'   => ['nullable', 'string', 'max:2000'],
            'category_id'   => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'supplier_id'   => ['sometimes', 'required', 'integer', 'exists:suppliers,id'],
            'unit'          => ['nullable', 'string', 'max:50'],
            'unit_price'    => ['nullable', 'numeric', 'min:0'],
            'is_perishable' => ['nullable', 'boolean'],
            'abc_class'     => ['nullable', 'string', Rule::in(['A', 'B', 'C'])],
            'reorder_point' => ['nullable', 'integer', 'min:0'],
            'safety_stock'  => ['nullable', 'integer', 'min:0'],
            'is_active'     => ['nullable', 'boolean'],
        ];
    }
}
