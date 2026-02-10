<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    // Inscription
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'role' => 'nullable|in:etudiant,formateur,admin'
        ], [
            'password.confirmed' => 'Les mots de passe ne correspondent pas',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères',
            'password.mixed_case' => 'Le mot de passe doit contenir majuscules et minuscules',
            'password.numbers' => 'Le mot de passe doit contenir des chiffres',
            'password.symbols' => 'Le mot de passe doit contenir des caractères spéciaux',
        ]);

        $requestedRole = $validated['role'] ?? 'etudiant';
        $requiresApproval = in_array($requestedRole, ['admin', 'formateur'], true);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            // Security: never grant elevated roles instantly.
            // If admin/formateur requested, user stays etudiant until approved.
            'role' => $requiresApproval ? 'etudiant' : $requestedRole,
            'account_status' => $requiresApproval ? 'pending' : 'approved',
            'requested_role' => $requiresApproval ? $requestedRole : null,
        ]);

        // Log the registration event
        \Log::info('Nouvel utilisateur enregistré', ['user_id' => $user->id]);

        return response()->json([
            'message' => $requiresApproval
                ? 'Compte créé. Votre demande de rôle est en attente de validation par un administrateur.'
                : 'Utilisateur créé avec succès',
            'user' => $user
        ], 201);
    }

    // Connexion
    public function login(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ], [
            'email.required' => 'L\'email est requis',
            'email.email' => 'Format email invalide',
            'password.required' => 'Le mot de passe est requis'
        ]);

        // Rate limiting: 5 attempts per minute
        $key = 'login_attempts:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Trop de tentatives. Réessayez dans {$seconds} secondes"
            ], 429);
        }

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($key);
            \Log::warning('Tentative de connexion échouée', ['email' => $validated['email']]);
            
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // Block login if account is pending/rejected
        if (($user->account_status ?? 'approved') !== 'approved') {
            $msg = $user->account_status === 'pending'
                ? 'Votre compte est en attente de validation par un administrateur.'
                : 'Votre compte a été refusé. Veuillez contacter un administrateur.';

            return response()->json([
                'message' => $msg,
                'status' => $user->account_status,
            ], 403);
        }

        // Clear rate limit on successful login
        RateLimiter::clear($key);

        // Log successful login
        \Log::info('Utilisateur connecté', ['user_id' => $user->id]);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api_token')->plainTextToken
        ]);
    }

    // Profil utilisateur
    public function profil(Request $request)
    {
        return response()->json(Auth::user());
    }

    // Déconnexion
    public function logout(Request $request)
    {
        Auth::user()->currentAccessToken()->delete();
        
        \Log::info('Utilisateur déconnecté', ['user_id' => Auth::id()]);

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // Changer de mot de passe
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => [
                'required',
                'confirmed',
                'different:current_password',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ]
        ], [
            'new_password.confirmed' => 'Les mots de passe ne correspondent pas',
            'new_password.different' => 'Le nouveau mot de passe doit être différent de l\'actuel',
            'new_password.min' => 'Le mot de passe doit contenir au moins 8 caractères',
            'new_password.mixed_case' => 'Le mot de passe doit contenir majuscules et minuscules',
            'new_password.numbers' => 'Le mot de passe doit contenir des chiffres',
            'new_password.symbols' => 'Le mot de passe doit contenir des caractères spéciaux',
        ]);

        $user = Auth::user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            \Log::warning('Changement de mot de passe échoué - mot de passe incorrect', 
                ['user_id' => $user->id]);
            
            return response()->json([
                'message' => 'Mot de passe actuel incorrect'
            ], 401);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);

        \Log::info('Mot de passe changé avec succès', ['user_id' => $user->id]);

        return response()->json(['message' => 'Mot de passe changé avec succès']);
    }
}