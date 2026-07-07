<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaliPpdb extends Model
{
    /** @use HasFactory<\Database\Factories\WaliPpdbFactory> */
    use HasFactory;

    protected $table = 'wali_ppdb';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pendaftaran_ppdb_id',
        'nama',
        'nik',
        'telepon',
        'hubungan',
    ];

    /**
     * Get the registration this wali belongs to.
     */
    public function pendaftaranPpdb(): BelongsTo
    {
        return $this->belongsTo(PendaftaranPpdb::class);
    }
}
