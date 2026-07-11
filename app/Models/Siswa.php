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
        'user_id',
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
     * Get the login account for this siswa, if one has been created
     * yet (only happens once aktivasiOtomatis() activates the siswa).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
     * Create the initial onboarding tagihan for this siswa: uang
     * masuk, uang buku, and uang seragam.
     *
     * Titik ekstensi resmi untuk logic tagihan awal -- JANGAN taruh
     * logic ini di controller manapun.
     *
     * Each of the three is independently idempotent: calling this
     * more than once (e.g. re-triggered via konversiJadiSiswa() on a
     * double-clicked button) never creates duplicate tagihan, it just
     * leaves whichever ones already exist untouched.
     */
    public function buatTagihanAwal(): void
    {
        DB::transaction(function () {
            // Uang masuk: nominal comes from gelombang_ppdb.biaya_masuk,
            // NOT komponen_biaya.nominal_dasar (which is unused for
            // jenis "masuk").
            $this->buatTagihanUntukJenis('masuk', fn () => $this->pendaftaranPpdb->gelombangPpdb->biaya_masuk);

            // Uang buku and uang seragam: komponen_biaya.nominal_dasar
            // is the only source of price for these.
            $this->buatTagihanUntukJenis('buku', fn (KomponenBiaya $komponen) => $komponen->nominal_dasar);
            $this->buatTagihanUntukJenis('seragam', fn (KomponenBiaya $komponen) => $komponen->nominal_dasar);
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
     * still "calon", has no login account yet, and has at least one
     * uang buku tagihan AND at least one uang seragam tagihan, all of
     * which are already lunas -- uang masuk is intentionally NOT part
     * of this check, only the two onboarding-gate components are.
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
        if ($this->status !== 'calon' || $this->user_id !== null) {
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
     * Activate this siswa: create its login account from the
     * username/password the wali set up during PPDB registration,
     * link it, and flip status to "aktif".
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
            $pendaftaran = $this->pendaftaranPpdb;

            $user = new User;
            $user->name = $this->nama;
            $user->username = $pendaftaran->username_siswa;
            // Already a hash, produced when the wali filled in
            // password_siswa during PPDB registration -- User::password
            // also casts as 'hashed', which detects an already-hashed
            // value and stores it as-is instead of hashing it again.
            $user->password = $pendaftaran->password_siswa;
            $user->email = null;
            $user->role = 'siswa';
            $user->save();

            $this->update([
                'user_id' => $user->id,
                'status' => 'aktif',
            ]);

            // The hash now lives on users.password; no need to keep a
            // second copy here. username_siswa stays, for reference.
            $pendaftaran->update(['password_siswa' => null]);
        });
    }
}
