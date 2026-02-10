<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SessionFormation extends Model
{
    use HasFactory;

    protected $table = 'session_formations';

    protected $fillable = [
        'formation_id',
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'lieu',
        'nombre_places',
        'statut',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    /**
     * Relations
     */
    
    /**
     * Formation associée
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Inscriptions à cette session
     */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class, 'session_formation_id');
    }

    /**
     * Certificats pour cette session
     */
    public function certificats(): HasMany
    {
        return $this->hasMany(Certificat::class, 'session_formation_id');
    }

    /**
     * Nombre d'inscriptions acceptées
     */
    public function inscriptionsAcceptees()
    {
        return $this->inscriptions()->where('statut', 'acceptee');
    }

    /**
     * Vérifier et valider automatiquement si >= 17 inscriptions
     */
    public function validerAutomatiquement(): void
    {
        $nombreInscriptions = $this->inscriptionsActives()->count();
        
        if ($nombreInscriptions >= 17 && $this->statut !== 'validee') {
            $this->statut = 'validee';
            $this->save();
        }
    }

    /**
     * Vérifier si la session est validée
     */
    public function isValidee(): bool
    {
        return $this->statut === 'validee';
    }

    /**
     * Vérifier si la session est terminée
     */
    public function isTerminee(): bool
    {
        return $this->statut === 'terminee' || now()->isAfter($this->date_fin);
    }
}
