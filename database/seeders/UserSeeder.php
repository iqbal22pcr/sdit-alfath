<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed one dummy account per role for manual testing
     * (login/logout while switching roles).
     */
    public function run(): void
    {
        $accounts = [
            ['role' => 'admin', 'name' => 'Admin Testing'],
            ['role' => 'kepala_sekolah', 'name' => 'Kepala Sekolah Testing'],
            ['role' => 'guru', 'name' => 'Guru Testing'],
            ['role' => 'staf_keuangan', 'name' => 'Staf Keuangan Testing'],
            ['role' => 'staf_ppdb', 'name' => 'Staf PPDB Testing'],
            ['role' => 'wali_murid', 'name' => 'Wali Murid Testing'],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['email' => "{$account['role']}@test.com"],
                [
                    'name' => $account['name'],
                    'password' => 'password',
                    'role' => $account['role'],
                ]
            );
        }
    }
}
