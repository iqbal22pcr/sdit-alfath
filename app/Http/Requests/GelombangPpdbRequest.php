<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GelombangPpdbRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tahun_ajaran_id' => ['required', Rule::exists('tahun_ajaran', 'id')],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('gelombang_ppdb')
                    ->where(fn ($query) => $query->where('tahun_ajaran_id', $this->input('tahun_ajaran_id')))
                    ->ignore($this->route('gelombang_ppdb')),
            ],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'biaya_masuk' => ['required', 'integer', 'min:0'],
            'status_buka' => ['boolean'],
        ];
    }
}
