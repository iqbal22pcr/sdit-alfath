<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Rollback of the separate siswa-account feature: siswa no longer
     * has its own login, so the link to `users` goes away. Must run
     * before the migration that deletes role="siswa" users, otherwise
     * that delete would violate this column's RESTRICT foreign key.
     */
    public function up(): void
    {
        // SQLite's native ALTER TABLE DROP COLUMN (used by the test
        // suite) errors if a unique index still references the column,
        // unlike MySQL which drops a column's own index automatically
        // -- so the unique index is dropped explicitly first.
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->unique()->after('pendaftaran_ppdb_id')->constrained('users');
        });
    }
};
