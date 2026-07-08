<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * nominal_dasar is nullable specifically because of jenis "masuk":
     * harga uang masuk selalu diambil dari gelombang_ppdb.biaya_masuk
     * pada gelombang pendaftaran siswa yang bersangkutan, bukan dari
     * kolom ini. Untuk jenis lain (spp, buku, seragam), nominal_dasar
     * WAJIB diisi karena itu satu-satunya sumber harga.
     */
    public function up(): void
    {
        Schema::create('komponen_biaya', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('jenis', ['spp', 'masuk', 'buku', 'seragam']);
            $table->unsignedInteger('nominal_dasar')->nullable();
            $table->boolean('berulang')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('komponen_biaya');
    }
};
