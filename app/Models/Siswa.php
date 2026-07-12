<?php

namespace App\Models;

use Database\Factories\SiswaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class Siswa extends Model
{
    /** @use HasFactory<SiswaFactory> */
    use HasFactory;

    protected $table = 'siswa';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pendaftaran_ppdb_id',
        'kategori_siswa_id',
        'nama',
        'nis',
        'nisn',
        'status',
    ];

    /**
     * Get the registration this siswa was converted from.
     */
    public function pendaftaranPpdb(): BelongsTo
    {
        return $this->belongsTo(PendaftaranPpdb::class);
    }

    /**
     * Get the kategori siswa assigned to this siswa.
     */
    public function kategoriSiswa(): BelongsTo
    {
        return $this->belongsTo(KategoriSiswa::class);
    }

    /**
     * Get the tagihan rows billed to this siswa.
     */
    public function tagihan(): HasMany
    {
        return $this->hasMany(Tagihan::class);
    }

    /**
     * Create the initial onboarding tagihan for this siswa: uang buku
     * and uang seragam. Uang masuk is intentionally NOT created here
     * anymore -- it's only generated once the siswa is activated, by
     * buatTagihanMasuk().
     *
     * Titik ekstensi resmi untuk logic tagihan awal -- JANGAN taruh
     * logic ini di controller manapun.
     *
     * Each of the two is independently idempotent: calling this more
     * than once (e.g. re-triggered via konversiJadiSiswa() on a
     * double-clicked button) never creates duplicate tagihan, it just
     * leaves whichever ones already exist untouched.
     */
    public function buatTagihanAwal(): void
    {
        DB::transaction(function () {
            $this->buatTagihanUntukJenis('buku', fn (KomponenBiaya $komponen) => $komponen->nominal_dasar);
            $this->buatTagihanUntukJenis('seragam', fn (KomponenBiaya $komponen) => $komponen->nominal_dasar);
        });
    }

    /**
     * Create the uang masuk tagihan for this siswa. Called once the
     * siswa is activated, not at initial registration -- nominal
     * comes from gelombang_ppdb.biaya_masuk, NOT
     * komponen_biaya.nominal_dasar (which is unused for jenis
     * "masuk"). Idempotent, same as buatTagihanUntukJenis() guarantees
     * for every jenis.
     */
    public function buatTagihanMasuk(): void
    {
        DB::transaction(function () {
            $this->buatTagihanUntukJenis('masuk', fn () => $this->pendaftaranPpdb->gelombangPpdb->biaya_masuk);
        });
    }

    /**
     * Create a single tagihan for the given komponen_biaya jenis, if
     * this siswa doesn't already have one for it.
     */
    private function buatTagihanUntukJenis(string $jenis, \Closure $resolveNominal): Tagihan
    {
        $komponen = KomponenBiaya::where('jenis', $jenis)->firstOrFail();

        if ($existing = $this->tagihan()->where('komponen_biaya_id', $komponen->id)->first()) {
            return $existing;
        }

        $gelombang = $this->pendaftaranPpdb->gelombangPpdb;

        // jatuh_tempo hanya berlaku untuk jenis "masuk" -- dikunci ke
        // 1 September tahun tahun_mulai tahun ajaran gelombang ini
        // (logic sama seperti yang dulu dipakai untuk deadline
        // cicilan, sebelum mekanisme cicilan dihapus). Kalau
        // tahun_mulai belum diisi, biarkan null daripada gagal.
        $jatuhTempo = null;

        if ($jenis === 'masuk' && $gelombang->tahunAjaran->tahun_mulai !== null) {
            $jatuhTempo = now()->setDate($gelombang->tahunAjaran->tahun_mulai, 9, 1)->startOfDay();
        }

        // nomor_tagihan is NOT NULL + unique, but its final value
        // depends on the row's own id, so a temporary unique
        // placeholder is inserted first and overwritten right after.
        $tagihan = $this->tagihan()->create([
            'tahun_ajaran_id' => $gelombang->tahun_ajaran_id,
            'komponen_biaya_id' => $komponen->id,
            'nomor_tagihan' => (string) Str::uuid(),
            'bulan_tagihan' => null,
            'tahun_tagihan' => now()->year,
            'jatuh_tempo' => $jatuhTempo,
            'nominal' => $resolveNominal($komponen),
            'terbayar' => 0,
            'status' => 'belum_bayar',
        ]);

        $tagihan->update([
            'nomor_tagihan' => sprintf('TGH-%s-%06d', $gelombang->tahunAjaran->nama, $tagihan->id),
        ]);

        return $tagihan;
    }

    /**
     * Check whether this siswa is ready for automatic activation:
     * still "calon", and has at least one uang buku tagihan AND at
     * least one uang seragam tagihan, all of which are already lunas
     * -- uang masuk is intentionally NOT part of this check, only the
     * two onboarding-gate components are.
     *
     * The "both jenis must actually exist" check is deliberate and not
     * redundant: "every remaining tagihan is lunas" is vacuously true
     * when there are zero buku/seragam tagihan to find in the first
     * place (e.g. buatTagihanAwal() partially failed), which would
     * otherwise let a siswa with no onboarding tagihan at all look
     * "ready".
     *
     * Never throws, just answers the question, so callers can poll it
     * freely (e.g. after every payment) without needing to catch
     * anything.
     */
    public function bisaAktivasiOtomatis(): bool
    {
        if ($this->status !== 'calon') {
            return false;
        }

        $tagihanOnboarding = $this->tagihan()
            ->whereHas('komponenBiaya', fn ($q) => $q->whereIn('jenis', ['buku', 'seragam']))
            ->with('komponenBiaya:id,jenis')
            ->get();

        $jenisTersedia = $tagihanOnboarding->pluck('komponenBiaya.jenis')->unique();

        if (! $jenisTersedia->contains('buku') || ! $jenisTersedia->contains('seragam')) {
            return false;
        }

        return $tagihanOnboarding->every(fn (Tagihan $tagihan) => $tagihan->status === 'lunas');
    }

    /**
     * Activate this siswa: flip status to "aktif" and generate its
     * uang masuk tagihan.
     *
     * Callers are expected to check bisaAktivasiOtomatis() first; it's
     * re-checked here defensively so a caller mistake can never
     * activate a siswa that doesn't actually qualify.
     */
    public function aktivasiOtomatis(): void
    {
        if (! $this->bisaAktivasiOtomatis()) {
            throw new RuntimeException("Siswa #{$this->id} belum memenuhi syarat aktivasi otomatis.");
        }

        DB::transaction(function () {
            $this->update(['status' => 'aktif']);

            $this->buatTagihanMasuk();
        });
    }
}
