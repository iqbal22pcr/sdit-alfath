<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
