<?php

namespace App\Http\Controllers;

use App\Http\Requests\KuotaKategoriRequest;
use App\Models\GelombangPpdb;
use App\Models\KuotaKategori;
use Illuminate\Http\RedirectResponse;

class KuotaKategoriController extends Controller
{
    /**
     * Create or update the kuota for a kategori_siswa within a gelombang_ppdb.
     */
    public function store(KuotaKategoriRequest $request, GelombangPpdb $gelombangPpdb): RedirectResponse
    {
        KuotaKategori::updateOrCreate(
            [
                'gelombang_ppdb_id' => $gelombangPpdb->id,
                'kategori_siswa_id' => $request->validated('kategori_siswa_id'),
            ],
            [
                'kuota' => $request->validated('kuota'),
            ]
        );

        return to_route('gelombang-ppdb.show', $gelombangPpdb);
    }
}
