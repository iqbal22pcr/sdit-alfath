<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drop-then-add via the Schema Builder, same approach used for
     * siswa.status (SQLite, used by the CI test suite, doesn't support
     * ALTER ... MODIFY). Unlike siswa.status, this column holds real
     * account permissions, so existing values are captured before the
     * drop and restored after -- a plain drop+re-add would otherwise
     * silently reset every admin/staf account back to the wali_murid
     * default.
     */
    public function up(): void
    {
        $roles = DB::table('users')->pluck('role', 'id');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'admin',
                'kepala_sekolah',
                'guru',
                'staf_keuangan',
                'staf_ppdb',
                'wali_murid',
                'siswa',
            ])->default('wali_murid')->nullable(false)->after('email');
        });

        foreach ($roles as $id => $role) {
            DB::table('users')->where('id', $id)->update(['role' => $role]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $roles = DB::table('users')->pluck('role', 'id');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'admin',
                'kepala_sekolah',
                'guru',
                'staf_keuangan',
                'staf_ppdb',
                'wali_murid',
            ])->default('wali_murid')->nullable(false)->after('email');
        });

        foreach ($roles as $id => $role) {
            // 'siswa' no longer exists as a valid role once rolled
            // back; leave those users on the wali_murid default rather
            // than violate the narrower enum.
            if ($role === 'siswa') {
                continue;
            }

            DB::table('users')->where('id', $id)->update(['role' => $role]);
        }
    }
};
