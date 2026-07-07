<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TahunAjaran extends Model
{
    /** @use HasFactory<\Database\Factories\TahunAjaranFactory> */
    use HasFactory;

    protected $table = 'tahun_ajaran';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'status_aktif',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status_aktif' => 'boolean',
        ];
    }

    /**
     * The "booted" method of the model.
     *
     * MySQL doesn't support partial unique indexes, so "only one
     * tahun ajaran can be active at a time" can't be enforced purely
     * at the schema level. This guard deactivates every other row
     * before the currently-saving row (the one being activated) is
     * persisted, so two rows are never active at once.
     */
    protected static function booted(): void
    {
        static::saving(function (TahunAjaran $tahunAjaran) {
            if (! $tahunAjaran->status_aktif) {
                return;
            }

            DB::transaction(function () use ($tahunAjaran) {
                static::query()
                    ->when($tahunAjaran->exists, fn ($query) => $query->whereKeyNot($tahunAjaran->getKey()))
                    ->where('status_aktif', true)
                    ->update(['status_aktif' => false]);
            });
        });
    }
}
