<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KuotaKategoriRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kuota' => ['required', 'array', 'min:1'],
            'kuota.*.kategori_siswa_id' => ['required', Rule::exists('kategori_siswa', 'id')],
            'kuota.*.kuota' => ['required', 'integer', 'min:0'],
        ];
    }
}
