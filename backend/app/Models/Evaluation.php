<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasFactory;

    protected $table = 'evaluations';

    protected $fillable = [
        'inscrit_id',
        'formation_id',
        'note',
        'commentaire',
        'environnement_note',
        'environnement_commentaire',
        'formateur_note',
        'formateur_commentaire',
        'formation_note',
        'formation_commentaire',
        'services_note',
        'services_commentaire',
        'suggestions',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'note' => 'integer',
        'environnement_note' => 'integer',
        'formateur_note' => 'integer',
        'formation_note' => 'integer',
        'services_note' => 'integer',
        'submitted_at' => 'datetime',
    ];

    /**
     * Inscription évaluée
     */
    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class, 'inscrit_id');
    }

    /**
     * Formation évaluée
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Calculer la note globale moyenne
     */
    public function calculateAverageScore(): ?float
    {
        $scores = array_filter([
            $this->environnement_note,
            $this->formateur_note,
            $this->formation_note,
            $this->services_note,
        ]);

        if (empty($scores)) {
            return null;
        }

        return round(array_sum($scores) / count($scores), 2);
    }

    /**
     * Marquer comme complétée
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'submitted_at' => now(),
            'note' => $this->calculateAverageScore(),
        ]);
    }
}
