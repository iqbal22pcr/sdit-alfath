<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\AturCicilanRequest;
use App\Models\Tagihan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
}
