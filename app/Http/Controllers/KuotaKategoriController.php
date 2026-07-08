<?php

namespace App\Http\Controllers;

use App\Http\Requests\KuotaKategoriRequest;
use App\Models\GelombangPpdb;
use App\Models\KuotaKategori;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class KuotaKategoriController extends Controller
{
    /**
     * Create or update the kuota for every kategori_siswa within a
     * gelombang_ppdb in one request, all in a single transaction.
     */
    public function store(KuotaKategoriRequest $request, GelombangPpdb $gelombangPpdb): RedirectResponse
    {
        DB::transaction(function () use ($request, $gelombangPpdb) {
            foreach ($request->validated('kuota') as $baris) {
                KuotaKategori::updateOrCreate(
                    [
                        'gelombang_ppdb_id' => $gelombangPpdb->id,
                        'kategori_siswa_id' => $baris['kategori_siswa_id'],
                    ],
                    [
                        'kuota' => $baris['kuota'],
                    ]
                );
            }
        });

        return to_route('gelombang-ppdb.show', $gelombangPpdb)->with('success', 'Kuota berhasil disimpan.');
    }
}
