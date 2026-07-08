<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * rencana_cicilan_id cascades on delete on purpose: an item
     * cicilan means nothing without its rencana, unlike tagihan or
     * rencana_cicilan themselves which are blocked from deletion.
     */
    public function up(): void
    {
        Schema::create('item_cicilan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rencana_cicilan_id')->constrained('rencana_cicilan')->cascadeOnDelete();
            $table->unsignedTinyInteger('cicilan_ke');
            $table->date('jatuh_tempo');
            $table->unsignedInteger('nominal');
            $table->enum('status', ['belum_bayar', 'lunas'])->default('belum_bayar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_cicilan');
    }
};
