<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        'formateur_id',
        'titre',
        'description',
        'duree',
        'statut',
        'date_debut',
        'date_fin',
        'date_debut_evaluation',
        'date_fin_evaluation',
    ];

    protected $casts = [
        'duree' => 'integer',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_debut_evaluation' => 'date',
        'date_fin_evaluation' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function formateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    /**
     * Inscriptions des étudiants
     */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }

    /**
     * Presences pour cette formation
     */
    public function presences(): HasMany
    {
        return $this->hasMany(Presence::class);
    }

    /**
     * Évaluations
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    /**
     * Vérifier si la formation est en phase d'évaluation
     */
    public function isInEvaluationPhase(): bool
    {
        return $this->statut === 'evaluation' && now()->between($this->date_debut_evaluation, $this->date_fin_evaluation);
    }

    /**
     * Vérifier si l'évaluation est ouverte
     */
    public function isEvaluationOpen(): bool
    {
        return $this->statut === 'evaluation' || 
               (now()->isAfter($this->date_debut_evaluation) && now()->isBefore($this->date_fin_evaluation->addDay()));
    }
}
