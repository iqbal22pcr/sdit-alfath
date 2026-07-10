<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Nullable because a siswa row starts out "calon" with no login
     * account at all -- the account only gets created once the siswa
     * is finalized as "aktif". Left at the default RESTRICT (no
     * cascade), same principle as kategori_siswa_id/pendaftaran_ppdb_id
     * on this table: a siswa's linked login account must never
     * silently disappear because of a user deletion elsewhere.
     */
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->unique()->after('pendaftaran_ppdb_id')->constrained('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
