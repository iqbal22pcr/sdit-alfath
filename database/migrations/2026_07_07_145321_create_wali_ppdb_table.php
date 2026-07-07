<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wali_ppdb', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pendaftaran_ppdb_id')->constrained('pendaftaran_ppdb')->cascadeOnDelete();
            $table->string('nama');
            $table->string('nik');
            $table->string('telepon');
            $table->enum('hubungan', ['ayah', 'ibu', 'wali']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wali_ppdb');
    }
};
