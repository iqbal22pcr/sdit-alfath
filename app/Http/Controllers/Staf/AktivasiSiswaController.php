<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AktivasiSiswaController extends Controller
{
    /**
     * List siswa that should have been auto-activated by now (calon,
     * no login account yet, every onboarding tagihan already lunas)
     * but weren't -- a condition that should never happen in normal
     * operation, since TagihanController::bayarLangsung() triggers
     * activation the moment the last onboarding tagihan is paid. An
     * empty list here is the expected, healthy state.
     */
    public function index(): Response
    {
        $bermasalah = Siswa::query()
            ->where('status', 'calon')
            ->whereNull('user_id')
            ->with('kategoriSiswa:id,nama')
            // status and user_id are only selected here because
            // bisaAktivasiOtomatis() reads them internally -- without
            // them the model would see status/user_id as null, and the
            // guard clause at the top of bisaAktivasiOtomatis() would
            // reject every row before it even got to the real check.
            ->get(['id', 'kategori_siswa_id', 'nama', 'nis', 'status', 'user_id'])
            ->filter(fn (Siswa $siswa) => $siswa->bisaAktivasiOtomatis())
            ->values();

        return Inertia::render('staf/aktivasi-bermasalah', [
            'siswa' => $bermasalah,
        ]);
    }

    /**
     * Manually retry activation for a single siswa stuck in the
     * bermasalah list.
     */
    public function cobaLagi(Siswa $siswa): RedirectResponse
    {
        if (! $siswa->bisaAktivasiOtomatis()) {
            return back()->with('error', 'Siswa ini belum (atau sudah tidak) memenuhi syarat aktivasi otomatis.');
        }

        try {
            $siswa->aktivasiOtomatis();
        } catch (Throwable $e) {
            // Full message + stack trace go to the log for developers
            // to diagnose -- the raw exception (which can contain SQL,
            // password hashes, etc.) must never reach the flash message
            // a staf user sees.
            Log::error('Aktivasi otomatis siswa gagal (percobaan ulang manual).', [
                'siswa_id' => $siswa->id,
                'exception' => $e,
            ]);

            return back()->with('error', 'Aktivasi gagal. Cek log server untuk detail.');
        }

        return back()->with('success', 'Siswa berhasil diaktivasi.');
    }
}
