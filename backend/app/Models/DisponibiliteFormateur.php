<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisponibiliteFormateur extends Model
{
    use HasFactory;
    protected $table = 'disponibilites_formateurs';

    protected $fillable = [
        'formateur_id',
        'date_debut',
        'date_fin',
        'type',
        'raison',
        'recurrence',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    public function formateur(): BelongsTo
    {
        return $this->belongsTo(Formateur::class, 'formateur_id');
    }

    /**
     * Types de disponibilité possibles
     */
    public static function types(): array
    {
        return ['disponibilite', 'indisponibilite', 'preferee'];
    }

    /**
     * Récurrence possibles
     */
    public static function recurrences(): array
    {
        return ['once', 'daily', 'weekly', 'monthly'];
    }
}
