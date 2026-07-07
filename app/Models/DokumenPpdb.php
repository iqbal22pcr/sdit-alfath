<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenPpdb extends Model
{
    /** @use HasFactory<\Database\Factories\DokumenPpdbFactory> */
    use HasFactory;

    protected $table = 'dokumen_ppdb';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pendaftaran_ppdb_id',
        'jenis_dokumen',
        'berkas',
        'terverifikasi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'terverifikasi' => 'boolean',
        ];
    }

    /**
     * Get the registration this document belongs to.
     */
    public function pendaftaranPpdb(): BelongsTo
    {
        return $this->belongsTo(PendaftaranPpdb::class);
    }
}
