<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\BayarLangsungRequest;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TagihanController extends Controller
{
    /**
     * Display a listing of all tagihan, latest first.
     */
    public function index(): Response
    {
        $tagihan = Tagihan::query()
            ->with([
                'siswa:id,nama',
                'komponenBiaya:id,nama,jenis',
            ])
            ->latest()
            ->get(['id', 'siswa_id', 'komponen_biaya_id', 'nomor_tagihan', 'nominal', 'terbayar', 'status', 'created_at']);

        return Inertia::render('staf/tagihan-index', [
            'tagihan' => $tagihan,
        ]);
    }

    /**
     * Display the detail of a single tagihan.
     */
    public function show(Tagihan $tagihan): Response
    {
        $tagihan->load([
            'siswa:id,nama,nis',
            'komponenBiaya:id,nama,jenis',
            'pembayaran' => fn ($query) => $query->latest('tanggal_bayar')->latest('id'),
        ]);

        return Inertia::render('staf/tagihan-show', [
            'tagihan' => $tagihan,
        ]);
    }

    /**
     * Record a direct payment against a tagihan.
     *
     * For jenis "masuk", partial payments are still allowed (the
     * remaining-balance cap and exact-match rule both live in
     * BayarLangsungRequest). For every other jenis (spp, buku,
     * seragam) there's no cicilan mechanism anymore, so the Form
     * Request already enforces that nominal matches the remaining
     * balance exactly -- by the time we get here, a partial payment
     * on a non-"masuk" tagihan can't have passed validation.
     */
    public function bayarLangsung(BayarLangsungRequest $request, Tagihan $tagihan): RedirectResponse
    {
        if ($tagihan->status === 'lunas') {
            return back()->with('error', 'Tagihan ini sudah lunas.');
        }

        $nominal = $request->validated('nominal');

        DB::transaction(function () use ($tagihan, $request, $nominal) {
            // nomor_pembayaran is NOT NULL + unique, but its final value
            // depends on the row's own id, so a temporary unique
            // placeholder is inserted first and overwritten right after.
            $pembayaran = $tagihan->pembayaran()->create([
                'diterima_oleh' => $request->user()->id,
                'nomor_pembayaran' => (string) Str::uuid(),
                'nominal' => $nominal,
                'tanggal_bayar' => $request->validated('tanggal_bayar'),
                'metode' => $request->validated('metode'),
            ]);

            $pembayaran->update([
                'nomor_pembayaran' => sprintf('BYR-%d-%06d', now()->year, $pembayaran->id),
                'bukti_transfer' => $this->simpanBuktiTransfer($request, $pembayaran),
            ]);

            $terbayar = $tagihan->terbayar + $nominal;

            $tagihan->update([
                'terbayar' => $terbayar,
                'status' => $terbayar >= $tagihan->nominal ? 'lunas' : ($terbayar > 0 ? 'sebagian' : 'belum_bayar'),
            ]);
        });

        return to_route('staf.tagihan.show', $tagihan)->with('success', 'Pembayaran berhasil dicatat.');
    }

    /**
     * Store the uploaded bukti_transfer file for a pembayaran, if one
     * was submitted. Only required by the Form Request when metode is
     * "transfer", so this is a no-op (returns null) for tunai.
     */
    private function simpanBuktiTransfer(Request $request, Pembayaran $pembayaran): ?string
    {
        if (! $request->hasFile('bukti_transfer')) {
            return null;
        }

        $file = $request->file('bukti_transfer');

        return $file->storeAs('bukti-transfer', "{$pembayaran->id}.{$file->getClientOriginalExtension()}", 'public');
    }
}
