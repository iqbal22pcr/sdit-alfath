<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriSiswa extends Model
{
    /** @use HasFactory<\Database\Factories\KategoriSiswaFactory> */
    use HasFactory;

    protected $table = 'kategori_siswa';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'persentase_diskon',
        'deskripsi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'persentase_diskon' => 'integer',
        ];
    }

    /**
     * Get the kuota rows set for this kategori across all gelombang.
     */
    public function kuotaKategori(): HasMany
    {
        return $this->hasMany(KuotaKategori::class);
    }

    /**
     * Get the PPDB registrations assigned to this kategori.
     */
    public function pendaftaranPpdb(): HasMany
    {
        return $this->hasMany(PendaftaranPpdb::class);
    }

    /**
     * Get the siswa records assigned to this kategori.
     */
    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }
}
