<?php

namespace App\Http\Controllers;

use App\Http\Requests\PendaftaranPpdbRequest;
use App\Http\Requests\PendaftaranPpdbUpdateRequest;
use App\Models\GelombangPpdb;
use App\Models\PendaftaranPpdb;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
     * Show the "perbaiki" (fix and resubmit) form for a registration
     * sent back for revision, pre-filled with everything on file.
     */
    public function edit(PendaftaranPpdb $pendaftaranPpdb): Response
    {
        $this->guardBolehDiperbaiki($pendaftaranPpdb);

        $pendaftaranPpdb->load(['waliPpdb', 'dokumenPpdb']);

        return Inertia::render('ppdb/perbaiki', [
            'pendaftaran' => $pendaftaranPpdb,
        ]);
    }

    /**
     * Resubmit a registration that was sent back for revision.
     *
     * Pendaftar data is replaced outright. Wali rows are fully
     * replaced (delete-then-recreate, not diffed). Dokumen are only
     * touched for jenis the wali actually re-uploaded -- everything
     * else stays exactly as it was, no forced re-upload. The
     * registration goes back into the verification queue from
     * scratch: status "diajukan", catatan_verifikasi and
     * diverifikasi_oleh both cleared.
     */
    public function update(PendaftaranPpdbUpdateRequest $request, PendaftaranPpdb $pendaftaranPpdb): RedirectResponse
    {
        $this->guardBolehDiperbaiki($pendaftaranPpdb, $request->user()->id);

        DB::transaction(function () use ($request, $pendaftaranPpdb) {
            $pendaftaranPpdb->update([
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
                'catatan_verifikasi' => null,
                'diverifikasi_oleh' => null,
            ]);

            // Full replace, not a diff -- simplest correct behaviour for
            // a short list the wali re-enters in full every time anyway.
            $pendaftaranPpdb->waliPpdb()->delete();

            foreach ($request->validated('wali') as $wali) {
                $pendaftaranPpdb->waliPpdb()->create($wali);
            }

            foreach (self::JENIS_DOKUMEN as $jenis) {
                if (! $request->hasFile("dokumen.{$jenis}")) {
                    continue;
                }

                $existing = $pendaftaranPpdb->dokumenPpdb()->where('jenis_dokumen', $jenis)->first();

                if ($existing) {
                    Storage::disk('public')->delete($existing->berkas);
                }

                $file = $request->file("dokumen.{$jenis}");
                $path = $file->storeAs(
                    "dokumen-ppdb/{$pendaftaranPpdb->id}",
                    "{$jenis}.{$file->getClientOriginalExtension()}",
                    'public'
                );

                $pendaftaranPpdb->dokumenPpdb()->updateOrCreate(
                    ['jenis_dokumen' => $jenis],
                    // A freshly-uploaded file is by definition unverified,
                    // even if the file it replaced had been verified.
                    ['berkas' => $path, 'terverifikasi' => false]
                );
            }
        });

        return to_route('ppdb.riwayat')->with('success', 'Perbaikan pendaftaran berhasil dikirim ulang.');
    }

    /**
     * Ownership + status guard shared by edit() and update(): only the
     * wali who submitted this pendaftaran may touch it, and only while
     * it's actually awaiting revision.
     */
    private function guardBolehDiperbaiki(PendaftaranPpdb $pendaftaranPpdb, ?int $userId = null): void
    {
        abort_unless($pendaftaranPpdb->user_id === ($userId ?? request()->user()->id), 403);

        abort_unless(
            $pendaftaranPpdb->status === 'perlu_perbaikan',
            422,
            'Pendaftaran ini tidak sedang menunggu perbaikan, tidak bisa diedit.'
        );
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
            ->get(['id', 'nomor_pendaftaran', 'nama_pendaftar', 'status', 'catatan_verifikasi', 'created_at']);

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
