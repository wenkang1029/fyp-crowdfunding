<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status === 'suspended') {
            // Revoke active token
            $user->tokens()->delete();

            return response()->json([
                'success' => false,
                'message' => 'Your account is suspended. Please contact the administrator.',
            ], 403);
        }

        return $next($request);
    }
}
