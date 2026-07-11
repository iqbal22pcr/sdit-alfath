<?php

namespace App\Http\Controllers\Wali;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagihanController extends Controller
{
    /**
     * List every tagihan billed to a siswa connected to the logged-in
     * wali's account, via the pendaftaran_ppdb they originally
     * submitted. Grouped by siswa first, then newest first.
     */
    public function index(Request $request): Response
    {
        $tagihan = Tagihan::query()
            ->whereHas('siswa.pendaftaranPpdb', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['siswa:id,nama', 'komponenBiaya:id,nama,jenis'])
            ->orderBy('siswa_id')
            ->latest()
            ->get(['id', 'siswa_id', 'komponen_biaya_id', 'nomor_tagihan', 'nominal', 'terbayar', 'status', 'jatuh_tempo', 'created_at']);

        return Inertia::render('wali/tagihan', [
            'tagihan' => $tagihan,
        ]);
    }

    /**
     * Show one tagihan's detail and payment history, read-only.
     *
     * Ownership is checked here directly (not just relying on index()
     * scoping), through the same siswa->pendaftaranPpdb->user_id
     * relation -- a wali could otherwise view any tagihan by guessing
     * its id.
     */
    public function show(Request $request, Tagihan $tagihan): Response
    {
        abort_unless(
            $tagihan->siswa->pendaftaranPpdb()->where('user_id', $request->user()->id)->exists(),
            403
        );

        $tagihan->load([
            'siswa:id,nama,nis',
            'komponenBiaya:id,nama,jenis',
            'pembayaran' => fn ($q) => $q->orderByDesc('tanggal_bayar')->orderByDesc('id'),
        ]);

        return Inertia::render('wali/tagihan-show', [
            'tagihan' => $tagihan,
        ]);
    }
}
