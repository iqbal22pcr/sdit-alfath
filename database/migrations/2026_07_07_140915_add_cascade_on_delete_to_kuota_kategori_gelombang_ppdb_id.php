<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * kuota_kategori rows have no meaning outside their gelombang_ppdb,
     * so deleting a gelombang should cascade-delete its kuota rows
     * instead of being blocked by the FK (the default RESTRICT
     * behaviour otherwise turns "delete gelombang" into a raw 500 the
     * moment any kuota has been set for it).
     */
    public function up(): void
    {
        Schema::table('kuota_kategori', function (Blueprint $table) {
            $table->dropForeign(['gelombang_ppdb_id']);
        });

        Schema::table('kuota_kategori', function (Blueprint $table) {
            $table->foreign('gelombang_ppdb_id')
                ->references('id')->on('gelombang_ppdb')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kuota_kategori', function (Blueprint $table) {
            $table->dropForeign(['gelombang_ppdb_id']);
        });

        Schema::table('kuota_kategori', function (Blueprint $table) {
            $table->foreign('gelombang_ppdb_id')
                ->references('id')->on('gelombang_ppdb');
        });
    }
};
