<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'      => ['required', 'integer', 'exists:products,id'],
            'quantity'        => ['required', 'integer', 'min:1'],
            'received_date'   => ['required', 'date', 'before_or_equal:today'],
            'expiration_date' => ['nullable', 'date', 'after:received_date'],
            'batch_number'    => ['nullable', 'string', 'max:100'],
            'location'        => ['nullable', 'string', 'max:255'],
            'unit_cost'       => ['nullable', 'numeric', 'min:0'],
            'notes'           => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'expiration_date.required_if' => 'An expiration date is required for perishable products.',
        ];
    }
}
