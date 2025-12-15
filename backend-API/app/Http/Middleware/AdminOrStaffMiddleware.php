<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrStaffMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || (!$user->isAdmin() && !$user->isStaff())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin or staff access required.'
            ], 403);
        }

        return $next($request);
    }
}