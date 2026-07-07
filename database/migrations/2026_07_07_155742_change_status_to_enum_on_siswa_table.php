<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Raw SQL is used instead of Schema::table()->enum() because
     * altering an existing column's type (string -> enum) isn't
     * something Laravel's fluent Blueprint can express as a change;
     * doctrine/dbal (used for ->change()) also doesn't model MySQL
     * enums correctly.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE siswa MODIFY status ENUM('aktif', 'alumni', 'keluar') NOT NULL DEFAULT 'aktif'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE siswa MODIFY status VARCHAR(255) NOT NULL DEFAULT 'aktif'");
    }
};
