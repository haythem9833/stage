<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\CertificatController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\Api\EvaluationController as ApiEvaluationController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/




// Routes publiques (sans authentification)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (avec authentification)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profil']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Formations - Lectures publiques, écritures admin/formateur
    Route::get('/formations', [FormationController::class, 'index']);
    // Utilise le route model binding (Formation $formation)
    Route::get('/formations/{formation}', [FormationController::class, 'show']);
    Route::post('/formations', [FormationController::class, 'store'])->middleware('role:admin,formateur');
    Route::put('/formations/{formation}', [FormationController::class, 'update'])->middleware('role:admin,formateur');
    Route::post('/formations/{formation}/complete-all', [FormationController::class, 'completerTous'])->middleware('role:admin,formateur');
    Route::delete('/formations/{formation}', [FormationController::class, 'destroy'])->middleware('role:admin,formateur');

    // Sessions - Lectures publiques, écritures admin/formateur
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::get('/sessions/{id}', [SessionController::class, 'show']);
    Route::post('/sessions', [SessionController::class, 'store'])->middleware('role:admin,formateur');
    Route::put('/sessions/{id}', [SessionController::class, 'update'])->middleware('role:admin,formateur');
    Route::delete('/sessions/{id}', [SessionController::class, 'destroy'])->middleware('role:admin');
    Route::post('/sessions/{id}/validate', [SessionController::class, 'valider'])->middleware('role:admin,formateur');
    Route::post('/sessions/{id}/terminate', [SessionController::class, 'terminer'])->middleware('role:admin,formateur');

    // Inscriptions
    Route::get('/inscriptions', [InscriptionController::class, 'index'])->middleware('role:admin');
    Route::post('/inscriptions', [InscriptionController::class, 'store'])->middleware('role:etudiant');
    Route::get('/my-inscriptions', [InscriptionController::class, 'mesInscriptions'])->middleware('role:etudiant');
    Route::get('/inscriptions/{id}', [InscriptionController::class, 'show']);
    Route::put('/inscriptions/{id}', [InscriptionController::class, 'update'])->middleware('role:admin');
    Route::delete('/inscriptions/{id}', [InscriptionController::class, 'destroy'])->middleware('role:admin');
    Route::post('/inscriptions/{id}/validate', [InscriptionController::class, 'valider'])->middleware('role:admin,formateur');
    Route::post('/inscriptions/{id}/cancel', [InscriptionController::class, 'annuler'])->middleware('role:admin,etudiant');
    Route::post('/inscriptions/{id}/completer', [InscriptionController::class, 'completer'])->middleware('role:admin,formateur');

    // Certificats
    Route::get('/certificats', [CertificatController::class, 'index'])->middleware('role:admin');
    Route::get('/my-certificats', [CertificatController::class, 'mesCertificats'])->middleware('role:etudiant');
    Route::get('/formateur/certificats', [CertificatController::class, 'mesFormationsCertificats'])->middleware('role:formateur');
    Route::get('/certificats/{id}', [CertificatController::class, 'show']);
    Route::post('/certificats/{id}/generate', [CertificatController::class, 'generer'])->middleware('role:admin,formateur');
    Route::get('/certificats/{id}/download', [CertificatController::class, 'download'])->middleware('role:admin,etudiant');

    // Formations formateur
    Route::get('/formateur/sessions', [SessionController::class, 'mesSessions'])->middleware('role:formateur');
    Route::get('/formateur/inscriptions', [InscriptionController::class, 'mesFormationsInscriptions'])->middleware('role:formateur');

    // Evaluations
    Route::post('/evaluations', [EvaluationController::class, 'store'])->middleware('role:etudiant');
    Route::get('/sessions/{session_id}/evaluations', [EvaluationController::class, 'showSessionEvaluations']);
    
    // New Evaluation API endpoints
    Route::get('/evaluations/formations', [ApiEvaluationController::class, 'getFormationsForEvaluation'])->middleware('role:etudiant');
    Route::get('/inscriptions/{inscription}/evaluation', [ApiEvaluationController::class, 'getEvaluation'])->middleware('role:etudiant');
    Route::post('/inscriptions/{inscription}/evaluation/create', [ApiEvaluationController::class, 'createEvaluation'])->middleware('role:etudiant');
    Route::put('/evaluations/{evaluation}', [ApiEvaluationController::class, 'updateEvaluation'])->middleware('role:etudiant');
    Route::post('/evaluations/{evaluation}/submit', [ApiEvaluationController::class, 'submitEvaluation'])->middleware('role:etudiant');
    Route::get('/formations/{formation}/evaluation-stats', [ApiEvaluationController::class, 'getFormationEvaluationStats'])->middleware('role:admin,formateur');

    // Utilisateurs
    Route::get('/users', [DashboardController::class, 'getUsers'])->middleware('role:admin');
    Route::get('/users/{id}', [DashboardController::class, 'getUser'])->middleware('role:admin');
    Route::post('/users', [DashboardController::class, 'createUser'])->middleware('role:admin');
    Route::put('/users/{id}', [DashboardController::class, 'updateUser'])->middleware('role:admin');
    Route::delete('/users/{id}', [DashboardController::class, 'deleteUser'])->middleware('role:admin');

    // Role requests approval (admin)
    Route::get('/admin/role-requests', [DashboardController::class, 'getPendingRoleRequests'])->middleware('role:admin');
    Route::post('/admin/role-requests/{id}/approve', [DashboardController::class, 'approveRoleRequest'])->middleware('role:admin');
    Route::post('/admin/role-requests/{id}/reject', [DashboardController::class, 'rejectRoleRequest'])->middleware('role:admin');

    // Statistiques
    Route::get('/stats', [DashboardController::class, 'getStats'])->middleware('role:admin');
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->middleware('role:admin');
});
