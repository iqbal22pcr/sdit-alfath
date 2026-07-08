<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drop-then-add via the Schema Builder, same approach as the
     * original enum migration for this column (SQLite, used by the
     * CI test suite, doesn't support ALTER ... MODIFY).
     */
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->enum('status', ['calon', 'aktif', 'alumni', 'keluar'])
                ->default('calon')
                ->after('nisn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->enum('status', ['aktif', 'alumni', 'keluar'])
                ->default('aktif')
                ->after('nisn');
        });
    }
};
