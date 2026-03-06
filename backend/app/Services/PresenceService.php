<?php

namespace App\Services;

use App\Models\Presence;
use App\Models\Inscription;
use App\Models\SessionFormation;
use PDF;
use Carbon\Carbon;

class PresenceService
{
    /**
     * Calcule le taux de présence d'un étudiant
     */
    public function getTauxPresence(int $inscriptionId, int $sessionId): float
    {
        return Presence::tauxPresence($inscriptionId, $sessionId);
    }

    /**
     * Récupère les présences pour une session complète
     */
    public function getFeuillePresence(int $sessionId): array
    {
        $presences = Presence::where('session_id', $sessionId)
            ->with('inscription.etudiant')
            ->orderBy('date_session')
            ->orderBy('inscription_id')
            ->get();

        return $presences->groupBy('date_session')->toArray();
    }

    /**
     * Marque les présences en batch pour une date/session
     */
    public function marquerPresences(int $sessionId, Carbon $dateSession, array $presences): array
    {
        $resultats = [];

        foreach ($presences as $inscriptionId => $statut) {
            $presence = Presence::updateOrCreate(
                [
                    'inscription_id' => $inscriptionId,
                    'session_id' => $sessionId,
                    'date_session' => $dateSession,
                ],
                [
                    'statut' => $statut,
                ]
            );

            $resultats[] = [
                'inscription_id' => $inscriptionId,
                'presence_id' => $presence->id,
                'created' => $presence->wasRecentlyCreated,
            ];
        }

        return $resultats;
    }

    /**
     * Génère le PDF de la feuille de présence
     */
    public function genererPdfPresence(int $sessionId, Carbon $dateDebut, Carbon $dateFin): string
    {
        $session = SessionFormation::with('formation', 'inscriptions.etudiant')
            ->findOrFail($sessionId);

        $presences = $this->getFeuillePresence($sessionId);

        $html = view('presences.feuille-presence-pdf', [
            'session' => $session,
            'presences' => $presences,
            'dateDebut' => $dateDebut,
            'dateFin' => $dateFin,
        ])->render();

        $pdf = PDF::loadHTML($html);
        
        return $pdf->stream("feuille-presence-{$sessionId}.pdf");
    }

    /**
     * Obtient la synthèse des présences pour une session
     */
    public function getSynthesePresences(int $sessionId): array
    {
        $presences = Presence::where('session_id', $sessionId)
            ->with('inscription.etudiant')
            ->get();

        $synthese = [];

        foreach ($presences->groupBy('inscription_id') as $inscriptionId => $presencesEtudiant) {
            $total = $presencesEtudiant->count();
            $presentes = $presencesEtudiant->whereIn('statut', ['present', 'justifie'])->count();

            $synthese[] = [
                'inscription_id' => $inscriptionId,
                'etudiant' => $presencesEtudiant->first()->inscription->etudiant,
                'total_jours' => $total,
                'jours_presentes' => $presentes,
                'taux' => $total > 0 ? round(($presentes / $total) * 100, 2) : 0,
            ];
        }

        return $synthese;
    }

    /**
     * Justifie une absence
     */
    public function justifierAbsence(int $presenceId, string $raison): Presence
    {
        $presence = Presence::findOrFail($presenceId);
        $presence->update([
            'statut' => 'justifie',
            'justification' => $raison,
        ]);

        return $presence;
    }
}
