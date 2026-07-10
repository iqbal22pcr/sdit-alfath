<?php

namespace App\Http\Requests;

use App\Models\PendaftaranPpdb;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PendaftaranPpdbUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * Same shape as PendaftaranPpdbRequest (the original registration
     * form), except dokumen files are only required if this
     * pendaftaran doesn't already have one on file for that jenis --
     * the wali only needs to upload what they're actually replacing.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var PendaftaranPpdb $pendaftaranPpdb */
        $pendaftaranPpdb = $this->route('pendaftaran_ppdb');
        $existingJenis = $pendaftaranPpdb->dokumenPpdb()->pluck('jenis_dokumen')->all();

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

            'dokumen.akta' => $this->dokumenRule('akta', $existingJenis),
            'dokumen.kartu_keluarga' => $this->dokumenRule('kartu_keluarga', $existingJenis),
            'dokumen.ktp_orangtua' => $this->dokumenRule('ktp_orangtua', $existingJenis),
            'dokumen.pas_foto' => $this->dokumenRule('pas_foto', $existingJenis),
            'dokumen.surat_kematian_ayah' => $this->dokumenRule(
                'surat_kematian_ayah',
                $existingJenis,
                fn () => $this->input('status_ayah') === 'meninggal'
            ),
            'dokumen.surat_keterangan_tidak_mampu' => $this->dokumenRule(
                'surat_keterangan_tidak_mampu',
                $existingJenis,
                fn () => ! $this->boolean('penghasilan_tetap')
            ),
        ];
    }

    /**
     * Build the validation rule for one dokumen field: required only
     * when the condition (default: always) holds AND this pendaftaran
     * doesn't already have a dokumen of that jenis on file.
     *
     * @return array<int, mixed>
     */
    private function dokumenRule(string $jenis, array $existingJenis, ?\Closure $condition = null): array
    {
        $sudahAda = in_array($jenis, $existingJenis, true);

        return [
            Rule::requiredIf(fn () => ($condition ? $condition() : true) && ! $sudahAda),
            'nullable',
            'file',
            'mimes:pdf,jpg,jpeg,png',
            'max:2048',
        ];
    }
}
