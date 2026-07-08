<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\AturCicilanRequest;
use App\Http\Requests\Staf\BayarCicilanRequest;
use App\Http\Requests\Staf\BayarLangsungRequest;
use App\Models\ItemCicilan;
use App\Models\Tagihan;
use Illuminate\Http\RedirectResponse;
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
                'rencanaCicilan:id,tagihan_id',
            ])
            ->latest()
            ->get(['id', 'siswa_id', 'komponen_biaya_id', 'nomor_tagihan', 'nominal', 'terbayar', 'status', 'created_at']);

        return Inertia::render('staf/tagihan-index', [
            'tagihan' => $tagihan,
        ]);
    }

    /**
     * Display the detail of a single tagihan, including its rencana
     * cicilan and item cicilan, if any have been set up.
     */
    public function show(Tagihan $tagihan): Response
    {
        $tagihan->load([
            'siswa:id,nama,nis',
            'komponenBiaya:id,nama,jenis',
            'rencanaCicilan.itemCicilan',
        ]);

        return Inertia::render('staf/tagihan-show', [
            'tagihan' => $tagihan,
        ]);
    }

    /**
     * Set up an installment plan (rencana cicilan) for a tagihan.
     *
     * Cicilan only makes sense for jenis "masuk" (biaya masuk), for a
     * tagihan that doesn't already have a plan, and that isn't fully
     * paid off yet.
     */
    public function aturCicilan(AturCicilanRequest $request, Tagihan $tagihan): RedirectResponse
    {
        $tagihan->loadMissing('komponenBiaya');

        if ($tagihan->komponenBiaya->jenis !== 'masuk') {
            return back()->with('error', 'Cicilan hanya berlaku untuk tagihan uang masuk.');
        }

        if ($tagihan->rencanaCicilan()->exists()) {
            return back()->with('error', 'Tagihan ini sudah punya rencana cicilan.');
        }

        if ($tagihan->status === 'lunas') {
            return back()->with('error', 'Tagihan ini sudah lunas, tidak perlu rencana cicilan.');
        }

        $jumlahCicilan = $request->validated('jumlah_cicilan');

        DB::transaction(function () use ($tagihan, $request, $jumlahCicilan) {
            $rencana = $tagihan->rencanaCicilan()->create([
                'dibuat_oleh' => $request->user()->id,
                'jumlah_cicilan' => $jumlahCicilan,
            ]);

            // Bagi rata nominal ke tiap cicilan; sisa pembagian yang
            // tidak bulat dibebankan ke cicilan terakhir, supaya total
            // seluruh item_cicilan tetap persis sama dengan
            // tagihan.nominal.
            $nominalPerCicilan = intdiv($tagihan->nominal, $jumlahCicilan);
            $sisa = $tagihan->nominal - ($nominalPerCicilan * $jumlahCicilan);

            for ($ke = 1; $ke <= $jumlahCicilan; $ke++) {
                $rencana->itemCicilan()->create([
                    'cicilan_ke' => $ke,
                    'jatuh_tempo' => now()->addDays(30 * $ke),
                    'nominal' => $nominalPerCicilan + ($ke === $jumlahCicilan ? $sisa : 0),
                    'status' => 'belum_bayar',
                ]);
            }
        });

        return to_route('staf.tagihan.show', $tagihan)->with('success', 'Rencana cicilan berhasil dibuat.');
    }

    /**
     * Record a direct payment against a tagihan that has no rencana
     * cicilan (e.g. SPP, buku, seragam, or an uang masuk tagihan
     * someone chose not to put on an installment plan).
     */
    public function bayarLangsung(BayarLangsungRequest $request, Tagihan $tagihan): RedirectResponse
    {
        if ($tagihan->status === 'lunas') {
            return back()->with('error', 'Tagihan ini sudah lunas.');
        }

        if ($tagihan->rencanaCicilan()->exists()) {
            return back()->with('error', 'Tagihan ini punya rencana cicilan, bayar per cicilan bukan langsung.');
        }

        $nominal = $request->validated('nominal');

        DB::transaction(function () use ($tagihan, $request, $nominal) {
            // nomor_pembayaran is NOT NULL + unique, but its final value
            // depends on the row's own id, so a temporary unique
            // placeholder is inserted first and overwritten right after.
            $pembayaran = $tagihan->pembayaran()->create([
                'item_cicilan_id' => null,
                'diterima_oleh' => $request->user()->id,
                'nomor_pembayaran' => (string) Str::uuid(),
                'nominal' => $nominal,
                'tanggal_bayar' => $request->validated('tanggal_bayar'),
                'metode' => $request->validated('metode'),
            ]);

            $pembayaran->update([
                'nomor_pembayaran' => sprintf('BYR-%d-%06d', now()->year, $pembayaran->id),
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
     * Record a payment settling one specific item cicilan in full.
     */
    public function bayarCicilan(BayarCicilanRequest $request, ItemCicilan $itemCicilan): RedirectResponse
    {
        if ($itemCicilan->status === 'lunas') {
            return back()->with('error', 'Cicilan ini sudah lunas.');
        }

        $itemCicilan->loadMissing('rencanaCicilan.tagihan');
        $rencana = $itemCicilan->rencanaCicilan;
        $tagihan = $rencana->tagihan;
        $nominal = $request->validated('nominal');

        DB::transaction(function () use ($itemCicilan, $rencana, $tagihan, $request, $nominal) {
            $pembayaran = $tagihan->pembayaran()->create([
                'item_cicilan_id' => $itemCicilan->id,
                'diterima_oleh' => $request->user()->id,
                'nomor_pembayaran' => (string) Str::uuid(),
                'nominal' => $nominal,
                'tanggal_bayar' => $request->validated('tanggal_bayar'),
                'metode' => $request->validated('metode'),
            ]);

            $pembayaran->update([
                'nomor_pembayaran' => sprintf('BYR-%d-%06d', now()->year, $pembayaran->id),
            ]);

            $itemCicilan->update(['status' => 'lunas']);

            $terbayar = $rencana->itemCicilan()->where('status', 'lunas')->sum('nominal');
            $semuaLunas = ! $rencana->itemCicilan()->where('status', '!=', 'lunas')->exists();

            $tagihan->update([
                'terbayar' => $terbayar,
                'status' => $semuaLunas ? 'lunas' : 'sebagian',
            ]);
        });

        return to_route('staf.tagihan.show', $tagihan)->with('success', 'Pembayaran cicilan berhasil dicatat.');
    }
}
