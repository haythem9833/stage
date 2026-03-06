# 🎯 CONTROLLERS & ROUTES v2.0 - DOCUMENTATION

**Date:** 25 février 2026  
**Status:** ✅ **4 Controllers créés + Routes configurées**

---

## 📋 Fichiers Créés

### Controllers API (4 fichiers)
```
✅ app/Http/Controllers/Api/SalleController.php
✅ app/Http/Controllers/Api/PresenceController.php
✅ app/Http/Controllers/Api/PlanningController.php
✅ app/Http/Controllers/Api/DashboardController.php
```

### Routes Configuration
```
✅ routes/api.php (ajout 50+ nouvelles routes)
```

### Blade Templates
```
✅ resources/views/presences/feuille-presence-pdf.blade.php
```

---

## 🔧 SALLE CONTROLLER (7 endpoints)

### Classe: `SalleController`
**Fichier:** `app/Http/Controllers/Api/SalleController.php`

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/salles` | GET | - | Liste toutes les salles |
| `/salles` | POST | Admin | Créer une nouvelle salle |
| `/salles/{id}` | GET | - | Afficher une salle |
| `/salles/{id}` | PUT | Admin | Modifier une salle |
| `/salles/{id}` | DELETE | Admin | Supprimer une salle |
| `/salles/disponibles` | GET | - | Chercher salles disponibles |
| `/salles/{id}/ressources` | POST | Admin | Ajouter une ressource |
| `/salles/{id}/calendrier` | GET | - | Voir calendrier réservations |

### Exemple Requête - Chercher Salles Disponibles
```bash
GET /api/salles/disponibles?date_debut=2026-03-01%2009:00&date_fin=2026-03-01%2017:00&nb_participants=30

Response:
{
  "id": 1,
  "nom": "Salle A - Amphi",
  "capacite_max": 50,
  "localisation": "Bâtiment 1",
  "equipements": ["projecteur", "wifi", "tableau blanc"]
}
```

---

## 👥 PRESENCE CONTROLLER (7 endpoints)

### Classe: `PresenceController`
**Fichier:** `app/Http/Controllers/Api/PresenceController.php`

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/sessions/{id}/presences/batch` | POST | Formateur/Admin | Enregistrer presences batch |
| `/sessions/{id}/presences` | GET | Formateur/Admin | Lister presences |
| `/sessions/{id}/presences/synthese` | GET | Formateur/Admin | Synthèse des presences |
| `/sessions/{id}/presences/feuille-presence` | GET | Formateur/Admin | Feuille PDF ou JSON |
| `/etudiants/{id}/taux-presence` | GET | - | Taux présence étudiant |
| `/presences/{id}/justifier` | PUT | Formateur/Admin | Justifier absence |
| `/presences/{id}/corriger` | POST | Formateur/Admin | Corriger une présence |

### Exemple Requête - Batch Presences
```bash
POST /api/sessions/1/presences/batch
Content-Type: application/json

{
  "date": "2026-03-01",
  "presences": [
    { "inscription_id": 1, "statut": "present" },
    { "inscription_id": 2, "statut": "absent" },
    { "inscription_id": 3, "statut": "retard" },
    { "inscription_id": 4, "statut": "justifie" }
  ]
}

Response:
{
  "message": "Presences enregistrées",
  "date": "2026-03-01",
  "count": 4,
  "resultats": [...]
}
```

### Exemple - Feuille PDF
```bash
GET /api/sessions/1/presences/feuille-presence?format=pdf

Response: PDF file (application/pdf)
```

---

## 📅 PLANNING CONTROLLER (6 endpoints)

### Classe: `PlanningController`
**Fichier:** `app/Http/Controllers/Api/PlanningController.php`

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/formateurs/{id}/planning` | GET | - | Voir planning formateur |
| `/formateurs/{id}/disponibilites` | POST | Formateur/Admin | Ajouter indisponibilité |
| `/formateurs/{id}/prochain-creneau` | GET | Formateur/Admin | Trouver prochain créneau |
| `/disponibilites/{id}` | DELETE | Formateur/Admin | Supprimer indisponibilité |
| `/formateurs/check-disponibilite` | POST | Formateur/Admin | Vérifier dispo |
| `/formateurs` | GET | - | Lister formateurs dispo |

### Exemple - Ajouter Indisponibilité
```bash
POST /api/formateurs/1/disponibilites
Content-Type: application/json

{
  "date_debut": "2026-03-10 08:00",
  "date_fin": "2026-03-10 17:00",
  "type": "indisponibilite",
  "raison": "Congé maladie",
  "recurrence": "once"
}

Response:
{
  "message": "Disponibilité ajoutée",
  "disponibilite": {
    "id": 1,
    "formateur_id": 1,
    "date_debut": "2026-03-10T08:00:00.000000Z",
    "date_fin": "2026-03-10T17:00:00.000000Z",
    "type": "indisponibilite",
    "raison": "Congé maladie"
  }
}
```

### Exemple - Check Disponibilité
```bash
POST /api/formateurs/check-disponibilite
Content-Type: application/json

{
  "formateur_id": 1,
  "date_debut": "2026-03-15 09:00",
  "date_fin": "2026-03-15 17:00"
}

Response:
{
  "disponible": true,
  "conflits": []
}
```

---

## 📊 DASHBOARD CONTROLLER (3 endpoints)

### Classe: `DashboardController`
**Fichier:** `app/Http/Controllers/Api/DashboardController.php`

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/admin/dashboard-v2/stats` | GET | Admin | Stats globales dashboard |
| `/admin/dashboard-v2/formations-stats` | GET | Admin | Stats par formation |
| `/admin/dashboard-v2/presences-stats` | GET | Admin | Stats présences mois |

### Exemple - Stats Dashboard
```bash
GET /api/admin/dashboard-v2/stats

Response:
{
  "sessions": {
    "actives": 5,
    "prochaines": 8,
    "total": 13
  },
  "remplissage": {
    "moyen": 78.5,
    "sessions": 3
  },
  "formations": {
    "top": [...],
    "total": 12
  },
  "utilisateurs": {
    "admin": { "total": 2 },
    "formateur": { "total": 8 },
    "etudiant": { "total": 150 }
  },
  "alertes": [
    {
      "type": "warning",
      "titre": "Sessions à valider",
      "message": "2 sessions moins de 17 inscrits",
      "count": 2
    }
  ],
  "kpis": {
    "sessions_actives_count": 5,
    "taux_remplissage_moyen": 78.5,
    "total_formations": 12,
    "total_participants": 150
  }
}
```

---

## 📍 CONFIGURATION ROUTES (api.php)

### Groupe Salles
```php
Route::prefix('salles')->group(function () {
    Route::get('/', [SalleController::class, 'index']);
    Route::post('/', [SalleController::class, 'store'])->middleware('role:admin');
    Route::get('/disponibles', [SalleController::class, 'disponibles']);
    Route::get('/{salle}', [SalleController::class, 'show']);
    Route::put('/{salle}', [SalleController::class, 'update'])->middleware('role:admin');
    Route::delete('/{salle}', [SalleController::class, 'destroy'])->middleware('role:admin');
    Route::post('/{salle}/ressources', [SalleController::class, 'ajouterRessource'])->middleware('role:admin');
    Route::get('/{salle}/calendrier', [SalleController::class, 'calendrier']);
});
```

### Groupe Presences
```php
Route::prefix('sessions/{sessionId}/presences')->group(function () {
    Route::get('/', [PresenceController::class, 'index'])->middleware('role:admin,formateur');
    Route::post('/batch', [PresenceController::class, 'batch'])->middleware('role:formateur,admin');
    Route::get('/synthese', [PresenceController::class, 'synthese'])->middleware('role:admin,formateur');
    Route::get('/feuille-presence', [PresenceController::class, 'feuillePresence'])->middleware('role:admin,formateur');
});
```

### Groupe Planning
```php
Route::prefix('formateurs')->group(function () {
    Route::get('/', [PlanningController::class, 'listFormateurs']);
    Route::get('/{id}/planning', [PlanningController::class, 'show']);
    Route::get('/{id}/prochain-creneau', [PlanningController::class, 'prochainCreneau'])->middleware('role:admin,formateur');
    Route::post('/{id}/disponibilites', [PlanningController::class, 'ajouter'])->middleware('role:admin,formateur');
});
```

### Groupe Dashboard
```php
Route::prefix('admin/dashboard-v2')->group(function () {
    Route::get('/stats', [ApiDashboardController::class, 'stats'])->middleware('role:admin');
    Route::get('/formations-stats', [ApiDashboardController::class, 'formationsStats'])->middleware('role:admin');
    Route::get('/presences-stats', [ApiDashboardController::class, 'presencesStats'])->middleware('role:admin');
});
```

---

## 🧪 TESTS RAPIDES (Postman/cURL)

### Test 1: Lister les salles
```bash
curl -X GET http://localhost:8000/api/salles
```

### Test 2: Chercher une salle disponible
```bash
curl -X GET "http://localhost:8000/api/salles/disponibles?date_debut=2026-03-01%2009:00&date_fin=2026-03-01%2017:00&nb_participants=30"
```

### Test 3: Enregistrer presences
```bash
curl -X POST http://localhost:8000/api/sessions/1/presences/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2026-03-01",
    "presences": [
      { "inscription_id": 1, "statut": "present" },
      { "inscription_id": 2, "statut": "absent" }
    ]
  }'
```

### Test 4: Dashboard stats
```bash
curl -X GET http://localhost:8000/api/admin/dashboard-v2/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ VALIDATION CHECKLIST

- [x] 4 Controllers créés
- [x] 22+ endpoints configurés
- [x] Authentification avec middleware 'role'
- [x] Validation des requêtes
- [x] Réponses JSON structurées
- [x] Gestion des erreurs (422, 404, 401)
- [x] Blade template pour PDF presences
- [x] Services intégrés
- [x] Modèles avec relations

---

## 🚀 PROCHAINES ÉTAPES

### À Faire
1. ⏳ Tester les endpoints avec Postman
2. ⏳ Corriger les erreurs de validation
3. ⏳ Ajouter tests unitaires
4. ⏳ Intégrer les components React
5. ⏳ Créer les services API frontend

### Commandes Utiles
```bash
# Lancer le serveur
php artisan serve

# Tester une route
php artisan route:list | grep salles

# Tester avec tinker
php artisan tinker
>>> Salle::count()
>>> Presence::count()
```

---

## 📞 Support

**Erreur de validation?** Vérifier les Request validate()
**Erreur d'authentification?** Vérifier le token Bearer
**Erreur de modèle?** Vérifier les relations dans les Models

---

**Généré:** 25 février 2026  
**Version:** v2.0 P1 - Controllers Complete  
**Status:** ✅ Prêt pour tests
