<?php

namespace Database\Seeders;

use App\Models\KomponenBiaya;
use Illuminate\Database\Seeder;

class KomponenBiayaSeeder extends Seeder
{
    /**
     * Seed the komponen_biaya table.
     *
     * nominal_dasar untuk beberapa baris di bawah masih PLACEHOLDER,
     * menunggu konfirmasi nominal resmi dari sekolah -- jangan
     * dianggap final.
     */
    public function run(): void
    {
        $komponen = [
            [
                'nama' => 'SPP Bulanan',
                'jenis' => 'spp',
                // PLACEHOLDER: menunggu konfirmasi sekolah.
                'nominal_dasar' => 300000,
                'berulang' => true,
            ],
            [
                'nama' => 'Uang Masuk',
                'jenis' => 'masuk',
                // NULL disengaja: harga diambil dari
                // gelombang_ppdb.biaya_masuk, bukan dari sini.
                'nominal_dasar' => null,
                'berulang' => false,
            ],
            [
                'nama' => 'Uang Buku',
                'jenis' => 'buku',
                // PLACEHOLDER: menunggu konfirmasi sekolah.
                'nominal_dasar' => 500000,
                'berulang' => false,
            ],
            [
                'nama' => 'Uang Seragam',
                'jenis' => 'seragam',
                // PLACEHOLDER: menunggu konfirmasi sekolah.
                'nominal_dasar' => 750000,
                'berulang' => false,
            ],
        ];

        foreach ($komponen as $item) {
            KomponenBiaya::updateOrCreate(
                ['nama' => $item['nama']],
                [
                    'jenis' => $item['jenis'],
                    'nominal_dasar' => $item['nominal_dasar'],
                    'berulang' => $item['berulang'],
                ]
            );
        }
    }
}
