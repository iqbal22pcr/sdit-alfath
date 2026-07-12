<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GelombangPpdbController;
use App\Http\Controllers\KategoriSiswaController;
use App\Http\Controllers\KuotaKategoriController;
use App\Http\Controllers\PendaftaranPpdbController;
use App\Http\Controllers\Siswa\DashboardController as SiswaDashboardController;
use App\Http\Controllers\Staf\AktivasiSiswaController;
use App\Http\Controllers\Staf\DashboardPpdbController;
use App\Http\Controllers\Staf\PendaftaranPpdbController as StafPendaftaranPpdbController;
use App\Http\Controllers\Staf\TagihanController;
use App\Http\Controllers\TahunAjaranController;
use App\Http\Controllers\Wali\DashboardController as WaliDashboardController;
use App\Http\Controllers\Wali\TagihanController as WaliTagihanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('ppdb/konfirmasi/{pendaftaran_ppdb}', [PendaftaranPpdbController::class, 'konfirmasi'])->name('ppdb.konfirmasi');
});

Route::middleware(['auth', 'wali'])->group(function () {
    Route::get('ppdb/daftar', [PendaftaranPpdbController::class, 'create'])->name('ppdb.create');
    Route::post('ppdb/daftar', [PendaftaranPpdbController::class, 'store'])->name('ppdb.store');
    Route::get('ppdb/pendaftaran', [PendaftaranPpdbController::class, 'pendaftaran'])->name('ppdb.pendaftaran');
    Route::get('ppdb/{pendaftaran_ppdb}/perbaiki', [PendaftaranPpdbController::class, 'edit'])->name('ppdb.perbaiki');
    Route::put('ppdb/{pendaftaran_ppdb}/perbaiki', [PendaftaranPpdbController::class, 'update'])->name('ppdb.perbaiki.update');

    Route::get('wali/dashboard', [WaliDashboardController::class, 'index'])->name('wali.dashboard');

    Route::get('wali/tagihan', [WaliTagihanController::class, 'index'])->name('wali.tagihan.index');
    Route::get('wali/tagihan/{tagihan}', [WaliTagihanController::class, 'show'])->name('wali.tagihan.show');
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

    Route::get('staf/aktivasi-bermasalah', [AktivasiSiswaController::class, 'index'])->name('staf.aktivasi-bermasalah');
    Route::post('staf/aktivasi-bermasalah/{siswa}/coba-lagi', [AktivasiSiswaController::class, 'cobaLagi'])->name('staf.aktivasi-bermasalah.coba-lagi');
});

Route::middleware(['auth', 'staf-keuangan'])->group(function () {
    Route::get('staf/tagihan', [TagihanController::class, 'index'])->name('staf.tagihan.index');
    Route::get('staf/tagihan/{tagihan}', [TagihanController::class, 'show'])->name('staf.tagihan.show');
    Route::post('staf/tagihan/{tagihan}/bayar-langsung', [TagihanController::class, 'bayarLangsung'])->name('staf.tagihan.bayar-langsung.store');
});

Route::middleware(['auth', 'siswa'])->group(function () {
    Route::get('siswa/dashboard', [SiswaDashboardController::class, 'index'])->name('siswa.dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
