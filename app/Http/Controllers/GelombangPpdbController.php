<?php

namespace App\Http\Controllers;

use App\Http\Requests\GelombangPpdbRequest;
use App\Models\GelombangPpdb;
use App\Models\KategoriSiswa;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GelombangPpdbController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('gelombang-ppdb/index', [
            'gelombangPpdb' => GelombangPpdb::with('tahunAjaran:id,nama')
                ->orderByDesc('tanggal_mulai')
                ->get(['id', 'tahun_ajaran_id', 'nama', 'tanggal_mulai', 'tanggal_selesai', 'biaya_masuk', 'status_buka']),
            'tahunAjaran' => TahunAjaran::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(GelombangPpdbRequest $request): RedirectResponse
    {
        GelombangPpdb::create($request->validated());

        return to_route('gelombang-ppdb.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(GelombangPpdbRequest $request, GelombangPpdb $gelombangPpdb): RedirectResponse
    {
        $gelombangPpdb->update($request->validated());

        return to_route('gelombang-ppdb.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GelombangPpdb $gelombangPpdb): RedirectResponse
    {
        $gelombangPpdb->delete();

        return to_route('gelombang-ppdb.index');
    }

    /**
     * Display the specified resource, together with every kategori_siswa
     * left-joined against its kuota for this gelombang so categories
     * without a kuota row yet still show up with an empty value.
     */
    public function show(GelombangPpdb $gelombangPpdb): Response
    {
        $gelombangPpdb->load('tahunAjaran:id,nama');

        $kategoriDenganKuota = KategoriSiswa::query()
            ->leftJoin('kuota_kategori', function ($join) use ($gelombangPpdb) {
                $join->on('kuota_kategori.kategori_siswa_id', '=', 'kategori_siswa.id')
                    ->where('kuota_kategori.gelombang_ppdb_id', '=', $gelombangPpdb->id);
            })
            ->orderBy('kategori_siswa.nama')
            ->get([
                'kategori_siswa.id as kategori_siswa_id',
                'kategori_siswa.nama',
                'kategori_siswa.persentase_diskon',
                'kuota_kategori.kuota',
            ]);

        return Inertia::render('gelombang-ppdb/show', [
            'gelombangPpdb' => $gelombangPpdb,
            'kategoriDenganKuota' => $kategoriDenganKuota,
        ]);
    }
}
