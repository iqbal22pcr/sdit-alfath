<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tagihan extends Model
{
    /** @use HasFactory<\Database\Factories\TagihanFactory> */
    use HasFactory;

    protected $table = 'tagihan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'siswa_id',
        'tahun_ajaran_id',
        'komponen_biaya_id',
        'nomor_tagihan',
        'bulan_tagihan',
        'tahun_tagihan',
        'jatuh_tempo',
        'nominal',
        'terbayar',
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
            'bulan_tagihan' => 'integer',
            'tahun_tagihan' => 'integer',
            'jatuh_tempo' => 'date',
            'nominal' => 'integer',
            'terbayar' => 'integer',
        ];
    }

    /**
     * Get the siswa this tagihan belongs to.
     */
    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    /**
     * Get the tahun ajaran this tagihan belongs to.
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    /**
     * Get the komponen biaya this tagihan was generated from.
     */
    public function komponenBiaya(): BelongsTo
    {
        return $this->belongsTo(KomponenBiaya::class);
    }

    /**
     * Get the pembayaran rows recorded against this tagihan.
     */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class);
    }
}
