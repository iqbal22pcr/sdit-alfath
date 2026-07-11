<?php

use App\Models\User;

test('siswa cannot access staf keuangan tagihan page', function () {
    $siswa = User::factory()->create(['role' => 'siswa']);

    $this->actingAs($siswa)->get('/staf/tagihan')->assertForbidden();
});

test('siswa cannot access kategori siswa page', function () {
    $siswa = User::factory()->create(['role' => 'siswa']);

    $this->actingAs($siswa)->get('/kategori-siswa')->assertForbidden();
});

test('siswa cannot access wali tagihan page', function () {
    $siswa = User::factory()->create(['role' => 'siswa']);

    $this->actingAs($siswa)->get('/wali/tagihan')->assertForbidden();
});

test('siswa cannot access gelombang ppdb page', function () {
    $siswa = User::factory()->create(['role' => 'siswa']);

    $this->actingAs($siswa)->get('/gelombang-ppdb')->assertForbidden();
});
