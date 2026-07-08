<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RencanaCicilan extends Model
{
    /** @use HasFactory<\Database\Factories\RencanaCicilanFactory> */
    use HasFactory;

    protected $table = 'rencana_cicilan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tagihan_id',
        'dibuat_oleh',
        'jumlah_cicilan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jumlah_cicilan' => 'integer',
        ];
    }

    /**
     * Get the tagihan this rencana cicilan belongs to.
     */
    public function tagihan(): BelongsTo
    {
        return $this->belongsTo(Tagihan::class);
    }

    /**
     * Get the staff user who created this rencana cicilan.
     */
    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    /**
     * Get the item cicilan rows that belong to this rencana.
     */
    public function itemCicilan(): HasMany
    {
        return $this->hasMany(ItemCicilan::class);
    }
}
