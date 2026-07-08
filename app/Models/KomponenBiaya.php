<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KomponenBiaya extends Model
{
    /** @use HasFactory<\Database\Factories\KomponenBiayaFactory> */
    use HasFactory;

    protected $table = 'komponen_biaya';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'jenis',
        'nominal_dasar',
        'berulang',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nominal_dasar' => 'integer',
            'berulang' => 'boolean',
        ];
    }

    /**
     * nominal_dasar is NULL for jenis "masuk" on purpose: harga uang
     * masuk selalu diambil dari gelombang_ppdb.biaya_masuk pada
     * gelombang pendaftaran siswa yang bersangkutan, bukan dari kolom
     * ini. Untuk jenis lain (spp, buku, seragam), nominal_dasar WAJIB
     * diisi karena itu satu-satunya sumber harga.
     */
}
