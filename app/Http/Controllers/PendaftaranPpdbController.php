<?php

namespace App\Http\Controllers;

use App\Http\Requests\PendaftaranPpdbRequest;
use App\Models\GelombangPpdb;
use App\Models\PendaftaranPpdb;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PendaftaranPpdbController extends Controller
{
    /**
     * Document types that may be attached to a registration.
     */
    private const JENIS_DOKUMEN = [
        'akta',
        'kartu_keluarga',
        'ktp_orangtua',
        'pas_foto',
        'surat_kematian_ayah',
        'surat_keterangan_tidak_mampu',
    ];

    /**
     * Show the registration form, or a "not open" page if no gelombang
     * is currently accepting registrations.
     */
    public function create(): Response
    {
        $gelombang = $this->resolveOpenGelombang();

        if (! $gelombang) {
            return Inertia::render('ppdb/belum-dibuka');
        }

        return Inertia::render('ppdb/daftar', [
            'gelombang' => [
                'id' => $gelombang->id,
                'nama' => $gelombang->nama,
            ],
        ]);
    }

    /**
     * Store a new registration together with its wali and dokumen rows.
     */
    public function store(PendaftaranPpdbRequest $request): RedirectResponse|Response
    {
        $gelombang = $this->resolveOpenGelombang();

        if (! $gelombang) {
            return Inertia::render('ppdb/belum-dibuka');
        }

        $pendaftaran = DB::transaction(function () use ($request, $gelombang) {
            // nomor_pendaftaran is NOT NULL + unique, but its final value
            // depends on the row's own id, so a temporary unique
            // placeholder is inserted first and overwritten right after.
            $pendaftaran = PendaftaranPpdb::create([
                'user_id' => $request->user()->id,
                'gelombang_ppdb_id' => $gelombang->id,
                'nomor_pendaftaran' => (string) Str::uuid(),
                'nama_pendaftar' => $request->validated('nama_pendaftar'),
                'tempat_lahir' => $request->validated('tempat_lahir'),
                'tanggal_lahir' => $request->validated('tanggal_lahir'),
                'jenis_kelamin' => $request->validated('jenis_kelamin'),
                'alamat' => $request->validated('alamat'),
                'status_ayah' => $request->validated('status_ayah'),
                'penghasilan_tetap' => $request->boolean('penghasilan_tetap'),
                'punya_saudara_di_sekolah' => $request->boolean('punya_saudara_di_sekolah'),
                'nama_saudara' => $request->validated('nama_saudara'),
                'status' => 'diajukan',
            ]);

            $pendaftaran->update([
                'nomor_pendaftaran' => sprintf('PPDB-%s-%06d', $gelombang->tahunAjaran->nama, $pendaftaran->id),
            ]);

            foreach ($request->validated('wali') as $wali) {
                $pendaftaran->waliPpdb()->create($wali);
            }

            foreach (self::JENIS_DOKUMEN as $jenis) {
                if (! $request->hasFile("dokumen.{$jenis}")) {
                    continue;
                }

                $file = $request->file("dokumen.{$jenis}");
                $path = $file->storeAs(
                    "dokumen-ppdb/{$pendaftaran->id}",
                    "{$jenis}.{$file->getClientOriginalExtension()}",
                    'public'
                );

                $pendaftaran->dokumenPpdb()->create([
                    'jenis_dokumen' => $jenis,
                    'berkas' => $path,
                ]);
            }

            return $pendaftaran;
        });

        return to_route('ppdb.konfirmasi', $pendaftaran);
    }

    /**
     * Show the confirmation page with the generated nomor_pendaftaran.
     */
    public function konfirmasi(PendaftaranPpdb $pendaftaranPpdb): Response
    {
        abort_unless($pendaftaranPpdb->user_id === request()->user()->id, 403);

        return Inertia::render('ppdb/konfirmasi', [
            'nomorPendaftaran' => $pendaftaranPpdb->nomor_pendaftaran,
            'namaPendaftar' => $pendaftaranPpdb->nama_pendaftar,
        ]);
    }

    /**
     * List every registration the logged-in user has ever submitted.
     */
    public function riwayat(): Response
    {
        $pendaftaran = PendaftaranPpdb::where('user_id', request()->user()->id)
            ->latest()
            ->get(['id', 'nomor_pendaftaran', 'nama_pendaftar', 'status', 'created_at']);

        return Inertia::render('ppdb/riwayat', [
            'pendaftaran' => $pendaftaran,
        ]);
    }

    /**
     * Find the gelombang currently open for registration, if any.
     */
    private function resolveOpenGelombang(): ?GelombangPpdb
    {
        return GelombangPpdb::openNow()->orderBy('tanggal_mulai')->first();
    }
}
