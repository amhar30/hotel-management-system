<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum හි ensureFrontendRequestsAreStateful middleware එක API group එකට එක් කිරීම.
        // මෙය SPA (Single Page Application) authentication සඳහා වැදගත් වේ.
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);


        // CSRF Token Validation
        // ඔබගේ සියලු route වලට CSRF tokens වලංගු කිරීම (validation) එක් කිරීම.
        // ඔබ Sanctum SPA භාවිත කරන විට මෙය වැදගත් වේ.
        $middleware->validateCsrfTokens(except: [
            // මෙහිදී ඔබ CSRF ආරක්ෂාව නොසලකා හැරීමට අවශ්‍ය route එකතු කළ හැක.
            // ඔබ '*' භාවිතා කරන්නේ නම් එය සියල්ලටම අදාළ වේ.
            // ඔබගේ මුල් ඉල්ලීම අනුව '*' ඇතුළත් කර ඇත.
            '*',
        ]);

        // Add this - Laravel 12 uses this class
        // HandleCors middleware එක ගෝලීය වශයෙන් (globally) middleware stack එකේ අවසානයට එක් කිරීම
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // Register aliases
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'admin_or_staff' => \App\Http\Middleware\AdminOrStaffMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();