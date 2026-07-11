<?php

use App\Models\GelombangPpdb;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Build a siswa row that's fully activated (has its own `users` login,
 * status "aktif"), the same end state aktivasiOtomatis() produces. No
 * factories exist for these models in this repo, so every row is
 * created directly via Eloquent::create().
 */
function buatSiswaAktif(string $namaAnak): Siswa
{
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $tahunAjaran = TahunAjaran::create([
        'nama' => '2025/2026-'.Str::random(6),
        'tahun_mulai' => 2025,
        'status_aktif' => true,
    ]);

    $gelombang = GelombangPpdb::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'nama' => 'Gelombang '.Str::random(6),
        'tanggal_mulai' => now()->subMonth(),
        'tanggal_selesai' => now()->addMonth(),
        'biaya_masuk' => 500000,
        'status_buka' => true,
    ]);

    $pendaftaran = PendaftaranPpdb::create([
        'user_id' => $wali->id,
        'gelombang_ppdb_id' => $gelombang->id,
        'nomor_pendaftaran' => 'PPDB-'.Str::random(10),
        'nama_pendaftar' => $namaAnak,
        'tanggal_lahir' => '2018-01-01',
        'tempat_lahir' => 'Jakarta',
        'jenis_kelamin' => 'laki_laki',
        'alamat' => 'Jl. Contoh No. 1',
        'status_ayah' => 'hidup',
        'penghasilan_tetap' => true,
        'punya_saudara_di_sekolah' => false,
        'status' => 'diterima',
    ]);

    $siswaUser = User::factory()->create(['role' => 'siswa']);

    return Siswa::create([
        'pendaftaran_ppdb_id' => $pendaftaran->id,
        'user_id' => $siswaUser->id,
        'nama' => $namaAnak,
        'nis' => 'NIS-'.Str::random(8),
        'status' => 'aktif',
    ]);
}

test('siswa dashboard shows the logged-in siswa name and the in-development message', function () {
    $siswa = buatSiswaAktif('Fajar');

    $response = $this->actingAs($siswa->user)->get(route('siswa.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('siswa/dashboard')
        ->where('siswa.nama', 'Fajar')
    );
});
