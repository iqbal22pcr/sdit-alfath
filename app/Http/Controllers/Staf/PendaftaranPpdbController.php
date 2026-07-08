<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\PendaftaranPpdbVerifikasiRequest;
use App\Models\KuotaKategori;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use App\Models\Tagihan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
            'siswa.tagihan.komponenBiaya:id,nama,jenis',
        ]);

        return Inertia::render('staf/ppdb-verifikasi', [
            'pendaftaran' => $pendaftaranPpdb,
            'kuotaKategori' => $this->kuotaKategoriUntukGelombang($pendaftaranPpdb),
            'finalisasi' => $this->finalisasiInfo($pendaftaranPpdb->siswa),
        ]);
    }

    /**
     * Verify a registration: accept, reject, or send back for revision.
     *
     * Accepting a registration immediately converts it into a siswa
     * row in the same transaction -- there's no separate staff action
     * for that anymore.
     */
    public function verifikasi(PendaftaranPpdbVerifikasiRequest $request, PendaftaranPpdb $pendaftaranPpdb): RedirectResponse
    {
        if (in_array($pendaftaranPpdb->status, ['diterima', 'ditolak'], true)) {
            return back()->with('error', "Pendaftaran ini sudah berstatus final ({$pendaftaranPpdb->status}), tidak bisa diverifikasi ulang.");
        }

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

        DB::transaction(function () use ($pendaftaranPpdb, $status, $kategoriSiswaId, $request) {
            $pendaftaranPpdb->update([
                'status' => $status,
                'kategori_siswa_id' => $kategoriSiswaId,
                'diverifikasi_oleh' => $request->user()->id,
            ]);

            if ($status === 'diterima') {
                $pendaftaranPpdb->konversiJadiSiswa();
            }
        });

        return to_route('staf.ppdb-dashboard')->with('success', 'Status pendaftaran berhasil diperbarui.');
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

    /**
     * Compute whether the siswa tied to this pendaftaran (if any) can
     * be finalized yet, and why not if it can't -- so the "Finalisasi
     * Siswa" button on the frontend can be disabled with a clear
     * reason up front, instead of only failing after the staff clicks
     * it.
     *
     * @return array<string, mixed>|null
     */
    private function finalisasiInfo(?Siswa $siswa): ?array
    {
        if (! $siswa) {
            return null;
        }

        if ($siswa->status !== 'calon') {
            return [
                'siswa_id' => $siswa->id,
                'status_siswa' => $siswa->status,
                'bisa' => false,
                'alasan' => "Siswa berstatus \"{$siswa->status}\", tidak perlu difinalisasi.",
            ];
        }

        $belumLunas = $siswa->tagihan
            ->filter(fn (Tagihan $tagihan) => in_array($tagihan->komponenBiaya->jenis, ['buku', 'seragam'], true) && $tagihan->status !== 'lunas')
            ->pluck('komponenBiaya.nama');

        return [
            'siswa_id' => $siswa->id,
            'status_siswa' => $siswa->status,
            'bisa' => $belumLunas->isEmpty(),
            'alasan' => $belumLunas->isNotEmpty() ? 'Belum bisa difinalisasi: '.$belumLunas->implode(', ').' belum lunas.' : null,
        ];
    }
}
