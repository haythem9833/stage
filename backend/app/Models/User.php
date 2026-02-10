<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Attributs assignables en masse
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'account_status',
        'requested_role',
        'approved_at',
        'approved_by',
    ];

    /**
     * Attributs cachés pour la sérialisation
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Type casting des attributs
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relations
     */
    
    /**
     * Inscriptions pour un étudiant
     */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class, 'etudiant_id');
    }

    /**
     * Certificats pour un étudiant
     */
    public function certificats(): HasMany
    {
        return $this->hasMany(Certificat::class, 'etudiant_id');
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Vérifier si l'utilisateur est admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Vérifier si l'utilisateur est formateur
     */
    public function isFormateur(): bool
    {
        return $this->hasRole('formateur');
    }

    /**
     * Vérifier si l'utilisateur est étudiant
     */
    public function isEtudiant(): bool
    {
        return $this->hasRole('etudiant');
    }
}
