<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\PendaftaranPpdbVerifikasiRequest;
use App\Models\KuotaKategori;
use App\Models\PendaftaranPpdb;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PendaftaranPpdbController extends Controller
{
    /**
     * Show the registration detail for verification.
     */
    public function show(PendaftaranPpdb $pendaftaranPpdb): Response
    {
        $pendaftaranPpdb->load([
            'user:id,name,email',
            'waliPpdb',
            'dokumenPpdb',
            'kategoriSiswa:id,nama',
            'gelombangPpdb:id,nama',
            'verifikator:id,name',
        ]);

        return Inertia::render('staf/ppdb-verifikasi', [
            'pendaftaran' => $pendaftaranPpdb,
            'kuotaKategori' => $this->kuotaKategoriUntukGelombang($pendaftaranPpdb),
            'sudahJadiSiswa' => $pendaftaranPpdb->siswa()->exists(),
        ]);
    }

    /**
     * Verify a registration: accept, reject, or send back for revision.
     */
    public function verifikasi(PendaftaranPpdbVerifikasiRequest $request, PendaftaranPpdb $pendaftaranPpdb): RedirectResponse
    {
        $status = $request->validated('status');
        $kategoriSiswaId = $request->validated('kategori_siswa_id');

        if ($status === 'diterima') {
            $kuota = KuotaKategori::where('gelombang_ppdb_id', $pendaftaranPpdb->gelombang_ppdb_id)
                ->where('kategori_siswa_id', $kategoriSiswaId)
                ->first();

            if (! $kuota) {
                return back()->with('error', 'Kuota untuk kategori ini belum diatur pada gelombang ini.');
            }

            $terpakai = PendaftaranPpdb::where('gelombang_ppdb_id', $pendaftaranPpdb->gelombang_ppdb_id)
                ->where('kategori_siswa_id', $kategoriSiswaId)
                ->where('status', 'diterima')
                ->where('id', '!=', $pendaftaranPpdb->id)
                ->count();

            if ($terpakai >= $kuota->kuota) {
                return back()->with('error', 'Kuota kategori ini pada gelombang ini sudah penuh, tidak bisa menerima pendaftar baru.');
            }
        }

        $pendaftaranPpdb->update([
            'status' => $status,
            'kategori_siswa_id' => $kategoriSiswaId,
            'diverifikasi_oleh' => $request->user()->id,
        ]);

        return to_route('staf.ppdb.verifikasi', $pendaftaranPpdb)->with('success', 'Status pendaftaran berhasil diperbarui.');
    }

    /**
     * Convert an accepted registration into a siswa row.
     */
    public function konversi(PendaftaranPpdb $pendaftaranPpdb): RedirectResponse
    {
        $pendaftaranPpdb->konversiJadiSiswa();

        return to_route('staf.ppdb.verifikasi', $pendaftaranPpdb)->with('success', 'Pendaftaran berhasil dikonversi menjadi siswa.');
    }

    /**
     * Compute kuota usage per kategori for the gelombang this
     * registration belongs to (excludes this registration's own row
     * from the "terpakai" count, per the CLAUDE.md quota rule).
     *
     * @return array<int, array<string, mixed>>
     */
    private function kuotaKategoriUntukGelombang(PendaftaranPpdb $pendaftaranPpdb): array
    {
        return KuotaKategori::where('gelombang_ppdb_id', $pendaftaranPpdb->gelombang_ppdb_id)
            ->with('kategoriSiswa:id,nama')
            ->get()
            ->map(function (KuotaKategori $kuota) use ($pendaftaranPpdb) {
                $terpakai = PendaftaranPpdb::where('gelombang_ppdb_id', $pendaftaranPpdb->gelombang_ppdb_id)
                    ->where('kategori_siswa_id', $kuota->kategori_siswa_id)
                    ->where('status', 'diterima')
                    ->where('id', '!=', $pendaftaranPpdb->id)
                    ->count();

                return [
                    'kategori_siswa_id' => $kuota->kategori_siswa_id,
                    'nama' => $kuota->kategoriSiswa->nama,
                    'kuota' => $kuota->kuota,
                    'terpakai' => $terpakai,
                    'penuh' => $terpakai >= $kuota->kuota,
                ];
            })
            ->values()
            ->all();
    }
}
