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
     * Create the re-registration (daftar ulang) billing for this siswa.
     *
     * Titik ekstensi resmi untuk logic tagihan daftar ulang -- JANGAN
     * taruh logic ini di controller manapun.
     *
     * Idempotent: kalau siswa ini sudah punya tagihan dengan komponen
     * biaya jenis "masuk", method ini tidak membuat baris baru, cukup
     * mengembalikan yang sudah ada (mis. dipanggil ulang lewat
     * konversiJadiSiswa() yang double-clicked).
     */
    public function buatTagihanDaftarUlang(): Tagihan
    {
        return DB::transaction(function () {
            $komponenMasuk = KomponenBiaya::where('jenis', 'masuk')->firstOrFail();

            $existing = $this->tagihan()
                ->where('komponen_biaya_id', $komponenMasuk->id)
                ->first();

            if ($existing) {
                return $existing;
            }

            $gelombang = $this->pendaftaranPpdb->gelombangPpdb;

            // nomor_tagihan is NOT NULL + unique, but its final value
            // depends on the row's own id, so a temporary unique
            // placeholder is inserted first and overwritten right after.
            $tagihan = $this->tagihan()->create([
                'tahun_ajaran_id' => $gelombang->tahun_ajaran_id,
                'komponen_biaya_id' => $komponenMasuk->id,
                'nomor_tagihan' => (string) Str::uuid(),
                'bulan_tagihan' => null,
                'tahun_tagihan' => now()->year,
                // Snapshot dari gelombang_ppdb.biaya_masuk, BUKAN dari
                // komponen_biaya.nominal_dasar (yang tidak dipakai
                // untuk jenis "masuk").
                'nominal' => $gelombang->biaya_masuk,
                'terbayar' => 0,
                'status' => 'belum_bayar',
            ]);

            $tagihan->update([
                'nomor_tagihan' => sprintf('TGH-%s-%06d', $gelombang->tahunAjaran->nama, $tagihan->id),
            ]);

            return $tagihan;
        });
    }
}
