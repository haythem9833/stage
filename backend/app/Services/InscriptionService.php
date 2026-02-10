<?php

namespace App\Services;

use App\Models\Inscription;
use App\Models\SessionFormation;
use Illuminate\Database\Eloquent\Collection;

class InscriptionService
{
    /**
     * Inscrire un étudiant à une session
     */
    public function inscrire(int $etudiantId, int $sessionId): Inscription
    {
        $session = SessionFormation::findOrFail($sessionId);

        // Vérifier si la session a des places disponibles
        $nombreInscriptions = $session->inscriptionsActives()->count();
        if ($nombreInscriptions >= $session->nombre_places) {
            throw new \Exception('Aucune place disponible pour cette session');
        }

        // Vérifier si l'étudiant est déjà inscrit
        $inscriptionExistante = Inscription::where('etudiant_id', $etudiantId)
            ->where('session_formation_id', $sessionId)
            ->first();

        if ($inscriptionExistante) {
            throw new \Exception('Cet étudiant est déjà inscrit à cette session');
        }

        $inscription = Inscription::create([
            'etudiant_id' => $etudiantId,
            'session_formation_id' => $sessionId,
            'statut' => 'active',
            'date_inscription' => now()->toDateString(),
        ]);

        // Vérifier et valider automatiquement
        $session->validerAutomatiquement();

        return $inscription;
    }

    /**
     * Récupérer les inscriptions d'un étudiant
     */
    public function getInscriptionsEtudiant(int $etudiantId): Collection
    {
        return Inscription::where('etudiant_id', $etudiantId)
            ->with(['session', 'session.formation'])
            ->get();
    }

    /**
     * Récupérer les inscriptions d'une session
     */
    public function getInscriptionsSession(int $sessionId): Collection
    {
        return Inscription::where('session_formation_id', $sessionId)
            ->with('etudiant')
            ->get();
    }

    /**
     * Annuler une inscription
     */
    public function annulerInscription(int $inscriptionId): void
    {
        $inscription = Inscription::findOrFail($inscriptionId);
        $inscription->update(['statut' => 'abandonnee']);
    }

    /**
     * Terminer une inscription
     */
    public function terminerInscription(int $inscriptionId, float $note): void
    {
        $inscription = Inscription::findOrFail($inscriptionId);
        $inscription->update([
            'statut' => 'terminee',
            'note' => $note,
        ]);
    }
}
