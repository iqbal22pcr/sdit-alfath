<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * username_siswa is picked by the parent during PPDB registration,
     * but the real `users` account for that siswa isn't created until
     * the siswa is later finalized as "aktif" -- so a uniqueness check
     * against `users` alone can't catch two different registrants
     * choosing the same username before either of them is finalized.
     * A plain unique index (no explicit null handling needed) still
     * allows any number of NULL rows under MySQL.
     */
    public function up(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->unique('username_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran_ppdb', function (Blueprint $table) {
            $table->dropUnique(['username_siswa']);
        });
    }
};
