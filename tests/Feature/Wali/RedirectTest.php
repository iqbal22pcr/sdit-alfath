<?php

use App\Models\User;

test('wali_murid login redirects to the Dashboard page', function () {
    $wali = User::factory()->create(['role' => 'wali_murid']);

    $response = $this->post('/login', [
        'email' => $wali->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('wali.dashboard', absolute: false));

    $this->get(route('wali.dashboard'))->assertOk();
});
