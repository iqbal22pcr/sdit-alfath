<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Nullable for now so existing rows aren't forced to backfill a
     * value immediately; the form requires it going forward.
     */
    public function up(): void
    {
        Schema::table('tahun_ajaran', function (Blueprint $table) {
            $table->unsignedSmallInteger('tahun_mulai')->nullable()->after('nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tahun_ajaran', function (Blueprint $table) {
            $table->dropColumn('tahun_mulai');
        });
    }
};
