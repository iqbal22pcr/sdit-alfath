<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Siswa extends Model
{
    /** @use HasFactory<\Database\Factories\SiswaFactory> */
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
     * Promote this siswa from "calon" to fully "aktif".
     *
     * Guarded on two fronts: the siswa must currently be "calon" (a
     * siswa that's already aktif/alumni/keluar has no business being
     * re-finalized), and every uang buku / uang seragam tagihan must
     * already be lunas -- uang masuk is intentionally NOT part of
     * this check, only the two onboarding-gate components are.
     */
    public function finalisasi(): void
    {
        abort_unless(
            $this->status === 'calon',
            422,
            "Siswa ini berstatus \"{$this->status}\", bukan calon siswa, tidak bisa difinalisasi."
        );

        $belumLunas = $this->tagihan()
            ->whereHas('komponenBiaya', fn ($q) => $q->whereIn('jenis', ['buku', 'seragam']))
            ->where('status', '!=', 'lunas')
            ->with('komponenBiaya:id,nama')
            ->get();

        if ($belumLunas->isNotEmpty()) {
            $namaKomponen = $belumLunas->pluck('komponenBiaya.nama')->implode(', ');

            abort(422, "Belum bisa difinalisasi: {$namaKomponen} belum lunas.");
        }

        $this->update(['status' => 'aktif']);
    }
}
