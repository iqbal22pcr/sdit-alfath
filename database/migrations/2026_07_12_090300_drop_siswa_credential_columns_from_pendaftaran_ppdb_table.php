<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Rollback of the separate siswa-account feature: the wali no
     * longer picks a login username/password for their child during
     * PPDB registration.
     */
    public function up(): void
    {
        // SQLite's native ALTER TABLE DROP COLUMN (used by the test
        // suite) errors if a unique index still references the column,
        // unlike MySQL which drops a column's own index automatically
        // -- so the unique index is dropped explicitly first.
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->dropUnique(['username_siswa']);
        });

        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->dropColumn(['username_siswa', 'password_siswa']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->string('username_siswa')->nullable()->after('catatan_verifikasi');
            $table->string('password_siswa')->nullable()->after('username_siswa');
        });

        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->unique('username_siswa');
        });
    }
};
