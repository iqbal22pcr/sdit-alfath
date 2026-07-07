<?php

namespace App\Http\Requests;

use App\Models\KategoriSiswa;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KategoriSiswaRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique(KategoriSiswa::class, 'nama')->ignore($this->route('kategori_siswa')),
            ],
            'persentase_diskon' => ['required', 'integer', 'min:0', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
        ];
    }
}
