<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Authenticate
{
    /**
     * Middleware d'authentification
     * Vérifier que l'utilisateur est authentifié
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Non authentifié. Veuillez vous connecter.',
            ], 401);
        }

        return $next($request);
    }
}
