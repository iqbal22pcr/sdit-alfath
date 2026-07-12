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
     * Rollback of the separate siswa-account feature: "siswa" stops
     * being a valid role. Any existing role="siswa" rows are old test
     * data from that feature and are deleted first, so the narrower
     * enum below never has to accommodate a value it disallows.
     */
    public function up(): void
    {
        DB::table('users')->where('role', 'siswa')->delete();

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
                'siswa',
            ])->default('wali_murid')->nullable(false)->after('email');
        });

        foreach ($roles as $id => $role) {
            DB::table('users')->where('id', $id)->update(['role' => $role]);
        }
    }
};
