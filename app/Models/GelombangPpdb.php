<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GelombangPpdb extends Model
{
    /** @use HasFactory<\Database\Factories\GelombangPpdbFactory> */
    use HasFactory;

    protected $table = 'gelombang_ppdb';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tahun_ajaran_id',
        'nama',
        'tanggal_mulai',
        'tanggal_selesai',
        'biaya_masuk',
        'status_buka',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'biaya_masuk' => 'integer',
            'status_buka' => 'boolean',
        ];
    }

    /**
     * Get the tahun ajaran this gelombang belongs to.
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }
}
