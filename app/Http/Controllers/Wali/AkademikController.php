<?php

namespace App\Http\Controllers\Wali;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AkademikController extends Controller
{
    /**
     * Entry point for the wali's academic section. Only "aktif" siswa
     * are considered -- a "calon" child has nothing academic to show
     * yet. A wali with exactly one aktif child skips straight to that
     * child's detail; two or more get a picker; zero get an empty
     * state.
     */
    public function index(Request $request): Response
    {
        $siswaAktif = Siswa::query()
            ->whereHas('pendaftaranPpdb', fn ($q) => $q->where('user_id', $request->user()->id))
            ->where('status', 'aktif')
            ->get(['id', 'nama']);

        if ($siswaAktif->count() === 1) {
            return $this->renderDetail($siswaAktif->first());
        }

        return Inertia::render('wali/akademik', [
            'siswa' => $siswaAktif,
        ]);
    }

    /**
     * Show a single child's academic detail.
     *
     * Ownership is checked here directly (not just relying on index()
     * scoping), through the same siswa->pendaftaranPpdb->user_id
     * relation used across the other wali controllers -- a wali could
     * otherwise view any child's page by guessing its id.
     */
    public function show(Request $request, Siswa $siswa): Response
    {
        abort_unless(
            $siswa->pendaftaranPpdb()->where('user_id', $request->user()->id)->exists(),
            403
        );

        return $this->renderDetail($siswa);
    }

    /**
     * The academic module itself (jadwal, absensi, nilai) doesn't
     * exist yet, so this only ever renders a placeholder for now.
     */
    private function renderDetail(Siswa $siswa): Response
    {
        return Inertia::render('wali/akademik-detail', [
            'siswa' => [
                'id' => $siswa->id,
                'nama' => $siswa->nama,
            ],
        ]);
    }
}
