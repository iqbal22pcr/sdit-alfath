<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginSiswaRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiswaSessionController extends Controller
{
    /**
     * Show the siswa login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login-siswa', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming siswa authentication request.
     *
     * Logout is shared with the staf/wali session (AuthenticatedSessionController::destroy)
     * since it isn't role-specific.
     */
    public function store(LoginSiswaRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended($request->user()->defaultRedirectPath());
    }
}
