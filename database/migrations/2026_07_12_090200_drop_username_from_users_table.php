<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Rollback of the separate siswa-account feature: username-based
     * login goes away with it, so every account logs in with email
     * again. Must run after the migration that deletes role="siswa"
     * users -- those were the only rows with a null email, so by now
     * every remaining row already satisfies NOT NULL.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });

        // SQLite's native ALTER TABLE DROP COLUMN (used by the test
        // suite) errors if a unique index still references the column,
        // unlike MySQL which drops a column's own index automatically
        // -- so the unique index is dropped explicitly first.
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }
};
