<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ressource extends Model
{
    use HasFactory;
    protected $fillable = [
        'salle_id',
        'nom',
        'type',
        'quantite',
        'etat',
        'notes',
    ];

    public function salle(): BelongsTo
    {
        return $this->belongsTo(Salle::class, 'salle_id');
    }

    /**
     * Types de ressources possibles
     */
    public static function types(): array
    {
        return ['equipement', 'mobilier', 'logiciel', 'autre'];
    }

    /**
     * États possibles
     */
    public static function etats(): array
    {
        return ['operational', 'maintenance', 'hors_service'];
    }
}
