<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\RedirectResponse;

class SiswaController extends Controller
{
    /**
     * Finalize a calon siswa into a fully active siswa, once its
     * mandatory onboarding tagihan (uang buku, uang seragam) are paid
     * in full. Guarded inside Siswa::finalisasi() itself.
     */
    public function finalisasi(Siswa $siswa): RedirectResponse
    {
        $siswa->finalisasi();

        return back()->with('success', 'Siswa berhasil difinalisasi.');
    }
}
