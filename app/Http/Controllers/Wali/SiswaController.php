<?php

namespace App\Http\Controllers\Wali;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiswaController extends Controller
{
    /**
     * List every siswa connected to the logged-in wali's account, via
     * the pendaftaran_ppdb they originally submitted.
     */
    public function index(Request $request): Response
    {
        $siswa = Siswa::query()
            ->whereHas('pendaftaranPpdb', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with('kategoriSiswa:id,nama')
            ->get(['id', 'kategori_siswa_id', 'nama', 'nis', 'status']);

        return Inertia::render('wali/siswa-index', [
            'siswa' => $siswa,
        ]);
    }

    /**
     * Show one siswa's tagihan and payment history.
     *
     * Ownership is re-checked here through the same relation used by
     * index(), rather than trusting the route model binding alone --
     * a wali could otherwise view any siswa by guessing its id.
     */
    public function show(Request $request, Siswa $siswa): Response
    {
        abort_unless(
            $siswa->pendaftaranPpdb()->where('user_id', $request->user()->id)->exists(),
            403
        );

        $siswa->load([
            'kategoriSiswa:id,nama',
            'tagihan' => fn ($q) => $q->latest(),
            'tagihan.komponenBiaya:id,nama,jenis',
        ]);

        $pembayaran = Pembayaran::query()
            ->whereHas('tagihan', fn ($q) => $q->where('siswa_id', $siswa->id))
            ->with('tagihan:id,nomor_tagihan')
            ->orderByDesc('tanggal_bayar')
            ->orderByDesc('id')
            ->get(['id', 'tagihan_id', 'nomor_pembayaran', 'nominal', 'tanggal_bayar', 'metode']);

        return Inertia::render('wali/siswa-show', [
            'siswa' => $siswa,
            'pembayaran' => $pembayaran,
        ]);
    }
}
