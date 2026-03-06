<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionFormation;
use App\Models\Formation;
use App\Models\Inscription;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard-v2/stats - Statistiques dashboard v2
     */
    public function stats(): JsonResponse
    {
        $now = Carbon::now();

        // Sessions actives (en cours ou à venir)
        $sessionsActives = SessionFormation::where('statut', 'validee')
            ->where('date_debut', '<=', $now)
            ->where('date_fin', '>=', $now)
            ->count();

        // Sessions prochaines (non validées)
        $sessionsProchaines = SessionFormation::where('statut', '!=', 'validee')
            ->where('date_debut', '>', $now)
            ->count();

        // Taux de remplissage moyen
        $tauxRemplissageMoyen = SessionFormation::with('inscriptions')
            ->get()
            ->map(function ($session) {
                $remplissage = $session->inscriptions->count() / $session->nombre_places;
                return min($remplissage * 100, 100);
            })
            ->avg();

        // Top formations (les plus suivies)
        $topFormations = Formation::withCount('inscriptions')
            ->orderByDesc('inscriptions_count')
            ->take(5)
            ->get();

        // Alertes
        $alertes = [];

        // Sessions non validées (< 17 inscrits)
        $sessionsNonValidees = SessionFormation::where('statut', '!=', 'validee')
            ->where('date_debut', '<', $now->addDays(30))
            ->with('inscriptions')
            ->get()
            ->filter(function ($s) {
                return $s->inscriptions->count() < 17;
            });

        if ($sessionsNonValidees->count() > 0) {
            $alertes[] = [
                'type' => 'warning',
                'titre' => 'Sessions à valider',
                'message' => $sessionsNonValidees->count() . ' sessions moins de 17 inscrits',
                'count' => $sessionsNonValidees->count(),
            ];
        }

        // Sessions avec peu de place restante
        $sessionsFull = SessionFormation::with('inscriptions')
            ->get()
            ->filter(function ($s) {
                $placesRestantes = $s->nombre_places - $s->inscriptions->count();
                return $placesRestantes <= 2 && $placesRestantes > 0;
            });

        if ($sessionsFull->count() > 0) {
            $alertes[] = [
                'type' => 'info',
                'titre' => 'Sessions presque complètes',
                'message' => $sessionsFull->count() . ' sessions ont peu de places',
                'count' => $sessionsFull->count(),
            ];
        }

        // Statistiques par rôle
        $utilisateurs = \App\Models\User::groupBy('role')->selectRaw('role, count(*) as total')->get();

        // Total participants cette année
        $anneeActuelle = $now->year;
        $participantsAnnee = Inscription::whereYear('created_at', $anneeActuelle)->count();

        return response()->json([
            'dates' => [
                'calcul' => $now->format('Y-m-d H:i:s'),
                'periodeDebut' => $now->startOfMonth()->format('Y-m-d'),
                'periodeFin' => $now->endOfMonth()->format('Y-m-d'),
            ],
            'sessions' => [
                'actives' => $sessionsActives,
                'prochaines' => $sessionsProchaines,
                'total' => $sessionsActives + $sessionsProchaines,
            ],
            'remplissage' => [
                'moyen' => round($tauxRemplissageMoyen, 2),
                'sessions' => $sessionsFull->count(),
            ],
            'formations' => [
                'top' => $topFormations,
                'total' => Formation::count(),
            ],
            'utilisateurs' => $utilisateurs->keyBy('role'),
            'inscriptions' => [
                'cette_annee' => $participantsAnnee,
                'ce_mois' => Inscription::whereMonth('created_at', $now->month)
                    ->whereYear('created_at', $anneeActuelle)
                    ->count(),
            ],
            'alertes' => $alertes,
            'kpis' => [
                'sessions_actives_count' => $sessionsActives,
                'taux_remplissage_moyen' => round($tauxRemplissageMoyen, 2),
                'total_formations' => Formation::count(),
                'total_participants' => \App\Models\User::where('role', 'etudiant')->count(),
            ],
        ]);
    }

    /**
     * GET /api/admin/dashboard-v2/formations-stats - Stats détaillées par formation
     */
    public function formationsStats(): JsonResponse
    {
        $formations = Formation::with(['inscriptions', 'sessions'])
            ->get()
            ->map(function ($f) {
                $totalInscrits = $f->inscriptions->count();
                $totalSessions = $f->sessions->count();
                $sessionsValidees = $f->sessions->where('statut', 'validee')->count();

                return [
                    'id' => $f->id,
                    'titre' => $f->titre,
                    'formateur' => $f->formateur?->prenom . ' ' . $f->formateur?->nom,
                    'total_inscrits' => $totalInscrits,
                    'sessions' => $totalSessions,
                    'sessions_validees' => $sessionsValidees,
                    'taux_validation' => $totalSessions > 0 ? round(($sessionsValidees / $totalSessions) * 100, 2) : 0,
                ];
            });

        return response()->json($formations);
    }

    /**
     * GET /api/admin/dashboard-v2/presences-stats - Stats sur les presences
     */
    public function presencesStats(): JsonResponse
    {
        $now = Carbon::now();

        $presences = \App\Models\Presence::with('inscription')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->get();

        $stats = [
            'total_enregistrements' => $presences->count(),
            'par_statut' => [
                'present' => $presences->where('statut', 'present')->count(),
                'absent' => $presences->where('statut', 'absent')->count(),
                'retard' => $presences->where('statut', 'retard')->count(),
                'justifie' => $presences->where('statut', 'justifie')->count(),
            ],
            'taux_presence' => $presences->count() > 0
                ? round(
                    ($presences->whereIn('statut', ['present', 'justifie'])->count() / $presences->count()) * 100,
                    2
                )
                : 0,
        ];

        return response()->json($stats);
    }
}
