<?php

namespace App\Http\Controllers;

use App\Http\Requests\TahunAjaranRequest;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TahunAjaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('tahun-ajaran/index', [
            'tahunAjaran' => TahunAjaran::orderBy('nama')->get(['id', 'nama', 'tahun_mulai', 'status_aktif']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * status_aktif is saved as-is from the request; TahunAjaran::booted()
     * already deactivates every other row when this one is active, so
     * that logic must not be duplicated here.
     */
    public function store(TahunAjaranRequest $request): RedirectResponse
    {
        TahunAjaran::create($request->validated());

        return to_route('tahun-ajaran.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TahunAjaranRequest $request, TahunAjaran $tahunAjaran): RedirectResponse
    {
        $tahunAjaran->update($request->validated());

        return to_route('tahun-ajaran.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TahunAjaran $tahunAjaran): RedirectResponse
    {
        if ($tahunAjaran->gelombangPpdb()->exists()) {
            return back()->with('error', 'Tahun ajaran ini masih memiliki gelombang PPDB, tidak bisa dihapus.');
        }

        $tahunAjaran->delete();

        return to_route('tahun-ajaran.index');
    }
}
