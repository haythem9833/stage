# 🚀 Quick Start Guide - CNI Gestion Formations

## ⚡ Démarrage Rapide (5 minutes)

### 1️⃣ Cloner et Naviguer
```bash
# Navigation au projet
cd d:\projetStageCNI\cni-gestion-formations

# Deux dossiers principaux
cd backend    # Laravel API
cd frontend   # Next.js UI
```

### 2️⃣ Setup Backend

```bash
cd backend

# Installation des dépendances
composer install

# Configuration environnement
copy .env.example .env

# Générer clé application
php artisan key:generate

# Créer base de données (SQLite)
# Le fichier database.sqlite sera créé automatiquement

# Lancer les migrations
php artisan migrate

# Charger données test
php artisan db:seed

# Démarrer serveur
php artisan serve
# API disponible: http://localhost:8000/api
```

### 3️⃣ Setup Frontend

```bash
cd frontend

# Installation dépendances
npm install

# Démarrer dev server
npm run dev
# Interface disponible: http://localhost:3000
```

---

## 👤 Comptes de Test

Après `php artisan db:seed`, ces comptes sont disponibles:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@cni.fr` | `password123` |
| **Formateur 1** | `formateur1@cni.fr` | `password123` |
| **Formateur 2** | `formateur2@cni.fr` | `password123` |
| **Étudiants** | `etudiant1@cni.fr` à `etudiant20@cni.fr` | `password123` |

---

## 📚 Comprendre la Structure

### Backend (Laravel) - Fichiers Importants
```
backend/app/
├── Models/
│   ├── User.php                    ← Utilisateurs
│   ├── Formation.php               ← Formations
│   ├── SessionFormation.php        ← Sessions (avec validation auto!)
│   ├── Inscription.php             ← Inscriptions
│   ├── Certificat.php              ← Certificats
│   └── Evaluation.php              ← Évaluations
│
├── Services/
│   ├── FormationService.php        ← CRUD formations
│   ├── SessionService.php          ← Gestion sessions
│   ├── InscriptionService.php      ← Inscriptions + triggers
│   └── CertificatService.php       ← Génération PDF
│
└── Http/Controllers/
    ├── AuthController.php          ← Login/Register
    ├── FormationController.php
    ├── SessionController.php
    ├── InscriptionController.php
    ├── CertificatController.php
    └── EvaluationController.php

routes/api.php                       ← 37+ endpoints (LIRE CECI!)
```

### Frontend (Next.js) - Fichiers Importants
```
frontend/
├── pages/
│   ├── _app.js                     ← App entry point
│   ├── index.js                    ← Accueil
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── admin/                      ← Pages admin
│   ├── etudiant/                   ← Pages étudiant
│   ├── formateur/                  ← Pages formateur
│   └── mes-formations.tsx
│
├── components/
│   ├── EvaluationForm.tsx          ← Formulaire évaluation
│   ├── Layout.js
│   ├── Header.js
│   ├── forms/                      ← Autres formulaires
│   └── tables/
│
└── context/
    └── AuthContext.js              ← Gestion auth globale
```

---

## 🔍 Concepts Clés à Comprendre

### 1. Validation Automatique de Session ⭐ (TRÈS IMPORTANT)
**Où:** `backend/app/Models/SessionFormation.php`  
**Quoi:** Quand 17+ étudiants s'inscrivent, la session devient automatiquement "validée"  
**Pourquoi:** Pas besoin approbation manuelle admin

**Code clé:**
```php
public function validerAutomatiquement(): void
{
    $nombreInscriptions = $this->inscriptionsActives()->count();
    
    if ($nombreInscriptions >= 17 && $this->statut !== 'validee') {
        $this->statut = 'validee';
        $this->save();
    }
}
```

### 2. Flux Inscription → Certificat
```
Étudiant s'inscrit
    → InscriptionService.inscrire()
    → session.validerAutomatiquement() [AUTO]
    
Formation terminée
    → Admin lance: POST /certificats/{id}/generate
    → CertificatService génère PDF (DOMPDF)
    → Stocké en /storage/certificats/
    
Étudiant télécharge
    → GET /certificats/{id}/download
    → Streaming PDF
```

### 3. Système de Rôles
- **Admin:** Contrôle tout
- **Formateur:** Gère ses formations + certificats
- **Étudiant:** S'inscrit + évalue

Approval flow: Demande 'formateur'/'admin' → Attente approbation → Approuvé

### 4. Authentification
- **Méthode:** Laravel Sanctum (tokens)
- **Frontend:** Stockage localStorage + AuthContext
- **Protection:** middleware `auth:sanctum` + `role:admin,formateur,etudiant`

---

## 🛠️ Commandes Courantes

### Backend (Laravel)

```bash
cd backend

# Migrations
php artisan migrate                  # Créer tables
php artisan migrate:rollback        # Annuler dernière migration
php artisan migrate:fresh           # Reset + migrate (ATTENTION: perte données)
php artisan migrate:fresh --seed    # Reset + migrate + seed

# Seeders
php artisan db:seed                 # Charger données test
php artisan db:seed --class=UserSeeder

# Artisan misc
php artisan tinker                  # REPL PHP/Laravel
php artisan cache:clear            # Vider cache
php artisan config:cache           # Cache configuration
php artisan route:list             # Lister routes API

# Tests
php artisan test                   # Lancer tests PHPUnit

# Serveur
php artisan serve                  # Démarrer dev server (port 8000)
php artisan serve --port=8080      # Port custom
```

### Frontend (Next.js)

```bash
cd frontend

# Développement
npm run dev                        # Dev server (port 3000)

# Build
npm run build                      # Production build
npm start                          # Démarrer production server

# Linting
npm run lint                       # Vérifier ESLint
npm run lint -- --fix             # Autofix ESLint issues
```

---

## 🧪 Tester l'API

### Avec cURL
```bash
# Login et obtenir token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cni.fr","password":"password123"}'

# Réponse: {"token":"xxx"}

# Utiliser le token
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer xxx"
```

### Avec Postman
1. Importer les routes de `backend/routes/api.php`
2. Collection GET `/api/formations`, POST `/api/login`, etc.
3. Ajouter dans Headers: `Authorization: Bearer {token}`

### Avec les Scripts PHP
```bash
cd backend

# Test login et fonctionnalités
php test_api.php

# Test téléchargement certificat
php test_download.php

# Vérification base de données
php verify_db.php
```

---

## 🎯 Scénario d'Utilisation Complet

### Jour 1: Admin Setup
```bash
1. php artisan migrate           # Créer BD
2. php artisan db:seed           # Charger données test
3. Consulter admin@cni.fr / password123
```

### Jour 2: Formateur Crée Formation
```
API: POST /formations
{
  "titre": "Python Avancé",
  "description": "...",
  "duree": 40
}
```

### Jour 3: Formateur Crée Session
```
API: POST /sessions
{
  "formation_id": 1,
  "titre": "Session Janvier 2026",
  "date_debut": "2026-02-01",
  "date_fin": "2026-02-10",
  "nombre_places": 25
}
```

### Jour 4-15: Étudiants S'inscrivent
```
Pour chaque étudiant:
  API: POST /inscriptions
  {
    "etudiant_id": 5,
    "formation_id": 1
  }
  
  → Après 17ème inscription
  → Session passe auto à 'validee' ✓
```

### Jour 16: Formation Terminée, Phase Évaluation
```
Frontenend: Étudiants accèdent EvaluationForm
API: POST /inscriptions/{id}/evaluation/create
     POST /evaluations/{id}/submit
```

### Jour 17: Génération Certificats
```
Frontend Admin: Clique "Générer certificats"
API: POST /certificats/{id}/generate
  → PDF généré + stocké
  → Record créé en BD
```

### Jour 18: Étudiants Téléchargent
```
Frontend Étudiant: Mes Certificats
API: GET /certificats/{id}/download
  → PDF streamed ✓
```

---

## 🔐 Contrôle d'Accès - Exemples

### Routes Admin Uniquement
```php
// backend/routes/api.php
Route::delete('/sessions/{id}', [SessionController::class, 'destroy'])
    ->middleware('role:admin');           // ← Erreur 403 si pas admin

Route::get('/users', [DashboardController::class, 'getUsers'])
    ->middleware('role:admin');           // ← Erreur 403 si pas admin
```

### Routes Étudiant
```php
Route::post('/inscriptions', [InscriptionController::class, 'store'])
    ->middleware('role:etudiant');        // ← Seulement étudiants
```

### Routes Multi-Rôle
```php
Route::post('/sessions/{id}/validate', [SessionController::class, 'valider'])
    ->middleware('role:admin,formateur'); // ← Admin OU formateur
```

---

## 📊 Inspecter la Base de Données

### Avec SQLite
```bash
# Interface Web (SQLiteWeb)
npm install -g sqlite
sqlite3 backend/database.sqlite

# Dans le shell SQLite:
> .tables                    # Lister tables
> .schema users              # Structure table
> SELECT * FROM users LIMIT 5; # Consulter données

# Exporter
> .output data.csv
> .mode csv
> SELECT * FROM formations;
```

### Avec Laravel Tinker
```bash
cd backend
php artisan tinker

>>> User::all();                    # Tous utilisateurs
>>> Formation::first();             # Première formation
>>> SessionFormation::count();      # Nombre sessions
>>> Inscription::where('statut','active')->count();  # Inscrits actifs
```

---

## 🐛 Dépannage Courant

### Erreur: "SQLSTATE[HY000]: General error: 1 disk I/O error"
**Cause:** Permissions fichier database.sqlite  
**Solution:**
```bash
cd backend
chmod 666 database.sqlite
chmod 777 database/
```

### Erreur: "TokenMismatchException" ou "419 Unknown Status"
**Cause:** Token CSRF expiré ou invalide  
**Solution:** Régénérer token, vérifier localStorage

### Erreur: "404 Not Found" sur API
**Cause:** Route n'existe pas ou mauvaise méthode HTTP  
**Solution:** 
```bash
cd backend
php artisan route:list | grep formation
```

### Frontend ne se connecte pas au Backend
**Cause:** CORS ou port incorrect  
**Solution:**
```
Vérifier: http://localhost:8000 accessible
Vérifier: Axios URL correcte dans frontend/services/
Vérifier: CORS headers en backend
```

---

## 🔧 Configuration Importantes

### Backend (.env)
```env
APP_NAME=CNI_Gestion_Formations
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=sqlite
DB_DATABASE=database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SANCTUM_EXPIRATION=525600  # Minutes (1 an)
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 📖 Documentation À Consulter

1. **Démarrage Complet:** [backend/SETUP_GUIDE.md](backend/SETUP_GUIDE.md)
2. **Vue d'Ensemble:** [backend/README.md](backend/README.md)
3. **Routes API:** [backend/routes/api.php](backend/routes/api.php)
4. **Authentification:** [backend/AUTH_CONFIG.md](backend/AUTH_CONFIG.md)
5. **Exemples API:** [backend/API_EXAMPLES.md](backend/API_EXAMPLES.md)
6. **Tests:** [backend/TESTING_GUIDE.md](backend/TESTING_GUIDE.md)

---

## 💡 Tips Pro

1. **Toujours utiliser Postman ou Thunder Client** pour tester API avant frontend
2. **Activer les logs** pour déboguer: `tail -f storage/logs/laravel.log`
3. **Vérifier migrations** avant de commit: `git diff database/migrations/`
4. **Utiliser Tinker** pour tests rapides en CLI
5. **Lire les relations Eloquent** avant de modifier modèles
6. **Tester authentification** avec tokens en localStorage

---

## 📞 Support Rapide

| Problème | Solution |
|----------|----------|
| BD vide après migrate | `php artisan db:seed` |
| Routes 404 | `php artisan route:list` |
| Token invalide | Relancer login, vérifier localStorage |
| CORS error | Vérifier SANCTUM_STATEFUL_DOMAINS |
| PDF non généré | Vérifier /storage/certificats/ permissions |
| Frontend blanc | Ouvrir DevTools (F12) et voir erreurs |

---

**Fin du Quick Start Guide**
