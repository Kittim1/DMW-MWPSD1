<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api();
        $middleware->statefulApi();
        
        $middleware->validateCsrfTokens(
            except: [
                'api/*',
            ]
        );
    })
    ->withProviders([
        \App\Providers\AppServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();

// Ensure console kernel is bound
$app->singleton(
    \Illuminate\Console\Kernel::class,
    \App\Console\Kernel::class
);

// Ensure HTTP kernel is bound
$app->singleton(
    \Illuminate\Contracts\Http\Kernel::class,
    \App\Http\Kernel::class
);

return $app;
