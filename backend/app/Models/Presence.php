<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    use HasFactory;
    protected $fillable = [
        'inscription_id',
        'formation_id',
        'date_session',
        'statut',
        'justification',
        'notes',
        'is_active',
        'session_id',
    ];

    protected $casts = [
        'date_session' => 'date',
        'is_active' => 'boolean',
    ];

    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class, 'inscription_id');
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Statuts de présence possibles
     */
    public static function statuts(): array
    {
        return ['present', 'absent', 'retard', 'justifie'];
    }

    /**
     * Calcule le taux de présence d'un étudiant pour une session
     */
    public static function tauxPresence($inscriptionId, $sessionId): float
    {
        $total = self::where('inscription_id', $inscriptionId)
            ->where('session_id', $sessionId)
            ->count();

        if ($total === 0) {
            return 0;
        }

        $presentes = self::where('inscription_id', $inscriptionId)
            ->where('session_id', $sessionId)
            ->whereIn('statut', ['present', 'justifie'])
            ->count();

        return round(($presentes / $total) * 100, 2);
    }
}
