<?php

namespace App\Http\Requests\Staf;

use App\Models\ItemCicilan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BayarCicilanRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * nominal must match the item cicilan's own nominal exactly (the
     * "size" rule validates exact equality for numeric fields) -- a
     * cicilan item is either paid in full or not paid at all, there
     * is no partial status for individual item_cicilan rows.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var ItemCicilan $itemCicilan */
        $itemCicilan = $this->route('item_cicilan');

        return [
            'nominal' => ['required', 'integer', "size:{$itemCicilan->nominal}"],
            'tanggal_bayar' => ['required', 'date', 'before_or_equal:today'],
            'metode' => ['required', Rule::in(['tunai', 'transfer'])],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nominal.size' => 'Nominal harus persis sama dengan nominal cicilan ini, tidak boleh kurang atau lebih.',
        ];
    }
}
