<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku'             => ['required', 'string', 'max:100', 'unique:products,sku'],
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string', 'max:2000'],
            'category_id'     => ['required', 'integer', 'exists:categories,id'],
            'supplier_id'     => ['required', 'integer', 'exists:suppliers,id'],
            'unit'            => ['nullable', 'string', 'max:50'],
            'unit_price'      => ['nullable', 'numeric', 'min:0'],
            'is_perishable'   => ['nullable', 'boolean'],
            'is_seasonal'     => ['nullable', 'boolean'],
            'abc_class'       => ['nullable', 'string', \Illuminate\Validation\Rule::in(['A', 'B', 'C'])],
            'reorder_point'   => ['nullable', 'integer', 'min:0'],
            'max_stock_level' => ['nullable', 'integer', 'min:0'],
            'safety_stock'    => ['nullable', 'integer', 'min:0'],
            'is_active'       => ['nullable', 'boolean'],
        ];
    }
}
