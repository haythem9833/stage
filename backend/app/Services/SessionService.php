<?php

namespace App\Services;

use App\Models\SessionFormation;
use Illuminate\Database\Eloquent\Collection;

class SessionService
{
    /**
     * Créer une session de formation
     */
    public function creer(array $data): SessionFormation
    {
        return SessionFormation::create($data);
    }

    /**
     * Mettre à jour une session
     */
    public function mettreAJour(SessionFormation $session, array $data): SessionFormation
    {
        $session->update($data);
        return $session;
    }

    /**
     * Récupérer toutes les sessions
     */
    public function toutes(): Collection
    {
        return SessionFormation::with(['formation', 'inscriptions'])
            ->get();
    }

    /**
     * Récupérer les sessions d'une formation
     */
    public function getParFormation(int $formationId): Collection
    {
        return SessionFormation::where('formation_id', $formationId)
            ->with('inscriptions')
            ->get();
    }

    /**
     * Récupérer une session par ID
     */
    public function getById(int $id): SessionFormation
    {
        return SessionFormation::with(['formation', 'inscriptions', 'certificats'])
            ->findOrFail($id);
    }

    /**
     * Supprimer une session
     */
    public function supprimer(SessionFormation $session): void
    {
        $session->delete();
    }

    /**
     * Marquer une session comme terminée
     */
    public function terminer(SessionFormation $session): SessionFormation
    {
        $session->update(['statut' => 'terminee']);
        return $session;
    }

    /**
     * Valider une session
     */
    public function valider(SessionFormation $session): SessionFormation
    {
        $session->update(['statut' => 'validee']);
        return $session;
    }

    /**
     * Récupérer les statistiques d'une session
     */
    public function getStatistiques(SessionFormation $session): array
    {
        $inscriptions = $session->inscriptions()->get();
        $certificats = $session->certificats()->get();

        return [
            'nombre_total_inscriptions' => $inscriptions->count(),
            'nombre_inscriptions_en_attente' => $inscriptions->where('statut', 'en_attente')->count(),
            'nombre_inscriptions_acceptees' => $inscriptions->where('statut', 'acceptee')->count(),
            'nombre_inscriptions_rejetees' => $inscriptions->where('statut', 'rejetee')->count(),
            'nombre_inscriptions_terminees' => $inscriptions->where('statut', 'terminez')->count(),
            'nombre_certificats' => $certificats->count(),
            'moyenne_notes' => $inscriptions->where('statut', 'terminez')->avg('note'),
        ];
    }
}
