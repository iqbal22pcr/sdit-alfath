<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Holds the login username/password the parent chooses for their
     * child while filling out the PPDB form, before the siswa's own
     * `users` account exists -- that account only gets created once
     * the siswa is finalized as "aktif". password_siswa stores a hash,
     * never plaintext.
     */
    public function up(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->string('username_siswa')->nullable()->after('catatan_verifikasi');
            $table->string('password_siswa')->nullable()->after('username_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->dropColumn(['username_siswa', 'password_siswa']);
        });
    }
};
