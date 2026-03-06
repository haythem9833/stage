<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\CertificatController;
use App\Http\Controllers\Api\PresenceController;
use App\Http\Controllers\Api\DashboardController as ApiDashboardController;
use App\Http\Controllers\Api\ReportController;
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
    Route::post('/formations/{formation}/start', [FormationController::class, 'start'])->middleware('role:admin,formateur');
    Route::post('/formations/{formation}/complete-all', [FormationController::class, 'completerTous'])->middleware('role:admin,formateur');
    Route::delete('/formations/{formation}', [FormationController::class, 'destroy'])->middleware('role:admin,formateur');

    // NOTE: Sessions have been merged into Formations (no more separate session management)
    // Presences are now recorded directly on formations with automatic activation when date_debut <= today

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

    // Utilisateurs
    Route::get('/users', [DashboardController::class, 'getUsers'])->middleware('role:admin');
    Route::get('/users/{id}', [DashboardController::class, 'getUser'])->middleware('role:admin');
    Route::post('/users', [DashboardController::class, 'createUser'])->middleware('role:admin');
    Route::put('/users/{id}', [DashboardController::class, 'updateUser'])->middleware('role:admin');
    Route::delete('/users/{id}', [DashboardController::class, 'deleteUser'])->middleware('role:admin');

    // Role upgrade requests (admin)
    Route::get('/admin/role-requests', [DashboardController::class, 'getPendingRoleRequests'])->middleware('role:admin');
    Route::post('/admin/role-requests/{id}/approve', [DashboardController::class, 'approveRoleRequest'])->middleware('role:admin');
    Route::post('/admin/role-requests/{id}/reject', [DashboardController::class, 'rejectRoleRequest'])->middleware('role:admin');

    // Statistiques
    Route::get('/stats', [DashboardController::class, 'getStats'])->middleware('role:admin');
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->middleware('role:admin');

    // PRESENCES - Now linked directly to formations (not sessions)
    Route::get('/formations/{formationId}/presences', [PresenceController::class, 'index'])->middleware('role:admin,formateur');
    Route::post('/formations/{formationId}/presences/batch', [PresenceController::class, 'batch'])->middleware('role:formateur,admin');
    Route::get('/formations/{formationId}/presences/synthese', [PresenceController::class, 'synthese'])->middleware('role:admin,formateur');
    Route::get('/formations/{formationId}/presences/feuille-presence', [PresenceController::class, 'feuillePresence'])->middleware('role:admin,formateur');
    Route::get('/formations/{formationId}/presences/absents-par-date', [PresenceController::class, 'absentParDate'])->middleware('role:admin,formateur');
    Route::get('/formations/{formationId}/presences/absents-total', [PresenceController::class, 'absentTotal'])->middleware('role:admin,formateur');

    Route::prefix('presences')->group(function () {
        Route::put('/{id}/justifier', [PresenceController::class, 'justifier'])->middleware('role:admin,formateur');
        Route::post('/{id}/corriger', [PresenceController::class, 'corriger'])->middleware('role:admin,formateur');
    });

    Route::prefix('etudiants')->group(function () {
        Route::get('/{id}/taux-presence', [PresenceController::class, 'tauxPresenceEtudiant']);
    });

    // DASHBOARD V2 (P1)
    Route::prefix('admin/dashboard-v2')->group(function () {
        Route::get('/stats', [ApiDashboardController::class, 'stats'])->middleware('role:admin');
        Route::get('/formations-stats', [ApiDashboardController::class, 'formationsStats'])->middleware('role:admin');
        Route::get('/presences-stats', [ApiDashboardController::class, 'presencesStats'])->middleware('role:admin');
    });

    // RAPPORTS & HISTORIQUE (P2)
    Route::prefix('rapports')->group(function () {
        Route::get('/historique', [ReportController::class, 'getMyHistory']);
        Route::get('/participants/{id}/historique', [ReportController::class, 'getParticipantHistory'])->middleware('role:admin,formateur');
        Route::get('/admin/participants-historique', [ReportController::class, 'getAllParticipantsHistory'])->middleware('role:admin');
        Route::get('/presences/export-csv', [ReportController::class, 'exportPresencesCSV'])->middleware('role:admin,formateur');
        Route::get('/formations/export-csv', [ReportController::class, 'exportFormationsCSV'])->middleware('role:admin');
        Route::get('/inscriptions/export-csv', [ReportController::class, 'exportInscriptionsCSV'])->middleware('role:admin,formateur');
        Route::get('/bilan-session/{id}', [ReportController::class, 'getSessionBilan'])->middleware('role:admin,formateur');
        Route::get('/bilan-periode', [ReportController::class, 'getPeriodBilan'])->middleware('role:admin');
    });

    Route::get('/historique', [ReportController::class, 'getMyHistory']);
});
