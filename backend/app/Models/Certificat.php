<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificat extends Model
{
    use HasFactory;

    protected $table = 'certificats';

    protected $fillable = [
        'etudiant_id',
        'formation_id',
        'session_formation_id',
        'numero_certificat',
        'date_emission',
        'chemin_fichier',
    ];

    protected $casts = [
        'date_emission' => 'date',
    ];

    /**
     * Relations
     */
    
    /**
     * Étudiant bénéficiaire
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    /**
     * Formation associée
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Session associée
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(SessionFormation::class, 'session_formation_id');
    }
}
