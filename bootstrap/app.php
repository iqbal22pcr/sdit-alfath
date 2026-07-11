<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsSiswa;
use App\Http\Middleware\EnsureUserIsStafKeuangan;
use App\Http\Middleware\EnsureUserIsStafPpdb;
use App\Http\Middleware\EnsureUserIsWali;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'staf-ppdb' => EnsureUserIsStafPpdb::class,
            'staf-keuangan' => EnsureUserIsStafKeuangan::class,
            'siswa' => EnsureUserIsSiswa::class,
            'wali' => EnsureUserIsWali::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
