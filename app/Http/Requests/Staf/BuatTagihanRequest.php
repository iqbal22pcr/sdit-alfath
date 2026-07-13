<?php

namespace App\Http\Requests\Staf;

use App\Models\KomponenBiaya;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BuatTagihanRequest extends FormRequest
{
    /**
     * bulan_tagihan/tahun_tagihan are only required when the selected
     * komponen_biaya is berulang (SPP) -- for a one-off komponen
     * (buku/seragam/masuk) the controller defaults them instead
     * (bulan_tagihan null, tahun_tagihan = current year), matching how
     * Siswa::buatTagihanUntukJenis() treats non-recurring tagihan.
     */
    public function rules(): array
    {
        $komponen = KomponenBiaya::find($this->input('komponen_biaya_id'));
        $berulang = $komponen?->berulang ?? false;

        return [
            'siswa_id' => ['required', Rule::exists('siswa', 'id')->where('status', 'aktif')],
            'komponen_biaya_id' => ['required', Rule::exists('komponen_biaya', 'id')],
            'bulan_tagihan' => [Rule::requiredIf($berulang), 'nullable', 'integer', 'between:1,12'],
            'tahun_tagihan' => [Rule::requiredIf($berulang), 'nullable', 'integer', 'digits:4'],
            'nominal' => ['required', 'integer', 'min:1'],
        ];
    }
}
