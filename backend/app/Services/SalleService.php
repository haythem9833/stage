<?php

namespace App\Services;

use App\Models\Salle;
use App\Models\Ressource;
use Carbon\Carbon;

class SalleService
{
    /**
     * Trouve les salles disponibles pour une période
     */
    public function trouverSallesDisponibles(Carbon $dateDebut, Carbon $dateFin, int $nombreParticipants): array
    {
        return Salle::findAvailable($dateDebut, $dateFin, $nombreParticipants)
            ->all();
    }

    /**
     * Recommande une salle optimale selon les critères
     */
    public function recommanderSalle(Carbon $dateDebut, Carbon $dateFin, int $nombreParticipants, array $equipementsRequis = []): ?Salle
    {
        $salles = Salle::findAvailable($dateDebut, $dateFin, $nombreParticipants);

        // Filtrer par équipements si nécessaire
        if (!empty($equipementsRequis)) {
            $salles = $salles->filter(function ($salle) use ($equipementsRequis) {
                $equipements = $salle->equipements ?? [];
                // Convertir JSON string en array si nécessaire
                if (is_string($equipements)) {
                    $equipements = json_decode($equipements, true) ?? [];
                }
                foreach ($equipementsRequis as $equipement) {
                    if (!in_array($equipement, $equipements, true)) {
                        return false;
                    }
                }
                return true;
            });
        }

        // Retourner la plus petite salle appropriée (économie d'espace)
        return $salles->first();
    }

    /**
     * Récupère le calendrier des réservations d'une salle
     */
    public function getCalendrier(Salle $salle, Carbon $dateDebut, Carbon $dateFin): array
    {
        return $salle->reservations()
            ->where('statut', '!=', 'annulee')
            ->whereBetween('date_debut', [$dateDebut, $dateFin])
            ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
            ->get()
            ->toArray();
    }

    /**
     * Crée une nouvelle salle
     */
    public function creerSalle(string $nom, int $capaciteMax, array $equipements = [], string $localisation = null): Salle
    {
        return Salle::create([
            'nom' => $nom,
            'capacite_max' => $capaciteMax,
            'equipements' => $equipements,
            'localisation' => $localisation,
        ]);
    }

    /**
     * Ajoute une ressource à une salle
     */
    public function ajouterRessource(Salle $salle, string $nom, string $type, int $quantite = 1): Ressource
    {
        return Ressource::create([
            'salle_id' => $salle->id,
            'nom' => $nom,
            'type' => $type,
            'quantite' => $quantite,
            'etat' => 'operational',
        ]);
    }

    /**
     * Valide la capacité d'une salle pour un nombre de participants
     */
    public function validerCapacite(Salle $salle, int $nombreParticipants): bool
    {
        return $salle->capacite_max >= $nombreParticipants;
    }
}
