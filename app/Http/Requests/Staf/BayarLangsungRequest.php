<?php

namespace App\Http\Requests\Staf;

use App\Models\Tagihan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BayarLangsungRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * nominal's max is capped to the tagihan's own remaining balance
     * (nominal - terbayar), so a payment can never overshoot what's
     * actually owed. A lunas tagihan always has sisa = 0, which would
     * otherwise surface as a confusing generic "must not be greater
     * than 0" -- instead it gets a dedicated rule with a clear
     * message, checked in place of max.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Tagihan $tagihan */
        $tagihan = $this->route('tagihan');

        return [
            'nominal' => $tagihan->status === 'lunas'
                ? ['bail', 'required', 'integer', 'min:1', fn ($attribute, $value, $fail) => $fail('Tagihan ini sudah lunas.')]
                : ['required', 'integer', 'min:1', 'max:'.($tagihan->nominal - $tagihan->terbayar)],
            'tanggal_bayar' => ['required', 'date', 'before_or_equal:today'],
            'metode' => ['required', Rule::in(['tunai', 'transfer'])],
        ];
    }
}
