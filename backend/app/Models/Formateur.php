<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Formateur extends User
{
    protected $table = 'users';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'account_status',
        'is_formateur',
        'jours_disponibles',
        'heure_debut_prefere',
        'heure_fin_prefere',
    ];

    protected $casts = [
        'jours_disponibles' => 'array',
        'email_verified_at' => 'datetime',
    ];

    public function formations()
    {
        return $this->hasMany(Formation::class, 'formateur_id');
    }

    public function disponibilites(): HasMany
    {
        return $this->hasMany(DisponibiliteFormateur::class, 'formateur_id');
    }

    /**
     * Vérifie si le formateur est disponible pour une plage horaire donnée
     */
    public function estDisponible(\DateTime $dateDebut, \DateTime $dateFin): bool
    {
        // Vérifier les indisponibilités
        $indisponibilites = $this->disponibilites()
            ->where('type', 'indisponibilite')
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                    ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                    ->orWhere(function ($q) use ($dateDebut, $dateFin) {
                        $q->where('date_debut', '<=', $dateDebut)
                          ->where('date_fin', '>=', $dateFin);
                    });
            })
            ->exists();

        return !$indisponibilites;
    }
}
