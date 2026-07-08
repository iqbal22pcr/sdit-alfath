<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * All foreign keys here are left at the default RESTRICT behaviour
     * on purpose (no cascadeOnDelete): a tagihan is real billing data,
     * it must never silently vanish just because a siswa, tahun_ajaran,
     * or komponen_biaya row it references gets deleted.
     *
     * nominal is a SNAPSHOT locked in at the moment the tagihan is
     * created -- it does not change afterwards even if the source
     * komponen_biaya or gelombang_ppdb it was derived from changes
     * later.
     */
    public function up(): void
    {
        Schema::create('tagihan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran');
            $table->foreignId('komponen_biaya_id')->constrained('komponen_biaya');
            $table->string('nomor_tagihan')->unique();
            $table->unsignedTinyInteger('bulan_tagihan')->nullable();
            $table->unsignedSmallInteger('tahun_tagihan');
            $table->unsignedInteger('nominal');
            $table->unsignedInteger('terbayar')->default(0);
            $table->enum('status', ['belum_bayar', 'sebagian', 'lunas'])->default('belum_bayar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihan');
    }
};
