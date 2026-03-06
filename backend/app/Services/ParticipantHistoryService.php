<?php

namespace App\Services;

use App\Models\User;
use App\Models\Inscription;
use App\Models\Certificat;
use Illuminate\Database\Eloquent\Collection;

class ParticipantHistoryService
{
    /**
     * Récupère l'historique complet d'un participant
     */
    public function getParticipantHistory(int $userId): array
    {
        $user = User::findOrFail($userId);
        
        // Inscriptions avec détails formations/sessions
        $inscriptions = Inscription::where('user_id', $userId)
            ->with(['sessionFormation.formation', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Certificats émis
        $certificats = Certificat::where('user_id', $userId)
            ->with(['sessionFormation.formation', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Statistiques
        $stats = [
            'total_formations' => $inscriptions->count(),
            'formations_validees' => $inscriptions->where('statut', 'validee')->count(),
            'certificats_obtenus' => $certificats->count(),
            'taux_completion' => $inscriptions->count() > 0 
                ? round(($inscriptions->where('statut', 'validee')->count() / $inscriptions->count()) * 100)
                : 0,
        ];

        // Timeline d'activités
        $timeline = $this->buildTimeline($inscriptions, $certificats);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'statistiques' => $stats,
            'inscriptions' => $inscriptions->map(fn($i) => [
                'id' => $i->id,
                'formation' => $i->sessionFormation?->formation?->titre,
                'session' => $i->sessionFormation?->titre,
                'date_debut' => $i->sessionFormation?->date_debut,
                'date_fin' => $i->sessionFormation?->date_fin,
                'statut' => $i->statut,
                'note' => $i->note,
                'date_inscription' => $i->created_at,
            ])->toArray(),
            'certificats' => $certificats->map(fn($c) => [
                'id' => $c->id,
                'formation' => $c->sessionFormation?->formation?->titre,
                'numero' => $c->numero_certificat,
                'date_emission' => $c->date_emission,
                'fichier' => $c->chemin_fichier,
            ])->toArray(),
            'timeline' => $timeline,
        ];
    }

    /**
     * Récupère l'historique pour tous les participants (admin)
     */
    public function getAllParticipantsHistory(string $role = null): Collection
    {
        $query = User::where('role', $role ?? 'etudiant')
            ->with([
                'inscriptions.sessionFormation.formation',
                'certificats.sessionFormation.formation'
            ])
            ->orderBy('name');

        return $query->get()->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'formations_suivies' => $user->inscriptions->count(),
            'certificats' => $user->certificats->count(),
            'last_activity' => max(
                $user->inscriptions->max('created_at'),
                $user->certificats->max('created_at')
            ),
        ]);
    }

    /**
     * Construit une timeline d'activités
     */
    private function buildTimeline($inscriptions, $certificats): array
    {
        $events = [];

        foreach ($inscriptions as $inscription) {
            $events[] = [
                'type' => 'inscription',
                'date' => $inscription->created_at,
                'formation' => $inscription->sessionFormation?->formation?->titre,
                'session' => $inscription->sessionFormation?->titre,
                'statut' => $inscription->statut,
                'description' => "Inscription à {$inscription->sessionFormation?->formation?->titre}",
            ];
        }

        foreach ($certificats as $certificat) {
            $events[] = [
                'type' => 'certificat',
                'date' => $certificat->created_at,
                'formation' => $certificat->sessionFormation?->formation?->titre,
                'numero' => $certificat->numero_certificat,
                'description' => "Certificat obtenu pour {$certificat->sessionFormation?->formation?->titre}",
            ];
        }

        // Tri par date décroissante
        usort($events, fn($a, $b) => $b['date'] <=> $a['date']);

        return $events;
    }
}
