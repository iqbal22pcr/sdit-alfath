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
 * Build a pendaftaran_ppdb row owned by the given wali, optionally
 * converted into a siswa with a set of tagihan. No factories exist for
 * these models in this repo, so every row is created via Eloquent::create().
 */
function buatPendaftaran(User $wali, string $nama, string $statusPendaftaran = 'diterima'): PendaftaranPpdb
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

    return PendaftaranPpdb::create([
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
        'status' => $statusPendaftaran,
    ]);
}

function konversiJadiSiswa(PendaftaranPpdb $pendaftaran, string $status = 'calon'): Siswa
{
    return Siswa::create([
        'pendaftaran_ppdb_id' => $pendaftaran->id,
        'nama' => $pendaftaran->nama_pendaftar,
        'nis' => 'NIS-'.Str::random(8),
        'status' => $status,
    ]);
}

function buatTagihan(Siswa $siswa, TahunAjaran $tahunAjaran, string $jenis, string $status, ?string $jatuhTempo = null, int $nominal = 100000): Tagihan
{
    $komponen = KomponenBiaya::create([
        'nama' => 'Komponen '.Str::random(6),
        'jenis' => $jenis,
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
        'jatuh_tempo' => $jatuhTempo,
        'nominal' => $nominal,
        'terbayar' => $status === 'lunas' ? $nominal : 0,
        'status' => $status,
    ]);
}

test('wali dashboard shows progress for a calon child with one of two syarat met', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    $pendaftaran = buatPendaftaran($wali, 'Ani');
    $siswa = konversiJadiSiswa($pendaftaran, 'calon');
    $tahunAjaran = $pendaftaran->gelombangPpdb->tahunAjaran;

    buatTagihan($siswa, $tahunAjaran, 'buku', 'lunas');
    buatTagihan($siswa, $tahunAjaran, 'seragam', 'belum_bayar');

    $response = $this->actingAs($wali)->get(route('wali.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/dashboard')
        ->where('jumlahAnak', 1)
        ->where('anak.0.nama', 'Ani')
        ->where('anak.0.konteks.jenis', 'progres_aktivasi')
        ->where('anak.0.konteks.terpenuhi', 1)
        ->where('anak.0.konteks.total', 2)
    );
});

test('wali dashboard shows tunggakan summary for an aktif child', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    $pendaftaran = buatPendaftaran($wali, 'Budi');
    $siswa = konversiJadiSiswa($pendaftaran, 'aktif');
    $tahunAjaran = $pendaftaran->gelombangPpdb->tahunAjaran;

    buatTagihan($siswa, $tahunAjaran, 'spp', 'belum_bayar', null, 150000);

    $response = $this->actingAs($wali)->get(route('wali.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/dashboard')
        ->where('jumlahTagihanBelumLunas', 1)
        ->where('totalTunggakan', 150000)
        ->where('anak.0.konteks.jenis', 'tunggakan')
        ->where('anak.0.konteks.jumlah_tagihan', 1)
        ->where('anak.0.konteks.total_tunggakan', 150000)
    );
});

test('wali dashboard shows verification status for a pendaftaran not yet converted to siswa', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    buatPendaftaran($wali, 'Citra', 'diajukan');

    $response = $this->actingAs($wali)->get(route('wali.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/dashboard')
        ->where('anak.0.nama', 'Citra')
        ->where('anak.0.tipe', 'pendaftaran')
        ->where('anak.0.status', 'diajukan')
        ->where('anak.0.konteks', null)
    );
});

test('wali dashboard shows empty state for a wali with no children', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $response = $this->actingAs($wali)->get(route('wali.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/dashboard')
        ->where('jumlahAnak', 0)
        ->where('anak', [])
    );
});

test('wali dashboard shows the jatuh tempo alert only when a masuk tagihan is due within 14 days', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    $pendaftaran = buatPendaftaran($wali, 'Dewi');
    $siswa = konversiJadiSiswa($pendaftaran, 'calon');
    $tahunAjaran = $pendaftaran->gelombangPpdb->tahunAjaran;

    buatTagihan($siswa, $tahunAjaran, 'masuk', 'belum_bayar', now()->addDays(5)->toDateString());

    $response = $this->actingAs($wali)->get(route('wali.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/dashboard')
        ->has('alertJatuhTempo', 1)
        ->where('alertJatuhTempo.0.namaAnak', 'Dewi')
    );
});

test('wali dashboard does not show the jatuh tempo alert when nothing is due soon', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);
    $pendaftaran = buatPendaftaran($wali, 'Eka');
    $siswa = konversiJadiSiswa($pendaftaran, 'calon');
    $tahunAjaran = $pendaftaran->gelombangPpdb->tahunAjaran;

    // Due date far in the future -- outside the 14-day window.
    buatTagihan($siswa, $tahunAjaran, 'masuk', 'belum_bayar', now()->addDays(60)->toDateString());

    $response = $this->actingAs($wali)->get(route('wali.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('wali/dashboard')
        ->has('alertJatuhTempo', 0)
    );
});
