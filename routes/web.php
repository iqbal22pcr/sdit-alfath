<?php

use App\Http\Controllers\GelombangPpdbController;
use App\Http\Controllers\KategoriSiswaController;
use App\Http\Controllers\KuotaKategoriController;
use App\Http\Controllers\PendaftaranPpdbController;
use App\Http\Controllers\Staf\DashboardPpdbController;
use App\Http\Controllers\Staf\PendaftaranPpdbController as StafPendaftaranPpdbController;
use App\Http\Controllers\Staf\SiswaController as StafSiswaController;
use App\Http\Controllers\Staf\TagihanController;
use App\Http\Controllers\TahunAjaranController;
use App\Http\Controllers\Wali\SiswaController as WaliSiswaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('ppdb/daftar', [PendaftaranPpdbController::class, 'create'])->name('ppdb.create');
    Route::post('ppdb/daftar', [PendaftaranPpdbController::class, 'store'])->name('ppdb.store');
    Route::get('ppdb/konfirmasi/{pendaftaran_ppdb}', [PendaftaranPpdbController::class, 'konfirmasi'])->name('ppdb.konfirmasi');
    Route::get('ppdb/riwayat', [PendaftaranPpdbController::class, 'riwayat'])->name('ppdb.riwayat');

    Route::get('wali/siswa', [WaliSiswaController::class, 'index'])->name('wali.siswa.index');
    Route::get('wali/siswa/{siswa}', [WaliSiswaController::class, 'show'])->name('wali.siswa.show');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('kategori-siswa', KategoriSiswaController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('gelombang-ppdb', GelombangPpdbController::class)->only(['index', 'store', 'update', 'destroy', 'show']);
    Route::post('gelombang-ppdb/{gelombang_ppdb}/kuota', [KuotaKategoriController::class, 'store'])->name('gelombang-ppdb.kuota.store');

    Route::resource('tahun-ajaran', TahunAjaranController::class)->only(['index', 'store', 'update', 'destroy']);
});

Route::middleware(['auth', 'staf-ppdb'])->group(function () {
    Route::get('staf/ppdb-dashboard', [DashboardPpdbController::class, 'index'])->name('staf.ppdb-dashboard');

    Route::get('staf/ppdb/{pendaftaran_ppdb}/verifikasi', [StafPendaftaranPpdbController::class, 'show'])->name('staf.ppdb.verifikasi');
    Route::post('staf/ppdb/{pendaftaran_ppdb}/verifikasi', [StafPendaftaranPpdbController::class, 'verifikasi'])->name('staf.ppdb.verifikasi.store');

    Route::post('staf/siswa/{siswa}/finalisasi', [StafSiswaController::class, 'finalisasi'])->name('staf.siswa.finalisasi');
});

Route::middleware(['auth', 'staf-keuangan'])->group(function () {
    Route::get('staf/tagihan', [TagihanController::class, 'index'])->name('staf.tagihan.index');
    Route::get('staf/tagihan/{tagihan}', [TagihanController::class, 'show'])->name('staf.tagihan.show');
    Route::post('staf/tagihan/{tagihan}/bayar-langsung', [TagihanController::class, 'bayarLangsung'])->name('staf.tagihan.bayar-langsung.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
