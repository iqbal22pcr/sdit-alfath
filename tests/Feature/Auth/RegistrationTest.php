<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    // Public registration always creates a wali_murid account, so it
    // should land on the wali_murid dashboard, same as logging in would.
    $response->assertRedirect(route('wali.siswa.index', absolute: false));
});
