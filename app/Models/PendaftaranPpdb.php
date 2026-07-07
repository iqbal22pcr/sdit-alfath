<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PendaftaranPpdb extends Model
{
    /** @use HasFactory<\Database\Factories\PendaftaranPpdbFactory> */
    use HasFactory;

    protected $table = 'pendaftaran_ppdb';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'gelombang_ppdb_id',
        'kategori_siswa_id',
        'diverifikasi_oleh',
        'nomor_pendaftaran',
        'nama_pendaftar',
        'tanggal_lahir',
        'tempat_lahir',
        'jenis_kelamin',
        'alamat',
        'status_ayah',
        'penghasilan_tetap',
        'punya_saudara_di_sekolah',
        'nama_saudara',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'penghasilan_tetap' => 'boolean',
            'punya_saudara_di_sekolah' => 'boolean',
        ];
    }

    /**
     * Get the user account that submitted this registration.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the staff user who verified this registration.
     */
    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }

    /**
     * Get the gelombang PPDB this registration belongs to.
     */
    public function gelombangPpdb(): BelongsTo
    {
        return $this->belongsTo(GelombangPpdb::class);
    }

    /**
     * Get the kategori siswa assigned during verification.
     */
    public function kategoriSiswa(): BelongsTo
    {
        return $this->belongsTo(KategoriSiswa::class);
    }

    /**
     * Get the wali (guardian) records for this registration.
     */
    public function waliPpdb(): HasMany
    {
        return $this->hasMany(WaliPpdb::class);
    }

    /**
     * Get the document records for this registration.
     */
    public function dokumenPpdb(): HasMany
    {
        return $this->hasMany(DokumenPpdb::class);
    }
}
