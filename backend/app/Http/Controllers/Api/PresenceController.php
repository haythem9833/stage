<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\Presence;
use App\Models\Inscription;
use App\Services\PresenceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class PresenceController extends Controller
{
    public function __construct(private PresenceService $presenceService) {}

    /**
     * POST /api/formations/{id}/presences/batch - Marquer les presences en batch
     * Activates presence automatically if formation date_debut <= today
     */
    public function batch(Request $request, $formationId): JsonResponse
    {
        $formationId = (int) $formationId;
        $formation = Formation::findOrFail($formationId);
        
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'presences' => 'required|array',
            'presences.*.inscription_id' => 'required|integer|exists:inscriptions,id',
            'presences.*.statut' => 'required|in:present,absent,retard,justifie',
        ]);

        $dateSession = Carbon::createFromFormat('Y-m-d', $validated['date']);
        $isActive = $formation->date_debut && now()->greaterThanOrEqualTo($formation->date_debut);

        // Enregistrer les presences
        $resultats = [];
        foreach ($validated['presences'] as $presenceData) {
            $inscription = Inscription::find($presenceData['inscription_id']);

            // Préparer les données de mise à jour
            $updateData = [
                'formation_id' => $formationId,
                'statut' => $presenceData['statut'],
            ];

            if (Schema::hasColumn('presences', 'is_active')) {
                $updateData['is_active'] = $isActive;
            }

            // Utiliser inscription_id, formation_id et date_session comme clé unique
            $presence = Presence::updateOrCreate(
                [
                    'inscription_id' => $presenceData['inscription_id'],
                    'formation_id' => $formationId,
                    'date_session' => $dateSession,
                ],
                $updateData
            );

            $resultats[] = $presence;
        }

        return response()->json([
            'message' => 'Presences enregistrées',
            'date' => $validated['date'],
            'count' => count($resultats),
            'is_active' => $isActive,
            'resultats' => $resultats,
        ]);
    }

    /**
     * GET /api/formations/{formationId}/presences - Récupère toutes les presences pour une formation
     */
    public function index($formationId): JsonResponse
    {
        $formationId = (int) $formationId;
        // Get inscriptions for this formation, then get their presences
        $inscriptions = Inscription::where('formation_id', $formationId)->pluck('id');
        
        $presences = Presence::whereIn('inscription_id', $inscriptions)
            ->with('inscription.user')
            ->orderBy('date_session')
            ->get();

        return response()->json($presences);
    }

    /**
     * GET /api/formations/{formationId}/presences/synthese - Synthèse des presences par inscription
     */
    public function synthese($formationId): JsonResponse
    {
        $formationId = (int) $formationId;
        $formation = Formation::with('inscriptions.user')->findOrFail($formationId);
        
        $synthese = [];
        foreach ($formation->inscriptions as $inscription) {
            $presences = Presence::where('inscription_id', $inscription->id)
                ->get();

            $present = $presences->where('statut', 'present')->count();
            $absent = $presences->where('statut', 'absent')->count();
            $justifie = $presences->where('statut', 'justifie')->count();
            $retard = $presences->where('statut', 'retard')->count();
            $total = $presences->count();
            $taux = $total > 0 ? round((($present + $justifie) / $total) * 100, 2) : 0;

            $synthese[] = [
                'inscription_id' => $inscription->id,
                'etudiant_id' => $inscription->etudiant_id,
                'etudiant_nom' => $inscription->user ? $inscription->user->prenom . ' ' . $inscription->user->nom : 'N/A',
                'etudiant_email' => $inscription->user->email ?? 'N/A',
                'present' => $present,
                'absent' => $absent,
                'justifie' => $justifie,
                'retard' => $retard,
                'total' => $total,
                'taux_presence' => $taux,
            ];
        }

        return response()->json([
            'formation_id' => $formationId,
            'formation_titre' => $formation->titre,
            'inscriptions_count' => count($synthese),
            'synthese' => $synthese,
        ]);
    }

    /**
     * GET /api/formations/{formationId}/feuille-presence - Feuille de presence
     */
    public function feuillePresence(Request $request, $formationId)
    {
        $formationId = (int) $formationId;
        $formation = Formation::with('inscriptions.user')->findOrFail($formationId);
        
        // Get presences through inscriptions
        $inscriptions = Inscription::where('formation_id', $formationId)->pluck('id');
        
        $presences = Presence::whereIn('inscription_id', $inscriptions)
            ->with('inscription.user')
            ->orderBy('date_session')
            ->get()
            ->groupBy('date_session');

        // Si format PDF demandé
        if ($request->query('format') === 'pdf') {
            return $this->presenceService->genererPdfPresence(
                $formationId,
                $formation->date_debut,
                $formation->date_fin
            );
        }

        // Sinon JSON
        return response()->json([
            'formation' => $formation,
            'presences_par_date' => $presences,
        ]);
    }

    /**
     * GET /api/etudiants/{id}/taux-presence - Taux de presence d'un etudiant pour une formation
     */
    public function tauxPresenceEtudiant(Request $request, int $etudiantId): JsonResponse
    {
        $validated = $request->validate([
            'formation_id' => 'required|integer|exists:formations,id',
        ]);

        $inscription = Inscription::where('etudiant_id', $etudiantId)
            ->where('formation_id', $validated['formation_id'])
            ->firstOrFail();

        $presences = Presence::where('inscription_id', $inscription->id)
            ->get();

        $present = $presences->where('statut', 'present')->count();
        $justifie = $presences->where('statut', 'justifie')->count();
        $total = $presences->count();
        $taux = $total > 0 ? round((($present + $justifie) / $total) * 100, 2) : 0;

        return response()->json([
            'etudiant_id' => $etudiantId,
            'formation_id' => $validated['formation_id'],
            'taux_presence' => $taux,
            'presences_count' => [
                'present' => $present,
                'justifie' => $justifie,
                'absent' => $presences->where('statut', 'absent')->count(),
                'retard' => $presences->where('statut', 'retard')->count(),
                'total' => $total,
            ],
        ]);
    }

    /**
     * PUT /api/presences/{id}/justifier - Justifier une absence
     */
    public function justifier(Request $request, int $presenceId): JsonResponse
    {
        $validated = $request->validate([
            'raison' => 'required|string|min:5',
        ]);

        $presence = Presence::findOrFail($presenceId);
        $presence->update([
            'statut' => 'justifie',
            'justification' => $validated['raison'],
        ]);

        return response()->json([
            'message' => 'Absence justifiée',
            'presence' => $presence,
        ]);
    }

    /**
     * POST /api/presences/{id}/corriger - Corriger une presence
     */
    public function corriger(Request $request, int $presenceId): JsonResponse
    {
        $validated = $request->validate([
            'statut' => 'required|in:present,absent,retard,justifie',
        ]);

        $presence = Presence::findOrFail($presenceId);
        $presence->update(['statut' => $validated['statut']]);

        return response()->json([
            'message' => 'Presence mise à jour',
            'presence' => $presence,
        ]);
    }

    /**
     * GET /api/formations/{formationId}/presences/absents-par-date - Récupère les absents pour une date
     */
    public function absentParDate(Request $request, $formationId): JsonResponse
    {
        $formationId = (int) $formationId;
        $formation = Formation::findOrFail($formationId);
        
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $absents = Presence::where('formation_id', $formationId)
            ->where('date_session', $validated['date'])
            ->where('statut', 'absent')
            ->with('inscription.user')
            ->get()
            ->map(function($presence) {
                return [
                    'presence_id' => $presence->id,
                    'inscription_id' => $presence->inscription_id,
                    'etudiant_id' => $presence->inscription->etudiant_id,
                    'nom' => $presence->inscription->user?->nom ?? 'N/A',
                    'prenom' => $presence->inscription->user?->prenom ?? 'N/A',
                    'email' => $presence->inscription->user?->email ?? 'N/A',
                    'statut' => $presence->statut,
                    'justification' => $presence->justification,
                ];
            });

        return response()->json([
            'formation_id' => $formationId,
            'formation_titre' => $formation->titre,
            'date' => $validated['date'],
            'count' => $absents->count(),
            'absents' => $absents->values(),
        ]);
    }

    /**
     * GET /api/formations/{formationId}/presences/absents-total - Récupère tous les absents d'une formation
     */
    public function absentTotal(Request $request, $formationId): JsonResponse
    {
        $formationId = (int) $formationId;
        $formation = Formation::findOrFail($formationId);
        
        $absents = Presence::where('formation_id', $formationId)
            ->where('statut', 'absent')
            ->with('inscription.user')
            ->orderBy('date_session')
            ->get()
            ->map(function($presence) {
                return [
                    'presence_id' => $presence->id,
                    'inscription_id' => $presence->inscription_id,
                    'etudiant_id' => $presence->inscription->etudiant_id,
                    'nom' => $presence->inscription->user?->nom ?? 'N/A',
                    'prenom' => $presence->inscription->user?->prenom ?? 'N/A',
                    'email' => $presence->inscription->user?->email ?? 'N/A',
                    'date' => $presence->date_session,
                    'statut' => $presence->statut,
                    'justification' => $presence->justification,
                ];
            });

        // Grouper par étudiant pour compter les absences
        $absentsGrouped = collect($absents)->groupBy('etudiant_id')->map(function($studentAbsents) {
            return [
                'etudiant_id' => $studentAbsents[0]['etudiant_id'],
                'nom' => $studentAbsents[0]['nom'],
                'prenom' => $studentAbsents[0]['prenom'],
                'email' => $studentAbsents[0]['email'],
                'total_absences' => $studentAbsents->count(),
                'absences' => $studentAbsents->map(fn($a) => [
                    'presence_id' => $a['presence_id'],
                    'date' => $a['date'],
                    'justification' => $a['justification'],
                ])->values(),
            ];
        })->values();

        return response()->json([
            'formation_id' => $formationId,
            'formation_titre' => $formation->titre,
            'total_absences' => $absents->count(),
            'etudiants_avec_absences' => $absentsGrouped->count(),
            'absents' => $absentsGrouped,
        ]);
    }
}
