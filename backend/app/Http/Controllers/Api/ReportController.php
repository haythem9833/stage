<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ParticipantHistoryService;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    private ParticipantHistoryService $historyService;
    private ReportService $reportService;

    public function __construct(
        ParticipantHistoryService $historyService,
        ReportService $reportService
    ) {
        $this->historyService = $historyService;
        $this->reportService = $reportService;
    }

    /**
     * GET /api/participants/{id}/historique
     * Récupère l'historique complet d'un participant
     */
    public function getParticipantHistory(int $id)
    {
        $history = $this->historyService->getParticipantHistory($id);
        return response()->json($history);
    }

    /**
     * GET /api/historique
     * Récupère l'historique du participant connecté
     */
    public function getMyHistory(Request $request)
    {
        $userId = auth()->id();
        $history = $this->historyService->getParticipantHistory($userId);
        return response()->json($history);
    }

    /**
     * GET /api/admin/participants-historique
     * Liste tous les participants avec leur historique (Admin only)
     */
    public function getAllParticipantsHistory(Request $request)
    {
        $this->authorize('isAdmin');
        
        $role = $request->query('role', 'etudiant');
        $history = $this->historyService->getAllParticipantsHistory($role);
        
        return response()->json($history);
    }

    /**
     * GET /api/rapports/presences/export-csv
     * Exporte les présences en CSV
     */
    public function exportPresencesCSV(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        $csv = $this->reportService->generatePresencesCSV($sessionId);
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="presences-' . date('Y-m-d') . '.csv"',
        ]);
    }

    /**
     * GET /api/rapports/formations/export-csv
     * Exporte les formations et sessions en CSV
     */
    public function exportFormationsCSV(Request $request)
    {
        $csv = $this->reportService->generateFormationsCSV();
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="formations-' . date('Y-m-d') . '.csv"',
        ]);
    }

    /**
     * GET /api/rapports/inscriptions/export-csv
     * Exporte les inscriptions en CSV
     */
    public function exportInscriptionsCSV(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        $csv = $this->reportService->generateInscriptionsCSV($sessionId);
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="inscriptions-' . date('Y-m-d') . '.csv"',
        ]);
    }

    /**
     * GET /api/rapports/bilan-session/{id}
     * Récupère un bilan complet d'une session
     */
    public function getSessionBilan(int $id)
    {
        $bilan = $this->reportService->generateSessionBilan($id);
        return response()->json($bilan);
    }

    /**
     * GET /api/rapports/bilan-periode
     * Récupère un bilan sur une période donnée
     */
    public function getPeriodBilan(Request $request)
    {
        $dateDebut = $request->query('date_debut');
        $dateFin = $request->query('date_fin');
        
        $bilan = $this->reportService->generatePeriodBilan($dateDebut, $dateFin);
        return response()->json($bilan);
    }
}
