<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StockOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization is handled by the role middleware on the route.
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
            'reason'     => ['nullable', 'string', 'max:1000'],
            'notes'      => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'A product is required.',
            'product_id.exists'   => 'The selected product does not exist.',
            'quantity.required'   => 'A quantity is required.',
            'quantity.min'        => 'Quantity must be at least 1.',
        ];
    }
}
