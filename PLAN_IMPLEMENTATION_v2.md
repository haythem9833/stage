# 🚀 PLAN D'IMPLÉMENTATION - CNI Gestion Formations v2.0

**Date:** 25 février 2026  
**Version:** Roadmap complète avec priorités  
**Contexte:** Gestion formations PRÉSENTIELLES (pas e-learning)

---

## 📊 VISION GLOBALE

### Objectif
Transformer le système d'une simple gestion d'inscriptions en une **plateforme complète de gestion des formations présentielles** avec:
- ✅ Planning et salles
- ✅ Suivi de présences numérique
- ✅ Notifications automatiques
- ✅ Rapports d'activité
- ✅ Dashboard intelligence

### Périmètre
- **À AJOUTER:** 10 fonctionnalités regroupées en 3 priorités
- **À CONSERVER:** Tous les modèles actuels (user, formation, inscription, certificat)
- **À ÉVITER:** E-learning, microservices, AI, paiement, complexité inutile

### Envergure Temps
- **Priorité 1:** 60-80 heures (3-4 semaines)
- **Priorité 2:** 50-70 heures (2-3 semaines)
- **Priorité 3:** 20-30 heures (1-2 semaines)
- **TOTAL:** 130-180 heures (6-9 semaines si fulltime)

---

## 🎯 PRIORITÉ 1 — INDISPENSABLE (60-80h)

### 1. Gestion Plannings Formateurs

#### 📋 Spécification
Permettre aux formateurs de définir leurs disponibilités et détecter les conflits d'horaire.

#### 🗄️ Base de Données

**Migration 1: `add_planning_columns_to_formateurs_table`**
```php
// database/migrations/2026_02_25_000001_add_planning_to_users_table.php
Schema::table('users', function (Blueprint $table) {
    // Ajouter colonne pour savoir si c'est un formateur
    $table->boolean('is_formateur')->default(false)->after('role');
    
    // Planning (horaires préférés)
    // On stocke les jours dispo (1=lun, 2=mar, ..., 7=dim)
    // Format simple: "1,2,3,4,5" = lundi à vendredi
    $table->string('jours_disponibles')->nullable()->comment('Jours dispo (1-7)');
    $table->time('heure_debut_prefere')->nullable();
    $table->time('heure_fin_prefere')->nullable();
});
```

**Migration 2: `create_disponibilites_formateurs_table`**
```php
// database/migrations/2026_02_25_000002_create_disponibilites_formateurs_table.php
Schema::create('disponibilites_formateurs', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('formateur_id');
    $table->date('date_debut');
    $table->date('date_fin');
    $table->time('heure_debut');
    $table->time('heure_fin');
    $table->string('raison')->nullable(); // "Congrès", "Congés", etc.
    $table->enum('type', ['disponible', 'indisponible'])->default('disponible');
    $table->timestamps();
    
    $table->foreign('formateur_id')->references('id')->on('users')->onDelete('cascade');
    $table->index(['formateur_id', 'date_debut']);
});
```

#### 📁 Fichiers à Créer

**Backend:**
```
app/Models/Formateur.php           [CRÉER - extend User model]
app/Models/DisponibiliteFormateur.php
app/Services/PlanningService.php   [140 lignes]
app/Http/Controllers/PlanningController.php
```

**Code: app/Models/Formateur.php**
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Formateur extends User
{
    protected $fillable = [
        'nom', 'prenom', 'email', 'password', 'role',
        'is_formateur', 'jours_disponibles', 'heure_debut_prefere', 'heure_fin_prefere'
    ];

    /**
     * Disponibilités du formateur
     */
    public function disponibilites(): HasMany
    {
        return $this->hasMany(DisponibiliteFormateur::class, 'formateur_id');
    }

    /**
     * Vérifier si disponible à une date/heure
     */
    public function estDisponible(\DateTime $debut, \DateTime $fin): bool
    {
        // Vérifier pas de conflit dans disponibilites_formateurs
        return !$this->disponibilites()
            ->where('type', 'indisponible')
            ->where('date_debut', '<=', $debut->format('Y-m-d'))
            ->where('date_fin', '>=', $fin->format('Y-m-d'))
            ->exists();
    }
}
```

**Code: app/Services/PlanningService.php**
```php
<?php
namespace App\Services;

use App\Models\Formateur;
use App\Models\SessionFormation;
use Carbon\Carbon;

class PlanningService
{
    /**
     * Vérifier disponibilité formateur pour dates/heures données
     */
    public function estDisponible(
        Formateur $formateur, 
        Carbon $dateDebut, 
        Carbon $dateFin,
        $excludeSessionId = null
    ): bool
    {
        // 1. Vérifier disponibilités marquées (congés, etc.)
        if (!$formateur->estDisponible($dateDebut, $dateFin)) {
            return false;
        }

        // 2. Vérifier pas d'autres sessions en même temps
        $query = SessionFormation::where('formateur_id', $formateur->id)
            ->where('statut', '!=', 'abandonnee');
        
        if ($excludeSessionId) {
            $query->where('id', '!=', $excludeSessionId);
        }

        return !$query->whereBetween('date_debut', [$dateDebut, $dateFin])
            ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
            ->exists();
    }

    /**
     * Obtenir créneau suivant disponible pour un formateur
     */
    public function trouverProchainCreneau(
        Formateur $formateur,
        int $dureeSessions = 40  // heures
    ): ?array
    {
        $debut = now();
        
        for ($i = 0; $i < 30; $i++) {  // Chercher dans 30 jours
            $testDate = $debut->addDays($i);
            
            if ($formateur->estDisponible($testDate, $testDate->copy()->addHours($dureeSessions))) {
                return [
                    'date_debut' => $testDate,
                    'date_fin' => $testDate->copy()->addHours($dureeSessions)
                ];
            }
        }
        
        return null;
    }

    /**
     * Détecter conflits lors création session
     * Retourne array de conflits détectés
     */
    public function detecterConflits(
        Formateur $formateur,
        \DateTime $dateDebut,
        \DateTime $dateFin
    ): array
    {
        $conflits = [];

        // 1. Conflits avec indisponibilités marquées
        $indispos = $formateur->disponibilites()
            ->where('type', 'indisponible')
            ->where('date_debut', '<=', $dateDebut->format('Y-m-d'))
            ->where('date_fin', '>=', $dateFin->format('Y-m-d'))
            ->first();
        
        if ($indispos) {
            $conflits[] = [
                'type' => 'indisponibilite',
                'raison' => $indispos->raison,
                'date' => $indispos->date_debut
            ];
        }

        // 2. Conflits avec autres sessions
        $sessionConflictuelle = SessionFormation::where('formateur_id', $formateur->id)
            ->where('statut', '!=', 'abandonnee')
            ->where(function ($q) use ($dateDebut, $dateFin) {
                $q->whereBetween('date_debut', [$dateDebut, $dateFin])
                  ->orWhereBetween('date_fin', [$dateDebut, $dateFin]);
            })
            ->first();
        
        if ($sessionConflictuelle) {
            $conflits[] = [
                'type' => 'session_chevauchante',
                'session_id' => $sessionConflictuelle->id,
                'titre' => $sessionConflictuelle->titre,
                'date_debut' => $sessionConflictuelle->date_debut,
                'date_fin' => $sessionConflictuelle->date_fin
            ];
        }

        return $conflits;
    }
}
```

#### 🌐 API Endpoints

**New Routes:**
```php
// routes/api.php - à ajouter dans middleware auth:sanctum

// Planning formateurs
Route::get('/formateurs/{id}/planning', [PlanningController::class, 'planning'])
    ->middleware('role:admin,formateur');
    
Route::post('/formateurs/{id}/disponibilites', [PlanningController::class, 'ajouterDisponibilite'])
    ->middleware('role:admin,formateur');
    
Route::delete('/disponibilites/{id}', [PlanningController::class, 'supprimerDisponibilite'])
    ->middleware('role:admin,formateur');

// Vérification
Route::post('/formateurs/check-disponibilite', [PlanningController::class, 'verifierDisponibilite'])
    ->middleware('role:admin,formateur');
```

**Endpoints détaillés:**
```
GET    /api/formateurs/{id}/planning
       Response: {
         formateur: { id, nom, prenom },
         indisponibilites: [ { date_debut, date_fin, raison, type } ],
         sessions_affectees: [ { id, titre, date_debut, date_fin } ],
         jours_preferes: "1,2,3,4,5"
       }

POST   /api/formateurs/{id}/disponibilites
       Request: {
         type: "disponible|indisponible",
         date_debut: "2026-03-01",
         date_fin: "2026-03-05",
         raison: "Congés"
       }
       Response: { success, message, disponibilite }

DELETE /api/disponibilites/{id}
       Response: { success }

POST   /api/formateurs/check-disponibilite
       Request: {
         formateur_id: 1,
         date_debut: "2026-03-01 09:00",
         date_fin: "2026-03-05 17:00",
         duree_heures: 40
       }
       Response: {
         available: true|false,
         conflits: [ ... ],
         prochain_creneau_libre: { date_debut, date_fin }
       }
```

#### 🎨 Frontend Components

**Components à créer:**
```
components/Planning/
├── PlanningFormateur.tsx         [Calendar view]
├── AjouterIndisponibilite.tsx    [Modal form]
├── ConflitDetectionBanner.tsx    [Warning alert]
└── PlanningFormateur.css
```

**PlanningFormateur.tsx (sketch):**
```javascript
// Affiche:
// - Calendrier des 3 prochains mois
// - Jours dispo/indispo de couleurs différentes
// - Drag-drop pour ajouter indispos
// - Sessions affectées du formateur
// - Bouton "Ajouter indisponibilité"

export default function PlanningFormateur({ formateurId }) {
  const [indisponibilites, setIndisponibilites] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    axios.get(`/api/formateurs/${formateurId}/planning`)
      .then(res => {
        setIndisponibilites(res.data.indisponibilites);
        setSessions(res.data.sessions_affectees);
      });
  }, []);
  
  // Rendu calendrier + sessions
}
```

#### ⏱️ Estimation
- **Migrations:** 2h
- **Models/Services:** 8h
- **Controllers:** 4h
- **API endpoints:** 2h
- **Frontend components:** 6h
- **Tests:** 4h
- **Total: 26 heures**

#### 🔗 Dépendances
- ❌ Pas de dépendance externe
- ⚠️ Permet de détecter conflits avant création session

---

### 2. Gestion des Salles et Ressources

#### 📋 Spécification
Cataloguer les salles de formation, gérer leur capacité et leurs équipements, détecter les conflits de réservation.

#### 🗄️ Base de Données

**Migration 1: `create_salles_table`**
```php
Schema::create('salles', function (Blueprint $table) {
    $table->id();
    $table->string('nom');
    $table->integer('capacite_max');
    $table->text('description')->nullable();
    $table->string('localisation')->nullable();
    $table->text('equipements')->nullable(); // JSON: ["Vidéoproj", "Tableau", ...]
    $table->boolean('disponible')->default(true);
    $table->timestamps();
    
    $table->unique('nom');
});
```

**Migration 2: `create_ressources_table`**
```php
Schema::create('ressources', function (Blueprint $table) {
    $table->id();
    $table->string('nom');
    $table->string('type'); // "projecteur", "tableau", "chaises", etc.
    $table->integer('quantite')->default(1);
    $table->boolean('disponible')->default(true);
    $table->timestamps();
});
```

**Migration 3: `add_salle_id_to_sessions_table`**
```php
Schema::table('session_formations', function (Blueprint $table) {
    $table->unsignedBigInteger('salle_id')->nullable()->after('lieu');
    $table->foreign('salle_id')->references('id')->on('salles')->nullOnDelete();
});
```

#### 📁 Fichiers à Créer

**Backend:**
```
app/Models/Salle.php
app/Models/Ressource.php
app/Services/SalleService.php         [120 lignes]
app/Http/Controllers/SalleController.php
```

**Code: app/Models/Salle.php**
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Salle extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'capacite_max', 'description', 'localisation', 'equipements', 'disponible'
    ];

    protected $casts = [
        'equipements' => 'array',
    ];

    /**
     * Sessions dans cette salle
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(SessionFormation::class);
    }

    /**
     * Vérifier capacité pour nombre d'inscrits
     */
    public function peutAccueillir(int $nombreInscrits): bool
    {
        return $nombreInscrits <= $this->capacite_max;
    }

    /**
     * Vérifier disponibilité à une période donnée
     */
    public function estDisponible(\DateTime $dateDebut, \DateTime $dateFin): bool
    {
        return !$this->sessions()
            ->where('statut', '!=', 'abandonnee')
            ->whereBetween('date_debut', [$dateDebut, $dateFin])
            ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
            ->exists();
    }
}
```

**Code: app/Services/SalleService.php**
```php
<?php
namespace App\Services;

use App\Models\Salle;
use Carbon\Carbon;

class SalleService
{
    /**
     * Trouver salles disponibles pour une session
     */
    public function trouverSallesDisponibles(
        Carbon $dateDebut,
        Carbon $dateFin,
        int $nombreParticipants
    ): \Illuminate\Database\Eloquent\Collection
    {
        return Salle::where('disponible', true)
            ->where('capacite_max', '>=', $nombreParticipants)
            ->get()
            ->filter(function (Salle $salle) use ($dateDebut, $dateFin) {
                return $salle->estDisponible($dateDebut, $dateFin);
            });
    }

    /**
     * Obtenir salles avec leurs réservations pour une plage horaire
     */
    public function getSallesAvecCalendrier(Carbon $dateDebut, Carbon $dateFin)
    {
        $salles = Salle::all();
        
        return $salles->map(function (Salle $salle) use ($dateDebut, $dateFin) {
            return [
                'salle' => $salle,
                'sessions_reservees' => $salle->sessions()
                    ->whereBetween('date_debut', [$dateDebut, $dateFin])
                    ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                    ->get()
            ];
        });
    }

    /**
     * Déterminer meilleure salle pour une session
     * (plus petite salle capable d'accueillir)
     */
    public function recommanderSalle(
        Carbon $dateDebut,
        Carbon $dateFin,
        int $nombreParticipants
    ): ?Salle
    {
        return $this->trouverSallesDisponibles($dateDebut, $dateFin, $nombreParticipants)
            ->sortBy('capacite_max')
            ->first();
    }
}
```

#### 🌐 API Endpoints

```
GET    /api/salles
       → List toutes salles

POST   /api/salles
       → Créer salle (admin)
       Body: { nom, capacite_max, description, localisation, equipements }

GET    /api/salles/{id}
       → Détail salle + sessions

PUT    /api/salles/{id}
       → Modifier salle

DELETE /api/salles/{id}
       → Supprimer salle (admin)

GET    /api/salles/disponibles?date_debut=...&date_fin=...&nb_participants=N
       → Salles dispo pour période + capacité
       Response: [
         { id, nom, capacite_max, equipements, distanceFIFO: "optimale" }
       ]

GET    /api/salles/calendrier?date_debut=...&date_fin=...
       → Vue calendrier toutes salles avec réservations
       Response: {
         salles: [
           { salle: {...}, sessions_reservees: [...] }
         ]
       }
```

#### 🎨 Frontend Components

```
components/Salles/
├── ListeSalles.tsx
├── SalleDetail.tsx
├── FormSalle.tsx
├── CalendrierSalles.tsx      [Calendar grid]
└── DisponibiliteChecker.tsx
```

**CalendrierSalles (sketch):**
```javascript
// Affiche grille:
// - Colonnes: Jours (15 jours)
// - Lignes: Salles
// - Cases: Sessions affectées (couleurs)
// - Hover: Détails session

// Permet: Clic sur case libre → Créer session
```

#### ⏱️ Estimation
- **Migrations:** 2h
- **Models:** 4h
- **Services:** 6h
- **Controllers:** 4h
- **API endpoints:** 2h
- **Frontend:** 8h
- **Tests:** 4h
- **Total: 30 heures**

#### 🔗 Dépendances
- ⚠️ SessionFormation doit avoir salle_id
- ✓ Utilise PlanningService pour vérifier formateur dispo

---

### 3. Suivi des Présences

#### 📋 Spécification
Enregistrer les présences/absences des étudiants par session, générer feuilles d'émargement, calculer taux de présence.

#### 🗄️ Base de Données

**Migration: `create_presences_table`**
```php
Schema::create('presences', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('session_formation_id');
    $table->unsignedBigInteger('etudiant_id');
    $table->date('date_session');
    $table->enum('statut', ['present', 'absent', 'retard', 'justifie'])->default('present');
    $table->text('justification')->nullable();
    $table->timestamps();
    
    $table->foreign('session_formation_id')->references('id')->on('session_formations')->onDelete('cascade');
    $table->foreign('etudiant_id')->references('id')->on('users')->onDelete('cascade');
    $table->unique(['session_formation_id', 'etudiant_id', 'date_session']);
    $table->index(['session_formation_id', 'date_session']);
});
```

#### 📁 Fichiers à Créer

**Backend:**
```
app/Models/Presence.php
app/Services/PresenceService.php      [150 lignes]
app/Http/Controllers/PresenceController.php
app/Jobs/GenererFeuilleEmargement.php
```

**Code: app/Models/Presence.php**
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    protected $table = 'presences';

    protected $fillable = [
        'session_formation_id', 'etudiant_id', 'date_session', 'statut', 'justification'
    ];

    protected $casts = [
        'date_session' => 'date',
    ];

    /**
     * Session concernée
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(SessionFormation::class, 'session_formation_id');
    }

    /**
     * Étudiant concerné
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    /**
     * Vérifier si présence ou absence
     */
    public function estPresent(): bool
    {
        return in_array($this->statut, ['present', 'retard']);
    }
}
```

**Code: app/Services/PresenceService.php**
```php
<?php
namespace App\Services;

use App\Models\SessionFormation;
use App\Models\Presence;
use App\Models\Inscription;
use Carbon\Carbon;

class PresenceService
{
    /**
     * Marquer présences en masse (par session et jour)
     */
    public function marquerPresences(
        int $sessionId,
        Carbon $date,
        array $presences  // [{etudiant_id: 1, statut: 'present'}, ...]
    ): void
    {
        $session = SessionFormation::findOrFail($sessionId);

        foreach ($presences as $presence) {
            Presence::updateOrCreate(
                [
                    'session_formation_id' => $sessionId,
                    'etudiant_id' => $presence['etudiant_id'],
                    'date_session' => $date
                ],
                [
                    'statut' => $presence['statut'] ?? 'present',
                    'justification' => $presence['justification'] ?? null
                ]
            );
        }
    }

    /**
     * Calculer taux de présence pour un étudiant dans une session
     */
    public function getTauxPresence(int $etudiantId, int $sessionId): float
    {
        $totalJours = Presence::where('session_formation_id', $sessionId)
            ->distinct('date_session')
            ->count('date_session');
        
        if ($totalJours === 0) {
            return 0;
        }

        $joursPresent = Presence::where('session_formation_id', $sessionId)
            ->where('etudiant_id', $etudiantId)
            ->whereIn('statut', ['present', 'retard'])
            ->distinct('date_session')
            ->count('date_session');

        return round(($joursPresent / $totalJours) * 100, 2);
    }

    /**
     * Obtenir feuille de présence pour une session
     */
    public function getFeuillePresence(int $sessionId): array
    {
        $session = SessionFormation::with('inscriptions.etudiant')->findOrFail($sessionId);

        $jours = Presence::where('session_formation_id', $sessionId)
            ->distinct('date_session')
            ->pluck('date_session')
            ->sort();

        $etudiants = $session->inscriptions()->with('etudiant')->get();

        $donnees = [];
        foreach ($etudiants as $inscription) {
            $row = [
                'etudiant_id' => $inscription->etudiant_id,
                'nom_prenom' => $inscription->etudiant->nom . ' ' . $inscription->etudiant->prenom,
                'presences' => []
            ];

            foreach ($jours as $jour) {
                $presence = Presence::where('session_formation_id', $sessionId)
                    ->where('etudiant_id', $inscription->etudiant_id)
                    ->where('date_session', $jour)
                    ->first();

                $row['presences'][$jour->format('Y-m-d')] = $presence?->statut ?? 'absent';
            }

            $row['taux'] = $this->getTauxPresence($inscription->etudiant_id, $sessionId);
            $donnees[] = $row;
        }

        return [
            'session' => $session,
            'jours' => $jours,
            'etudiants' => $donnees
        ];
    }

    /**
     * Générer PDF feuille de présence
     */
    public function genererPdfPresence(int $sessionId): string
    {
        $donnees = $this->getFeuillePresence($sessionId);

        $pdf = \PDF::loadView('presences.feuille-emargement', $donnees);
        $nom_fichier = "presences_session_{$sessionId}_" . now()->format('YmdHis') . ".pdf";
        
        \Storage::disk('local')->put("presences/$nom_fichier", $pdf->output());

        return "presences/$nom_fichier";
    }

    /**
     * Obtenir synthèse présences (par statut)
     */
    public function getSynthese(int $sessionId): array
    {
        return [
            'total_inscrits' => Inscription::where('formation_id', 
                SessionFormation::find($sessionId)->formation_id)->count(),
            'total_presents' => Presence::where('session_formation_id', $sessionId)
                ->whereIn('statut', ['present', 'retard'])->count(),
            'total_absents' => Presence::where('session_formation_id', $sessionId)
                ->where('statut', 'absent')->count(),
            'total_justifies' => Presence::where('session_formation_id', $sessionId)
                ->where('statut', 'justifie')->count(),
        ];
    }
}
```

#### 🌐 API Endpoints

```
POST   /api/sessions/{id}/presences/batch
       → Marquer présences en masse (formateur)
       Body: {
         date: "2026-03-01",
         presences: [
           { etudiant_id: 1, statut: "present" },
           { etudiant_id: 2, statut: "absent", justification: "Sick" }
         ]
       }

GET    /api/sessions/{id}/presences
       → Obtenir toutes presences session

GET    /api/sessions/{id}/presences?etudiant_id=N
       → Presences d'un étudiant dans session

GET    /api/sessions/{id}/feuille-presence
       → Données feuille (JSON)
       Response: {
         session: {...},
         jours: ["2026-03-01", ...],
         etudiants: [
           { nom_prenom, presences: {date: statut}, taux: 95.5 }
         ]
       }

GET    /api/sessions/{id}/feuille-presence/pdf
       → Télécharger PDF feuille

GET    /api/sessions/{id}/presences/synthese
       → Résumé statistiques
       Response: {
         total_inscrits: 20,
         total_presents: 19,
         total_absents: 1,
         total_justifies: 0
       }

GET    /api/etudiants/{id}/taux-presence?session_id=N
       → Taux présence étudiant dans session
```

#### 🎨 Frontend Components

```
components/Presences/
├── FeuillePresenceForm.tsx     [Interface marquage]
├── FeuillePresenceView.tsx     [Vue tableau présences]
├── TauxPresenceCard.tsx
├── JustificationModal.tsx
└── PresenceStats.tsx
```

**FeuillePresenceForm.tsx (sketch):**
```javascript
// Formulaire pour formateur:
// - Sélection date session
// - Tableau: Étudiant | Présent | Absent | Retard | Justifié | Note justification
// - Bouton "Enregistrer"
// - Affiche taux pour chaque étudiant

export default function FeuillePresenceForm({ sessionId }) {
  const [date, setDate] = useState(null);
  const [presences, setPresences] = useState([]);
  
  const handleSubmit = async () => {
    await axios.post(`/api/sessions/${sessionId}/presences/batch`, {
      date,
      presences
    });
  };
  
  // Rendu tableau + boutons
}
```

#### ⏱️ Estimation
- **Migrations:** 1h
- **Models:** 3h
- **Services:** 10h
- **Controllers:** 4h
- **API endpoints:** 2h
- **Views Blade (PDF):** 4h
- **Frontend:** 8h
- **Tests:** 4h
- **Total: 36 heures**

#### 🔗 Dépendances
- ⚠️ SessionFormation doit être complètement créée
- ✓ Utilise Inscription pour obtenir liste étudiants
- ✓ DOMPDF pour PDF feuille

---

### 4. Dashboard Admin Amélioré

#### 📋 Spécification
Afficher vue globale avec graphiques, alertes, KPIs sessions, planning visuel.

#### 📁 Fichiers à Créer

**Frontend:**
```
pages/admin/dashboard-v2.tsx
components/Dashboard/
├── GraphiqueTauxRemplissage.tsx
├── SessionsCalendrier.tsx
├── AlertesWidget.tsx
├── StatistiquesCard.tsx
├── TaxPresenceGlobal.tsx
└── FormationsPopulaires.tsx
```

**Code: pages/admin/dashboard-v2.tsx (sketch)**
```javascript
export default function AdminDashboardV2() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [alertes, setAlertes] = useState([]);

  useEffect(() => {
    // Charger stats
    axios.get('/api/admin/dashboard-v2/stats')
      .then(res => {
        setStats(res.data.stats);
        setSessions(res.data.sessions);
        setAlertes(res.data.alertes);
      });
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatistiquesCard titre="Sessions Actives" value={stats?.sessions_actives} />
        <StatistiquesCard titre="Taux Remplissage Moy" value={`${stats?.taux_remplissage}%`} />
        <StatistiquesCard titre="Taux Présence Global" value={`${stats?.taux_presence_global}%`} />
        <StatistiquesCard titre="Formations Populaires" value={stats?.top_formation} />
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <AlertesWidget alertes={alertes} />
        <GraphiqueTauxRemplissage data={stats?.remplissage_par_session} />
      </div>

      <SessionsCalendrier sessions={sessions} />
    </Layout>
  );
}
```

#### 🌐 API Endpoint

```
GET    /api/admin/dashboard-v2/stats
       Response: {
         stats: {
           sessions_actives: 12,
           sessions_validees: 8,
           taux_remplissage: 87.5,
           taux_presence_global: 94.2,
           top_formation: "Python Avancé",
           remplissage_par_session: [ {session, taux} ]
         },
         sessions: [ {id, titre, date, inscriptions, places, taux} ],
         alertes: [
           { type: "warning", message: "Session Python non validée (12/17)" },
           { type: "info", message: "Session Js démarre demain" }
         ]
       }
```

#### ⏱️ Estimation
- **Components:** 12h
- **API backend:** 4h
- **Styling:** 4h
- **Tests:** 2h
- **Total: 22 heures**

#### 🔗 Dépendances
- ✓ Utilise données SessionFormation, Inscription, Presence
- ✓ Affiche alertes détectées par autres services

---

## **SOUS-TOTAL PRIORITÉ 1: 114 heures**

Si timeline serrée, ordre recommandé:
1. **Salles & Ressources** (30h) - Fondamental
2. **Suivi Presences** (36h) - Cœur métier
3. **Planning Formateurs** (26h) - Validation
4. **Dashboard** (22h) - Nice to have mais utile

---

## 🎯 PRIORITÉ 2 — IMPORTANT (50-70h)

### 5. Catalogue Formations Enrichi

#### 📋 Spécification
Enrichir Formation avec description, objectifs, prérequis, pour affichage public

#### Modifications DB
```php
// Migration: add_fields_to_formations_table
Schema::table('formations', function (Blueprint $table) {
    $table->text('description_longue')->nullable();
    $table->text('objectifs')->nullable();  // JSON array
    $table->string('domaine')->nullable();  // "IT", "RH", "Management"
    $table->enum('niveau', ['débutant', 'intermédiaire', 'avancé'])->default('intermédiaire');
    $table->integer('duree_standard')->nullable(); // en heures
    $table->text('prerequis')->nullable();  // JSON array
    $table->string('public_cible')->nullable(); // "Manager", "Agents", etc.
});
```

#### Fichiers
```
app/Http/Controllers/CatalogueController.php
pages/catalogue.tsx                     [PUBLIC page]
components/FormationCard.tsx            [Plus de détails]
```

#### API
```
GET    /api/catalogue                   [PUBLIC - pas d'auth]
GET    /api/catalogue?domaine=IT&niveau=avancé
GET    /api/formations/{id}/details     [Détail complet]
```

#### ⏱️ Estimation: 16 heures

---

### 6. Historique Participant

#### 📋 Spécification
Vue complète carrière de l'étudiant (formations suivies, dates, presences, notes)

#### Fichiers
```
app/Services/HistoriqueService.php
pages/etudiant/mon-parcours.tsx
components/Historique/
├── FormationsCompletes.tsx
├── CertificatsTelechargement.tsx
├── StatistiquesParticipant.tsx
└── ExportHistorique.tsx
```

#### API
```
GET    /api/etudiants/{id}/historique
GET    /api/etudiants/{id}/certifications
POST   /api/etudiants/{id}/export-historique
```

#### ⏱️ Estimation: 14 heures

---

### 7. Notifications et Rappels

#### 📋 Spécification
Emails automatiques: confirmation, rappel J-2, validation session, certificat prêt

#### Fichiers
```
app/Jobs/SendConfirmationInscriptionJob.php
app/Jobs/SendReminderJ2Job.php
app/Jobs/SendCertificatReadyJob.php
app/Services/NotificationService.php
app/Mail/ConfirmationInscription.php
resources/views/emails/confirmation-inscription.blade.php
resources/views/emails/reminder-j2.blade.php
resources/views/emails/certificat-ready.blade.php
```

#### Événements à déclencher
```
// Dans InscriptionService
event(new InscriptionConfirmed($inscription));

// Dans SessionService (après validation auto)
event(new SessionValidated($session));

// Dans CertificatService
event(new CertificatGenerated($certificat));
```

#### Configuration
```env
MAIL_DRIVER=smtp
MAIL_FROM_NAME=CNI Formations
QUEUE_CONNECTION=database  # Pour Jobs
```

#### ⏱️ Estimation: 12 heures

---

### 8. Export et Rapports

#### 📋 Spécification
Exports CSV/Excel de participants, presences, stats

#### Fichiers
```
app/Services/ExportService.php
app/Exports/ParticipantsExport.php        [Excel via Maatwebsite]
app/Exports/PresencesExport.php
app/Exports/RapportStatistiques.php
```

#### API
```
GET    /api/sessions/{id}/export/participants?format=csv|xlsx
GET    /api/rapports/presences?date_debut=...&date_fin=...
GET    /api/rapports/statistiques/pdf
```

#### Dépendances
```json
"maatwebsite/excel": "^3.1"
```

#### ⏱️ Estimation: 10 heures

---

**SOUS-TOTAL PRIORITÉ 2: 52 heures**

---

## 🎯 PRIORITÉ 3 — BONUS (20-30h)

### 9. Liste d'Attente

#### 📋 Spécification
Quand session pleine, inscrits supplémentaires en liste d'attente

#### Migrations
```php
Schema::table('inscriptions', function (Blueprint $table) {
    $table->enum('statut', ['en_attente', 'accepte', 'liste_attente', 'refuse'])
          ->change();  // modifier colonne existante
});
```

#### Logic
```php
// Dans InscriptionService.inscrire()
if ($session->inscriptions()->where('statut', 'accepte')->count() >= $session->nombre_places) {
    $inscription->statut = 'liste_attente';
} else {
    $inscription->statut = 'accepte';
}

// Job: Quand inscription annulée, promouvoir de la liste d'attente
// Notifier : "Une place s'est libérée, vous avez 24h pour confirmer"
```

#### ⏱️ Estimation: 10 heures

---

### 10. Filtres et Recherches Avancés

#### 📋 Spécification
Filtres dynamiques sur sessions (date, formateur, salle, statut)

#### Fichiers
```
components/SessionFilter.tsx
components/SearchSession.tsx
services/api/sessionService.ts
```

#### API
```
GET    /api/sessions/search?q=python&formateur=1&date_min=...&date_max=...
GET    /api/sessions/filter?salle_id=1&statut=active
```

#### ⏱️ Estimation: 8 heures

---

**SOUS-TOTAL PRIORITÉ 3: 18 heures**

---

## 📊 RÉCAPITULATIF COMPLET

| Priorité | Fonctionnalité | Heures | Dépendances |
|----------|---|--:|---|
| **P1** | Planning Formateurs | 26 | Session |
| **P1** | Salles & Ressources | 30 | Session |
| **P1** | Suivi Presences | 36 | Session, Inscription |
| **P1** | Dashboard V2 | 22 | All |
| **P2** | Catalogue Enrichi | 16 | Formation |
| **P2** | Historique Participant | 14 | Inscription, Presence, Certificat |
| **P2** | Notifications | 12 | Events, Mail |
| **P2** | Exports | 10 | Session, Inscription, Presence |
| **P3** | Liste Attente | 10 | Inscription |
| **P3** | Filtres Avancés | 8 | Frontend |
| | **TOTAL** | **184 heures** | |

---

## 🗂️ NOUVELLES MIGRATIONS COMPLÈTES

```php
// À créer DANS L'ORDRE

1. 2026_02_25_000001_add_planning_columns_to_users_table.php
2. 2026_02_25_000002_create_disponibilites_formateurs_table.php
3. 2026_02_25_000003_create_salles_table.php
4. 2026_02_25_000004_create_ressources_table.php
5. 2026_02_25_000005_add_salle_id_to_sessions_table.php
6. 2026_02_25_000006_create_presences_table.php
7. 2026_02_25_000007_add_fields_to_formations_table.php
8. 2026_02_25_000008_modify_inscriptions_statut_enum.php
```

---

## 📁 STRUCTURE MODÈLES FINAUX

```
app/Models/
├── User.php               [EXISTANT - enhance with is_formateur]
├── Formation.php          [EXISTANT - enrichir fields]
├── SessionFormation.php   [EXISTANT - add salle_id]
├── Inscription.php        [EXISTANT - modify statuts]
├── Certificat.php         [EXISTANT]
├── Evaluation.php         [EXISTANT]
├── Formateur.php          [NOUVEAU - extends User]
├── DisponibiliteFormateur.php [NOUVEAU]
├── Salle.php              [NOUVEAU]
├── Ressource.php          [NOUVEAU]
└── Presence.php           [NOUVEAU]
```

---

## 🌐 NOUVELLE STRUCTURE API

### Nouveaux Contrôleurs
```
app/Http/Controllers/
├── PlanningController.php          [NOUVEAU]
├── SalleController.php             [NOUVEAU]
├── PresenceController.php          [NOUVEAU]
├── CatalogueController.php         [NOUVEAU]
├── HistoriqueController.php        [NOUVEAU]
├── NotificationController.php      [NOUVEAU]
├── ExportController.php            [NOUVEAU]
└── [EXISTANTS: Auth, Formation, Session, Inscription, Certificat]
```

### Route Groups à Ajouter
```php
// routes/api.php

// Publiques
Route::post('/catalogue', [CatalogueController::class, 'index']);

// Formateurs
Route::middleware(['auth:sanctum', 'role:formateur'])->group(function () {
    Route::get('/mon-planning', [PlanningController::class, 'planning']);
    Route::post('/presences/batch', [PresenceController::class, 'marquerBatch']);
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('salles', SalleController::class);
    Route::apiResource('disponibilites', DisponibiliteController::class);
    Route::get('/dashboard-v2/stats', [DashboardController::class, 'statsV2']);
    Route::get('/rapports/presences', [ExportController::class, 'rapportPresences']);
});

// Étudiants
Route::middleware(['auth:sanctum', 'role:etudiant'])->group(function () {
    Route::get('/mon-parcours', [HistoriqueController::class, 'monParcours']);
    Route::get('/mon-taux-presence', [PresenceController::class, 'monTaux']);
});
```

---

## 📅 TIMELINE RECOMMANDÉE

### **SEMAINE 1-2: Fondations (P1 - Salles)**
- Créer migrations Salles + Ressources
- Modèles Salle, Ressource
- Service SalleService
- Controller + routes
- Frontend components
- **Total: 30h**

### **SEMAINE 3-4: Presences (P1 - Suivi)**
- Créer migration Presences
- Modèle Presence + Service
- Controller + routes
- Blade template PDF
- Frontend form + vue
- Tests
- **Total: 36h**

### **SEMAINE 5: Planning (P1 - Formateurs)**
- Migrations planning
- Modèles Formateur + Disponibilites
- Service PlanningService
- Controller + routes
- Frontend Calendar
- **Total: 26h**

### **SEMAINE 6: Dashboard (P1 - Admin)**
- Enrichir DashboardController
- Components graphiques
- Charts library (Chart.js ou Recharts)
- **Total: 22h**

### **SEMAINE 7: Priorité 2 (Catalogue + Historique + Notifications)**
- Formation enrichie
- HistoriqueService
- NotificationService + Jobs
- **Total: 42h**

### **SEMAINE 8-9: P2 suite + P3 (Exports + Liste attente + Filtres)**
- ExportService
- Liste attente logic
- Filtres avancés
- **Total: 28h**

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

### 1. Ordre Migrations
**DANGER:** Exécuter migrations dans le désordre cassera les FKs!  
**Action:** Vérifier dépendances avant chaque migration

### 2. Validation Automatique Session
**Actuel:** ≥ 17 inscrits → validée auto  
**Nouveau:** Aussi vérifier capacité salle!
```php
// Modifier SessionFormation.validerAutomatiquement()
public function validerAutomatiquement(): void
{
    $inscriptions = $this->inscriptionsActives()->count();
    
    // Vérifier aussi salle dispo (nouvelle logique)
    if ($inscriptions >= 17 && $this->salle && $this->salle->peutAccueillir($inscriptions)) {
        $this->statut = 'validee';
        $this->save();
    }
}
```

### 3. Conflits Détection
**COMPLEXE:** Planning + Salles = conflits à 2 niveaux!
- Formateur ne peut pas avoir 2 sessions en même temps
- Salle ne peut pas avoir 2 sessions en même temps
**Action:** Tests exhaustifs requis

### 4. PDF Génération
**Prévoir:** Feuille d'émargement = PDF complexe (tableau, signatures)
**Outil:** DOMPDF + Blade suffisant

### 5. Notifications
**Risque:** Spam d'emails!
**Mitigation:** Queue + throttling, opt-in notifications

### 6. Performance
**Problème:** Avec presences (dépendance date), queries peuvent être lentes
**Solution:** Indexes sur (session_id, date_session), (etudiant_id)

---

## 🧪 TESTS À PRÉVOIR

### Unitaires (60h total)
```php
// Tests pour chaque Service:
- PlanningService::estDisponible()
- SalleService::trouverSallesDisponibles()
- PresenceService::getTauxPresence()
- etc.

php artisan test --filter=PlanningServiceTest
```

### Fonctionnels (40h total)
```
- POST inscription → détection conflit planning
- POST session création → vérifier salle dispo
- Batch presences → calcul taux correct
- Export CSV → format valide
```

### API (30h total)
```
- Endpoints GET/POST/DELETE CRUD
- Authorization checks (role)
- Input validation
```

### Frontend (30h total)
```
- Components render correctement
- Appels API avec Postman avant
- Formulaires validation
- Calendriers affichage
```

---

## 📈 MÉTRIQUES DE SUCCÈS

| Métrique | Critère |
|----------|---------|
| Couverture Code | ≥ 80% |
| Performance API | < 200ms p50 |
| Taux Tests Passés | 100% |
| Bugs Critiques | 0 |
| Documentation | Toutes features documentées |

---

## 🚀 DÉPLOIEMENT

### Avant production:
```bash
# Run migrations
php artisan migrate

# Seed données test
php artisan db:seed

# Clear caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Run tests
php artisan test

# Check logs
tail -f storage/logs/laravel.log
```

### Env Production (.env)
```
QUEUE_CONNECTION=database     # Pour notifications
MAIL_DRIVER=smtp              # Emails réels
APP_DEBUG=false
SANCTUM_EXPIRATION=525600
```

---

## 📚 DOCUMENTATION À GÉNÉRER

Après implémentation, créer:
1. **API Documentation** - Swagger/OpenAPI pour tous nouveaux endpoints
2. **User Guides** - Comment marquer présences, créer sessions, etc.
3. **Admin Guide** - Dashboard, rapports, gestion salles
4. **Developer Guide** - Archi nouvelle, patterns utilisés

---

## ✅ CHECKLIST VALIDATION

- [ ] Toutes migrations créées et testées
- [ ] Tous les modèles ont relationships correctes
- [ ] Services métier complètement couverts de tests
- [ ] API endpoints documentés
- [ ] Frontend components styled et responsive
- [ ] Notifications envoyées correctement
- [ ] Exports génèrent fichiers valides
- [ ] Performance acceptable
- [ ] Pas de bugs critiques
- [ ] Documentation complète

---

**FIN DU PLAN D'IMPLÉMENTATION**

*Prochaine étape: Valider ce plan et commencer SEMAINE 1 (Salles & Ressources)*
