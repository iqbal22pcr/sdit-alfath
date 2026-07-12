<?php

use App\Models\GelombangPpdb;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Build a siswa row (of the given status) owned by the given wali. No
 * factories exist for these models in this repo, so every row is
 * created directly via Eloquent::create().
 */
function buatSiswaWali(User $wali, string $nama, string $status = 'aktif'): Siswa
{
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
        'nama_pendaftar' => $nama,
        'tanggal_lahir' => '2018-01-01',
        'tempat_lahir' => 'Jakarta',
        'jenis_kelamin' => 'laki_laki',
        'alamat' => 'Jl. Contoh No. 1',
        'status_ayah' => 'hidup',
        'penghasilan_tetap' => true,
        'punya_saudara_di_sekolah' => false,
        'status' => 'diterima',
    ]);

    return Siswa::create([
        'pendaftaran_ppdb_id' => $pendaftaran->id,
        'nama' => $nama,
        'nis' => 'NIS-'.Str::random(8),
        'status' => $status,
    ]);
}

test('wali with no aktif children sees the empty state', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    buatSiswaWali($wali, 'Ani', 'calon');

    $response = $this->actingAs($wali)->get(route('wali.akademik'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/akademik')
        ->where('siswa', [])
    );
});

test('wali with exactly one aktif child is taken straight to that child detail', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    $siswa = buatSiswaWali($wali, 'Budi', 'aktif');
    buatSiswaWali($wali, 'Calon Lain', 'calon');

    $response = $this->actingAs($wali)->get(route('wali.akademik'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/akademik-detail')
        ->where('siswa.id', $siswa->id)
        ->where('siswa.nama', 'Budi')
    );
});

test('wali with two or more aktif children sees the picker listing only aktif ones', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    buatSiswaWali($wali, 'Citra', 'aktif');
    buatSiswaWali($wali, 'Dewi', 'aktif');
    buatSiswaWali($wali, 'Calon Lain', 'calon');

    $response = $this->actingAs($wali)->get(route('wali.akademik'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/akademik')
        ->has('siswa', 2)
    );

    $nama = collect($response->viewData('page')['props']['siswa'])->pluck('nama')->sort()->values()->all();
    expect($nama)->toBe(['Citra', 'Dewi']);
});

test('the owning wali can view a specific child academic detail directly', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    $siswa = buatSiswaWali($wali, 'Eka', 'aktif');

    $this->actingAs($wali)
        ->get(route('wali.akademik.show', $siswa))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('wali/akademik-detail')
            ->where('siswa.nama', 'Eka')
        );
});

test('a wali cannot view another wali child academic detail', function () {
    $pemilik = User::factory()->create(['role' => 'wali_murid']);
    $waliLain = User::factory()->create(['role' => 'wali_murid']);

    $siswa = buatSiswaWali($pemilik, 'Fajar', 'aktif');

    $this->actingAs($waliLain)
        ->get(route('wali.akademik.show', $siswa))
        ->assertForbidden();
});
