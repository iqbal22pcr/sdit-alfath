<?php

use App\Models\User;

test('siswa cannot access the ppdb registration page', function () {
    $siswa = User::factory()->create(['role' => 'siswa']);

    $this->actingAs($siswa)->get('/ppdb/daftar')->assertForbidden();
});

test('staf_ppdb cannot access the ppdb registration page', function () {
    $stafPpdb = User::factory()->create(['role' => 'staf_ppdb']);

    $this->actingAs($stafPpdb)->get('/ppdb/daftar')->assertForbidden();
});

test('wali_murid can access the ppdb registration page normally', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $this->actingAs($wali)->get('/ppdb/daftar')->assertOk();
});
