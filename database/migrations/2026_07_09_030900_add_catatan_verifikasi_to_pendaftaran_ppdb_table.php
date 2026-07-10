<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Only meaningful when status is "perlu_perbaikan" -- nulled out
     * by the controller for every other status, so there's never a
     * stale note left over from an earlier verification round.
     */
    public function up(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->text('catatan_verifikasi')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->dropColumn('catatan_verifikasi');
        });
    }
};
