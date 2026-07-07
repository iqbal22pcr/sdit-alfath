<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * pendaftaran_ppdb_id is left at the default RESTRICT (no cascade)
     * on purpose, consistent with the FK principle already noted in
     * CLAUDE.md: a siswa row is real enrolled-student data, it must
     * never silently vanish just because its originating pendaftaran
     * row gets deleted.
     */
    public function up(): void
    {
        Schema::create('siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pendaftaran_ppdb_id')->unique()->constrained('pendaftaran_ppdb');
            $table->string('nama');
            $table->string('nis');
            $table->string('nisn')->nullable();
            $table->string('status')->default('aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
