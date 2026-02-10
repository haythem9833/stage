<?php

namespace App\Services;

use App\Models\Formation;
use Illuminate\Database\Eloquent\Collection;

class FormationService
{
    /**
     * Créer une formation
     */
    public function creer(array $data): Formation
    {
        return Formation::create($data);
    }

    /**
     * Mettre à jour une formation
     */
    public function mettreAJour(Formation $formation, array $data): Formation
    {
        $formation->update($data);
        return $formation;
    }

    /**
     * Récupérer toutes les formations
     */
    public function toutes(): Collection
    {
        return Formation::with('sessions')->get();
    }

    /**
     * Récupérer une formation par ID
     */
    public function getById(int $id): Formation
    {
        return Formation::with('sessions')->findOrFail($id);
    }

    /**
     * Supprimer une formation
     */
    public function supprimer(Formation $formation): void
    {
        $formation->delete();
    }
}
