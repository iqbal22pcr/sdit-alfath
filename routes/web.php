<?php

use App\Http\Controllers\GelombangPpdbController;
use App\Http\Controllers\KategoriSiswaController;
use App\Http\Controllers\KuotaKategoriController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('kategori-siswa', KategoriSiswaController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('gelombang-ppdb', GelombangPpdbController::class)->only(['index', 'store', 'update', 'destroy', 'show']);
    Route::post('gelombang-ppdb/{gelombang_ppdb}/kuota', [KuotaKategoriController::class, 'store'])->name('gelombang-ppdb.kuota.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
