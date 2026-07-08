<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended($this->redirectPathFor($request->user()));
    }

    /**
     * Get the post-login landing page for the given user's role.
     * Roles without a dedicated dashboard (admin, kepala_sekolah, guru)
     * fall back to the generic starter-kit dashboard.
     */
    private function redirectPathFor(User $user): string
    {
        return match ($user->role) {
            'staf_ppdb' => route('staf.ppdb-dashboard', absolute: false),
            'staf_keuangan' => route('staf.tagihan.index', absolute: false),
            'wali_murid' => route('wali.siswa.index', absolute: false),
            default => route('dashboard', absolute: false),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
