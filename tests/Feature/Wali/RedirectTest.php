<?php

use App\Models\User;

test('wali_murid login redirects to the PPDB page', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $response = $this->post('/login', [
        'email' => $wali->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('ppdb.pendaftaran', absolute: false));

    $this->get(route('ppdb.pendaftaran'))->assertOk();
});
