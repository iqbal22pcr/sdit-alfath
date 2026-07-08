<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemCicilan extends Model
{
    /** @use HasFactory<\Database\Factories\ItemCicilanFactory> */
    use HasFactory;

    protected $table = 'item_cicilan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'rencana_cicilan_id',
        'cicilan_ke',
        'jatuh_tempo',
        'nominal',
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
            'cicilan_ke' => 'integer',
            'jatuh_tempo' => 'date',
            'nominal' => 'integer',
        ];
    }

    /**
     * Get the rencana cicilan this item belongs to.
     */
    public function rencanaCicilan(): BelongsTo
    {
        return $this->belongsTo(RencanaCicilan::class);
    }
}
