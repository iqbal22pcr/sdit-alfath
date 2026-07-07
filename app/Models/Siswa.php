<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * Create the re-registration (daftar ulang) billing for this siswa.
     *
     * TODO: Menunggu tabel tagihan/penetapan_spp dibangun di Fase
     * Keuangan. Method ini adalah titik ekstensi resmi untuk logic itu
     * -- JANGAN taruh logic tagihan daftar ulang di controller manapun
     * kalau nanti diimplementasi.
     */
    public function buatTagihanDaftarUlang(): void
    {
        // TODO: implementasikan di Fase Keuangan.
    }
}
