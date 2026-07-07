<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drop-then-add via the Schema Builder instead of raw "ALTER ...
     * MODIFY" SQL, so Laravel translates this to whatever syntax each
     * database driver needs (the CI test suite runs against SQLite,
     * which doesn't support MODIFY).
     */
    public function up(): void
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->string('status')->default('aktif')->after('nisn');
        });
    }
};
