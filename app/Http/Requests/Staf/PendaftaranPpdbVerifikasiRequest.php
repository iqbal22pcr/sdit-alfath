<?php

namespace App\Http\Requests\Staf;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PendaftaranPpdbVerifikasiRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['diterima', 'ditolak', 'perlu_perbaikan'])],
            'kategori_siswa_id' => [
                Rule::requiredIf(fn () => $this->input('status') === 'diterima'),
                'nullable',
                Rule::exists('kategori_siswa', 'id'),
            ],
            'catatan_verifikasi' => [
                Rule::requiredIf(fn () => $this->input('status') === 'perlu_perbaikan'),
                'nullable',
                'string',
            ],
        ];
    }
}
