<?php

namespace App\Http\Controllers;

use App\Http\Requests\KategoriSiswaRequest;
use App\Models\KategoriSiswa;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class KategoriSiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('kategori-siswa/index', [
            'kategoriSiswa' => KategoriSiswa::orderBy('nama')->get(['id', 'nama', 'persentase_diskon', 'deskripsi']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KategoriSiswaRequest $request): RedirectResponse
    {
        KategoriSiswa::create($request->validated());

        return to_route('kategori-siswa.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KategoriSiswaRequest $request, KategoriSiswa $kategoriSiswa): RedirectResponse
    {
        $kategoriSiswa->update($request->validated());

        return to_route('kategori-siswa.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KategoriSiswa $kategoriSiswa): RedirectResponse
    {
        if ($kategoriSiswa->kuotaKategori()->exists()) {
            return back()->with('error', 'Kategori ini masih digunakan di pengaturan kuota, tidak bisa dihapus.');
        }

        if ($kategoriSiswa->pendaftaranPpdb()->exists()) {
            return back()->with('error', 'Kategori ini masih digunakan oleh pendaftar PPDB, tidak bisa dihapus.');
        }

        if ($kategoriSiswa->siswa()->exists()) {
            return back()->with('error', 'Kategori ini masih digunakan oleh data siswa, tidak bisa dihapus.');
        }

        $kategoriSiswa->delete();

        return to_route('kategori-siswa.index');
    }
}
