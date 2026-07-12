<?php

use App\Models\GelombangPpdb;
use App\Models\KomponenBiaya;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Build a pendaftaran_ppdb -> siswa chain, with buku + seragam tagihan
 * in the given status, all under a gelombang that's currently open. No
 * factories exist for these models in this repo, so every row is
 * created directly via Eloquent::create().
 */
function buatSiswaCalonDenganOnboarding(GelombangPpdb $gelombang, string $nama, string $statusBuku, string $statusSeragam): Siswa
{
    $wali = User::factory()->create(['role' => 'wali_murid']);

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

    $siswa = Siswa::create([
        'pendaftaran_ppdb_id' => $pendaftaran->id,
        'nama' => $nama,
        'nis' => 'NIS-'.Str::random(8),
        'status' => 'calon',
    ]);

    foreach (['buku' => $statusBuku, 'seragam' => $statusSeragam] as $jenis => $status) {
        $komponen = KomponenBiaya::create([
            'nama' => 'Komponen '.Str::random(6),
            'jenis' => $jenis,
            'nominal_dasar' => 100000,
            'berulang' => false,
        ]);

        $siswa->tagihan()->create([
            'tahun_ajaran_id' => $gelombang->tahun_ajaran_id,
            'komponen_biaya_id' => $komponen->id,
            'nomor_tagihan' => 'TGH-'.Str::random(10),
            'bulan_tagihan' => null,
            'tahun_tagihan' => 2025,
            'jatuh_tempo' => null,
            'nominal' => 100000,
            'terbayar' => $status === 'lunas' ? 100000 : 0,
            'status' => $status,
        ]);
    }

    return $siswa;
}

function buatGelombangDibuka(): GelombangPpdb
{
    $tahunAjaran = TahunAjaran::create([
        'nama' => '2025/2026-'.Str::random(6),
        'tahun_mulai' => 2025,
        'status_aktif' => true,
    ]);

    // aktivasiOtomatis() -> buatTagihanMasuk() looks up a jenis "masuk"
    // komponen_biaya unconditionally, so every gelombang built here
    // needs one available even for tests that never touch it directly.
    KomponenBiaya::create([
        'nama' => 'Uang Masuk '.Str::random(6),
        'jenis' => 'masuk',
        'nominal_dasar' => null,
        'berulang' => false,
    ]);

    return GelombangPpdb::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'nama' => 'Gelombang '.Str::random(6),
        'tanggal_mulai' => now()->subMonth(),
        'tanggal_selesai' => now()->addMonth(),
        'biaya_masuk' => 500000,
        'status_buka' => true,
    ]);
}

test('ppdb dashboard flags a calon siswa whose onboarding tagihan are both lunas', function () {
    $staf = User::factory()->create(['role' => 'staf_ppdb']);
    $gelombang = buatGelombangDibuka();
    $siswa = buatSiswaCalonDenganOnboarding($gelombang, 'Fajar', 'lunas', 'lunas');

    $response = $this->actingAs($staf)->get(route('staf.ppdb-dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('staf/ppdb-dashboard')
        ->has('siswaPerluAktivasi', 1)
        ->where('siswaPerluAktivasi.0.id', $siswa->id)
        ->where('siswaPerluAktivasi.0.nama', 'Fajar')
    );
});

test('ppdb dashboard does not flag a calon siswa still missing an onboarding payment', function () {
    $staf = User::factory()->create(['role' => 'staf_ppdb']);
    $gelombang = buatGelombangDibuka();
    buatSiswaCalonDenganOnboarding($gelombang, 'Gita', 'lunas', 'belum_bayar');

    $response = $this->actingAs($staf)->get(route('staf.ppdb-dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('staf/ppdb-dashboard')
        ->has('siswaPerluAktivasi', 0)
    );
});

test('staf can manually retry activation for a flagged siswa', function () {
    $staf = User::factory()->create(['role' => 'staf_ppdb']);
    $gelombang = buatGelombangDibuka();
    $siswa = buatSiswaCalonDenganOnboarding($gelombang, 'Hana', 'lunas', 'lunas');

    $response = $this->actingAs($staf)->post(route('staf.ppdb-dashboard.coba-aktivasi', $siswa));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($siswa->fresh()->status)->toBe('aktif');
    expect($siswa->fresh()->tagihan()->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', 'masuk'))->exists())->toBeTrue();
});

test('retrying activation for a siswa that is not actually eligible does nothing and flashes an error', function () {
    $staf = User::factory()->create(['role' => 'staf_ppdb']);
    $gelombang = buatGelombangDibuka();
    $siswa = buatSiswaCalonDenganOnboarding($gelombang, 'Indra', 'lunas', 'belum_bayar');

    $response = $this->actingAs($staf)->post(route('staf.ppdb-dashboard.coba-aktivasi', $siswa));

    $response->assertRedirect();
    $response->assertSessionHas('error');

    expect($siswa->fresh()->status)->toBe('calon');
});
