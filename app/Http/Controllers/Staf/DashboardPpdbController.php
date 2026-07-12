<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Models\GelombangPpdb;
use App\Models\KuotaKategori;
use App\Models\PendaftaranPpdb;
use Inertia\Inertia;
use Inertia\Response;

class DashboardPpdbController extends Controller
{
    /**
     * Display the PPDB staff dashboard: quota status and registrations
     * for the gelombang currently open, if any.
     */
    public function index(): Response
    {
        $gelombang = GelombangPpdb::openNow()->orderBy('tanggal_mulai')->first();

        if (! $gelombang) {
            return Inertia::render('staf/ppdb-dashboard', [
                'gelombang' => null,
                'kuotaPerKategori' => [],
                'statusBreakdown' => [],
                'pendaftaran' => [],
            ]);
        }

        $kuotaPerKategori = KuotaKategori::where('gelombang_ppdb_id', $gelombang->id)
            ->with('kategoriSiswa:id,nama')
            ->get()
            ->map(function (KuotaKategori $kuota) use ($gelombang) {
                $terpakai = PendaftaranPpdb::where('gelombang_ppdb_id', $gelombang->id)
                    ->where('kategori_siswa_id', $kuota->kategori_siswa_id)
                    ->where('status', 'diterima')
                    ->count();

                return [
                    'kategori' => $kuota->kategoriSiswa->nama,
                    'total' => $kuota->kuota,
                    'terpakai' => $terpakai,
                    'sisa' => max(0, $kuota->kuota - $terpakai),
                ];
            })
            ->values();

        // Fixed order (not the raw groupBy result) so the donut chart's
        // legend/segments are always in the same sequence regardless of
        // which statuses happen to have registrations right now.
        $statusUrutan = ['diajukan', 'diverifikasi', 'perlu_perbaikan', 'diterima', 'ditolak'];

        $jumlahPerStatus = PendaftaranPpdb::where('gelombang_ppdb_id', $gelombang->id)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statusBreakdown = collect($statusUrutan)
            ->map(fn (string $status) => [
                'name' => $status,
                'value' => $jumlahPerStatus->get($status, 0),
            ])
            ->values();

        $pendaftaran = PendaftaranPpdb::where('gelombang_ppdb_id', $gelombang->id)
            ->with(['user:id,name', 'waliPpdb', 'kategoriSiswa:id,nama'])
            ->latest()
            ->limit(50)
            ->get(['id', 'user_id', 'kategori_siswa_id', 'nomor_pendaftaran', 'nama_pendaftar', 'status', 'created_at']);

        return Inertia::render('staf/ppdb-dashboard', [
            'gelombang' => [
                'id' => $gelombang->id,
                'nama' => $gelombang->nama,
            ],
            'kuotaPerKategori' => $kuotaPerKategori,
            'statusBreakdown' => $statusBreakdown,
            'pendaftaran' => $pendaftaran,
        ]);
    }
}
