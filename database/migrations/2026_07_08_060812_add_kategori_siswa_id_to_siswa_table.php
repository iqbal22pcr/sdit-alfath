<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Left at the default RESTRICT (no cascade) on purpose: kategori_siswa
     * is a shared dimension, deleting one must never silently wipe the
     * kategori assignment on real siswa data.
     */
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->foreignId('kategori_siswa_id')->nullable()->after('pendaftaran_ppdb_id')->constrained('kategori_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kategori_siswa_id');
        });
    }
};
