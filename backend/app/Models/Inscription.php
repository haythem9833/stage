<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Inscription extends Model
{
    use HasFactory;

    protected $table = 'inscriptions';

    protected $fillable = [
        'etudiant_id',
        'formation_id',
        'statut',
        'note',
        'date_inscription',
    ];

    protected $casts = [
        'date_inscription' => 'date',
    ];

    /**
     * L'étudiant qui s'est inscrit
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    /**
     * Alias pour user (pour compatibilité)
     */
    public function user(): BelongsTo
    {
        return $this->etudiant();
    }

    /**
     * La formation
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * Évaluation de la formation
     */
    public function evaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class, 'inscrit_id');
    }

    /**
     * Ancien alias pour compatibilité (sessions supprimées)
     */
    public function sessionFormation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Vérifier si l'étudiant peut évaluer
     */
    public function canEvaluate(): bool
    {
        return $this->formation->isEvaluationOpen() && !$this->evaluation()->exists();
    }
}

