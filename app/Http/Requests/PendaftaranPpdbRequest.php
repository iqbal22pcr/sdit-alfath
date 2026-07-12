<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PendaftaranPpdbRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama_pendaftar' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'jenis_kelamin' => ['required', Rule::in(['laki_laki', 'perempuan'])],
            'alamat' => ['required', 'string'],
            'status_ayah' => ['required', Rule::in(['hidup', 'meninggal'])],
            'penghasilan_tetap' => ['required', 'boolean'],
            'punya_saudara_di_sekolah' => ['required', 'boolean'],
            'nama_saudara' => [
                Rule::requiredIf(fn () => $this->boolean('punya_saudara_di_sekolah')),
                'nullable',
                'string',
                'max:255',
            ],

            'wali' => ['required', 'array', 'min:1'],
            'wali.*.nama' => ['required', 'string', 'max:255'],
            'wali.*.nik' => ['required', 'string', 'max:255'],
            'wali.*.telepon' => ['required', 'string', 'max:255'],
            'wali.*.hubungan' => ['required', Rule::in(['ayah', 'ibu', 'wali'])],

            'dokumen.akta' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'dokumen.kartu_keluarga' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'dokumen.ktp_orangtua' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'dokumen.pas_foto' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'dokumen.surat_kematian_ayah' => [
                Rule::requiredIf(fn () => $this->input('status_ayah') === 'meninggal'),
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048',
            ],
            'dokumen.surat_keterangan_tidak_mampu' => [
                Rule::requiredIf(fn () => ! $this->boolean('penghasilan_tetap')),
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048',
            ],
        ];
    }
}
