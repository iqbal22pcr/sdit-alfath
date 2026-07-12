<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Models\GelombangPpdb;
use App\Models\KuotaKategori;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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
                'siswaPerluAktivasi' => [],
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

        // Siswa still "calon" but already past both onboarding gates
        // (buku + seragam lunas) should have been auto-activated by
        // TagihanController::bayarLangsung() the moment the last one
        // was paid -- ending up here means that attempt failed and,
        // since neither gate has an unpaid tagihan left to trigger a
        // retry, it never will again on its own.
        $siswaPerluAktivasi = Siswa::query()
            ->where('status', 'calon')
            ->whereHas('pendaftaranPpdb', fn ($q) => $q->where('gelombang_ppdb_id', $gelombang->id))
            ->get(['id', 'nama', 'status'])
            ->filter(fn (Siswa $siswa) => $siswa->bisaAktivasiOtomatis())
            ->map(fn (Siswa $siswa) => ['id' => $siswa->id, 'nama' => $siswa->nama])
            ->values();

        return Inertia::render('staf/ppdb-dashboard', [
            'gelombang' => [
                'id' => $gelombang->id,
                'nama' => $gelombang->nama,
            ],
            'kuotaPerKategori' => $kuotaPerKategori,
            'statusBreakdown' => $statusBreakdown,
            'pendaftaran' => $pendaftaran,
            'siswaPerluAktivasi' => $siswaPerluAktivasi,
        ]);
    }

    /**
     * Manually retry activation for a single siswa stuck past both
     * onboarding gates. Re-checks bisaAktivasiOtomatis() defensively so
     * a stale button (e.g. two staf racing) can never activate a siswa
     * that doesn't actually qualify.
     */
    public function cobaAktivasi(Siswa $siswa): RedirectResponse
    {
        if (! $siswa->bisaAktivasiOtomatis()) {
            return back()->with('error', 'Siswa ini belum (atau sudah tidak) memenuhi syarat aktivasi otomatis.');
        }

        try {
            $siswa->aktivasiOtomatis();
        } catch (Throwable $e) {
            // Full message + stack trace go to the log for developers
            // to diagnose -- the raw exception (which can contain SQL,
            // etc.) must never reach the flash message a staf user sees.
            Log::error('Aktivasi otomatis siswa gagal (percobaan ulang manual dari Dashboard PPDB).', [
                'siswa_id' => $siswa->id,
                'exception' => $e,
            ]);

            return back()->with('error', 'Aktivasi gagal. Cek log server untuk detail.');
        }

        return back()->with('success', 'Siswa berhasil diaktivasi.');
    }
}
