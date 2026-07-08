<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * tagihan_id is unique -- a tagihan can have at most one (active)
     * rencana cicilan. Left at the default RESTRICT (no cascade): a
     * rencana cicilan is real billing-plan data, it must never
     * silently vanish just because the tagihan or staff user it
     * references gets deleted.
     */
    public function up(): void
    {
        Schema::create('rencana_cicilan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')->unique()->constrained('tagihan');
            $table->foreignId('dibuat_oleh')->constrained('users');
            $table->unsignedTinyInteger('jumlah_cicilan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rencana_cicilan');
    }
};
