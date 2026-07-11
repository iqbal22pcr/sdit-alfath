<?php

use App\Models\GelombangPpdb;
use App\Models\KomponenBiaya;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Build a full pendaftaran_ppdb -> siswa -> tagihan chain owned by the
 * given wali, mirroring how a real PPDB registration converts into a
 * siswa with onboarding tagihan. No factories exist for these models in
 * this repo, so every row is created directly via Eloquent::create().
 */
function buatAnakDenganTagihan(User $wali, string $namaAnak, int $nominal = 100000): Tagihan
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

    $siswa = Siswa::create([
        'pendaftaran_ppdb_id' => $pendaftaran->id,
        'nama' => $namaAnak,
        'nis' => 'NIS-'.Str::random(8),
        'status' => 'calon',
    ]);

    $komponen = KomponenBiaya::create([
        'nama' => 'Uang Buku '.Str::random(6),
        'jenis' => 'buku',
        'nominal_dasar' => $nominal,
        'berulang' => false,
    ]);

    return Tagihan::create([
        'siswa_id' => $siswa->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'komponen_biaya_id' => $komponen->id,
        'nomor_tagihan' => 'TGH-'.Str::random(10),
        'bulan_tagihan' => null,
        'tahun_tagihan' => 2025,
        'jatuh_tempo' => null,
        'nominal' => $nominal,
        'terbayar' => 0,
        'status' => 'belum_bayar',
    ]);
}

test('wali with multiple children sees every tagihan for every child with the correct name', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $tagihanAni = buatAnakDenganTagihan($wali, 'Ani');
    $tagihanBudi = buatAnakDenganTagihan($wali, 'Budi');

    $response = $this->actingAs($wali)->get(route('wali.tagihan.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/tagihan')
        ->has('tagihan', 2)
    );

    $namaAnak = collect($response->viewData('page')['props']['tagihan'])->pluck('siswa.nama')->sort()->values()->all();
    expect($namaAnak)->toBe(['Ani', 'Budi']);

    $tagihanIds = collect($response->viewData('page')['props']['tagihan'])->pluck('id')->sort()->values()->all();
    expect($tagihanIds)->toBe(collect([$tagihanAni->id, $tagihanBudi->id])->sort()->values()->all());
});

test('wali with no children sees an empty tagihan list, not an error', function () {
    $waliTanpaAnak = User::factory()->create(['role' => 'wali_murid']);

    $response = $this->actingAs($waliTanpaAnak)->get(route('wali.tagihan.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/tagihan')
        ->has('tagihan', 0)
    );
});

test('a wali cannot view another wali child tagihan detail', function () {
    $pemilik = User::factory()->create(['role' => 'wali_murid']);
    $waliLain = User::factory()->create(['role' => 'wali_murid']);

    $tagihan = buatAnakDenganTagihan($pemilik, 'Citra');

    $this->actingAs($waliLain)
        ->get(route('wali.tagihan.show', $tagihan))
        ->assertForbidden();
});

test('the owning wali can view their child tagihan detail', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $tagihan = buatAnakDenganTagihan($wali, 'Dewi');

    $this->actingAs($wali)
        ->get(route('wali.tagihan.show', $tagihan))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('wali/tagihan-show')
            ->where('tagihan.siswa.nama', 'Dewi')
        );
});
