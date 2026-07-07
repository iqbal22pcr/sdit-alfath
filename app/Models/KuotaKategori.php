<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KuotaKategori extends Model
{
    /** @use HasFactory<\Database\Factories\KuotaKategoriFactory> */
    use HasFactory;

    protected $table = 'kuota_kategori';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'gelombang_ppdb_id',
        'kategori_siswa_id',
        'kuota',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kuota' => 'integer',
        ];
    }

    /**
     * Get the gelombang PPDB this kuota belongs to.
     */
    public function gelombangPpdb(): BelongsTo
    {
        return $this->belongsTo(GelombangPpdb::class);
    }

    /**
     * Get the kategori siswa this kuota belongs to.
     */
    public function kategoriSiswa(): BelongsTo
    {
        return $this->belongsTo(KategoriSiswa::class);
    }
}
