<?php

namespace Database\Seeders;

use App\Models\KategoriSiswa;
use Illuminate\Database\Seeder;

class KategoriSiswaSeeder extends Seeder
{
    /**
     * Seed the kategori_siswa table.
     */
    public function run(): void
    {
        $kategoris = [
            [
                'nama' => 'Reguler',
                'persentase_diskon' => 0,
                'deskripsi' => 'Kategori standar tanpa potongan biaya',
            ],
            [
                'nama' => 'Anak Yatim',
                'persentase_diskon' => 50,
                'deskripsi' => 'Untuk calon siswa yang ayahnya telah meninggal dunia',
            ],
            [
                'nama' => 'Kurang Mampu',
                'persentase_diskon' => 50,
                'deskripsi' => 'Untuk calon siswa dengan kondisi ekonomi kurang mampu, dibuktikan surat keterangan',
            ],
            [
                'nama' => 'Saudara Alumni',
                'persentase_diskon' => 25,
                'deskripsi' => 'Untuk calon siswa yang memiliki saudara kandung yang masih atau pernah bersekolah di sini',
            ],
        ];

        foreach ($kategoris as $kategori) {
            KategoriSiswa::updateOrCreate(
                ['nama' => $kategori['nama']],
                [
                    'persentase_diskon' => $kategori['persentase_diskon'],
                    'deskripsi' => $kategori['deskripsi'],
                ]
            );
        }
    }
}
