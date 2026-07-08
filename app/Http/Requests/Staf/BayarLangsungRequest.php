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
     * For jenis "masuk", partial payments are still allowed: nominal's
     * max is capped to the tagihan's own remaining balance (nominal -
     * terbayar). For every other jenis (spp, buku, seragam), there's
     * no cicilan mechanism anymore -- the tagihan must be paid off in
     * one shot, so nominal must match the remaining balance exactly
     * (the "size" rule validates exact equality for numeric fields).
     *
     * A lunas tagihan always has sisa = 0, which would otherwise
     * surface as a confusing generic "must not be greater than 0" (or
     * "must be size 0") -- instead it gets a dedicated rule with a
     * clear message, checked in place of max/size.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Tagihan $tagihan */
        $tagihan = $this->route('tagihan');

        if ($tagihan->status === 'lunas') {
            return [
                'nominal' => ['bail', 'required', 'integer', 'min:1', fn ($attribute, $value, $fail) => $fail('Tagihan ini sudah lunas.')],
                'tanggal_bayar' => ['required', 'date', 'before_or_equal:today'],
                'metode' => ['required', Rule::in(['tunai', 'transfer'])],
                'bukti_transfer' => $this->buktiTransferRules(),
            ];
        }

        $tagihan->loadMissing('komponenBiaya');
        $sisa = $tagihan->nominal - $tagihan->terbayar;
        $wajibLunasSekaligus = $tagihan->komponenBiaya->jenis !== 'masuk';

        return [
            'nominal' => $wajibLunasSekaligus
                ? ['required', 'integer', "size:{$sisa}"]
                : ['required', 'integer', 'min:1', "max:{$sisa}"],
            'tanggal_bayar' => ['required', 'date', 'before_or_equal:today'],
            'metode' => ['required', Rule::in(['tunai', 'transfer'])],
            'bukti_transfer' => $this->buktiTransferRules(),
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
            'nominal.size' => 'Tagihan ini harus dibayar lunas sekaligus, nominal harus tepat :size (sisa tagihan), tidak boleh kurang.',
        ];
    }

    /**
     * @return array<int, mixed>
     */
    private function buktiTransferRules(): array
    {
        return [
            Rule::requiredIf(fn () => $this->input('metode') === 'transfer'),
            'nullable',
            'file',
            'mimes:jpg,jpeg,png,pdf',
            'max:2048',
        ];
    }
}
