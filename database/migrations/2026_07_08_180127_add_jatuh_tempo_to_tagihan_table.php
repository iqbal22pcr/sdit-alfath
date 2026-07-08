<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Only populated for tagihan whose komponen_biaya.jenis is "masuk"
     * (buku/seragam/spp stay null) -- replaces the old per-cicilan
     * jatuh_tempo with a single deadline directly on the tagihan.
     */
    public function up(): void
    {
        Schema::table('tagihan', function (Blueprint $table) {
            $table->date('jatuh_tempo')->nullable()->after('tahun_tagihan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tagihan', function (Blueprint $table) {
            $table->dropColumn('jatuh_tempo');
        });
    }
};
