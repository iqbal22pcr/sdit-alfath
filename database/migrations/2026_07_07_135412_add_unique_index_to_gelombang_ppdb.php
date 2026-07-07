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
        Schema::table('gelombang_ppdb', function (Blueprint $table) {
            $table->unique(['tahun_ajaran_id', 'nama']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gelombang_ppdb', function (Blueprint $table) {
            $table->dropUnique(['tahun_ajaran_id', 'nama']);
        });
    }
};
