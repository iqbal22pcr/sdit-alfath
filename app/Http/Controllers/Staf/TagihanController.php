<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\BayarLangsungRequest;
use App\Http\Requests\Staf\BuatTagihanRequest;
use App\Models\KomponenBiaya;
use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TagihanController extends Controller
{
    /**
     * Display a paginated, searchable, filterable listing of every
     * tagihan, latest first, plus the reference data (active siswa,
     * every komponen_biaya, every tahun_ajaran) the "+ Buat Tagihan"
     * dialog and the filter dropdowns need. Bayar and Detail actions
     * both live on this same list -- the status/jenis breakdown
     * charts moved to the staf_keuangan dashboard and stay there.
     *
     * search/status/jenis/tahun_ajaran_id/overdue all come from the
     * query string (not client-side filtering) and are echoed back as
     * `filters` so the page can keep its inputs in sync with the URL
     * across pagination/search round-trips.
     *
     * status accepts "semua", "belum_lunas" (a pseudo-value covering
     * both belum_bayar and sebagian at once, for the staf_keuangan
     * dashboard's "Tagihan Belum Lunas" card), or a real status value.
     *
     * overdue=1 is independent of status: it means jenis "masuk",
     * status != lunas, and jatuh_tempo already past -- used by the
     * dashboard's "Uang Masuk Terlambat" card link. It composes with
     * whatever else is in the query string rather than replacing it.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status', 'semua');
        $jenis = $request->query('jenis', 'semua');
        $tahunAjaranId = $request->query('tahun_ajaran_id', 'semua');
        $overdue = $request->boolean('overdue');

        $tagihan = Tagihan::query()
            ->select(['id', 'siswa_id', 'komponen_biaya_id', 'nomor_tagihan', 'nominal', 'terbayar', 'status', 'created_at'])
            ->with(['siswa:id,nama', 'komponenBiaya:id,nama,jenis'])
            ->when($search !== '', fn ($query) => $query->where(function ($q) use ($search) {
                $q->where('nomor_tagihan', 'like', "%{$search}%")
                    ->orWhereHas('siswa', fn ($q2) => $q2->where('nama', 'like', "%{$search}%"));
            }))
            ->when($status === 'belum_lunas', fn ($query) => $query->where('status', '!=', 'lunas'))
            ->when($status !== 'semua' && $status !== 'belum_lunas', fn ($query) => $query->where('status', $status))
            ->when($jenis !== 'semua', fn ($query) => $query->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', $jenis)))
            ->when($tahunAjaranId !== 'semua', fn ($query) => $query->where('tahun_ajaran_id', $tahunAjaranId))
            ->when($overdue, fn ($query) => $query->where('status', '!=', 'lunas')
                ->whereNotNull('jatuh_tempo')
                ->where('jatuh_tempo', '<', now()->startOfDay())
                ->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', 'masuk')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staf/tagihan', [
            'tagihan' => $tagihan,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'jenis' => $jenis,
                'tahun_ajaran_id' => $tahunAjaranId,
                'overdue' => $overdue,
            ],
            'siswaAktif' => Siswa::where('status', 'aktif')->orderBy('nama')->get(['id', 'nama']),
            'komponenBiaya' => KomponenBiaya::orderBy('nama')->get(['id', 'nama', 'jenis', 'nominal_dasar', 'berulang']),
            'tahunAjaran' => TahunAjaran::orderByDesc('tahun_mulai')->get(['id', 'nama']),
        ]);
    }

    /**
     * Manually create a single tagihan for one siswa. Always tied to
     * whichever tahun_ajaran is currently active -- there's no other
     * context (e.g. a gelombang) to derive it from for an ad-hoc
     * tagihan created outside the PPDB flow. Bulk per-month generation
     * for every siswa is intentionally not built yet.
     *
     * nomor_tagihan follows the same insert-then-patch pattern used
     * everywhere else a row's own id feeds its own unique number (see
     * Siswa::buatTagihanUntukJenis()).
     */
    public function store(BuatTagihanRequest $request): RedirectResponse
    {
        $tahunAjaran = TahunAjaran::where('status_aktif', true)->first();

        if (! $tahunAjaran) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif, tidak bisa membuat tagihan baru.');
        }

        $komponen = KomponenBiaya::findOrFail($request->validated('komponen_biaya_id'));

        DB::transaction(function () use ($request, $tahunAjaran, $komponen) {
            // nomor_tagihan is NOT NULL + unique, but its final value
            // depends on the row's own id, so a temporary unique
            // placeholder is inserted first and overwritten right after.
            $tagihan = Tagihan::create([
                'siswa_id' => $request->validated('siswa_id'),
                'tahun_ajaran_id' => $tahunAjaran->id,
                'komponen_biaya_id' => $komponen->id,
                'nomor_tagihan' => (string) Str::uuid(),
                'bulan_tagihan' => $komponen->berulang ? $request->validated('bulan_tagihan') : null,
                'tahun_tagihan' => $komponen->berulang ? $request->validated('tahun_tagihan') : now()->year,
                'nominal' => $request->validated('nominal'),
                'terbayar' => 0,
                'status' => 'belum_bayar',
            ]);

            $tagihan->update([
                'nomor_tagihan' => sprintf('TGH-%s-%06d', $tahunAjaran->nama, $tagihan->id),
            ]);
        });

        return to_route('staf.tagihan.index')->with('success', 'Tagihan berhasil dibuat.');
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

            $this->cobaAktivasiOtomatis($tagihan);
        });

        return to_route('staf.tagihan.index')->with('success', 'Pembayaran berhasil dicatat.');
    }

    /**
     * After a payment completes a tagihan, check whether it was the
     * last piece needed to auto-activate the siswa it belongs to.
     *
     * Failures here must never undo the payment that was just
     * recorded -- they're caught, logged, and surfaced to staf as a
     * warning instead.
     */
    private function cobaAktivasiOtomatis(Tagihan $tagihan): void
    {
        /** @var Siswa|null $siswa */
        $siswa = $tagihan->siswa;

        if (! $siswa || ! $siswa->bisaAktivasiOtomatis()) {
            return;
        }

        try {
            $siswa->aktivasiOtomatis();
        } catch (Throwable $e) {
            // Full message + stack trace go to the log for developers
            // to diagnose -- the raw exception (which can contain SQL,
            // password hashes, etc.) must never reach the flash message
            // a staf user sees.
            Log::error('Aktivasi otomatis siswa gagal.', [
                'siswa_id' => $siswa->id,
                'tagihan_id' => $tagihan->id,
                'exception' => $e,
            ]);

            session()->flash(
                'warning',
                'Pembayaran berhasil, tapi aktivasi otomatis siswa gagal. Cek log server untuk detail.'
            );
        }
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
