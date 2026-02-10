# Guide de Mise en Place - Backend CNI Gestion Formations

## ✅ Checklist Installation

### 1. Configuration Initiale

```bash
# Dans le dossier backend/
cd backend

# Copier fichier d'environnement
cp .env.example .env

# Générer clé application
php artisan key:generate
```

### 2. Dépendances

```bash
# Laravel et extensions
composer install

# Node.js (pour assets si nécessaire)
npm install
```

### 3. Base de Données

```bash
# Pour SQLite (par défaut)
# Aucune configuration nécessaire

# OU pour MySQL dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cni_formations
DB_USERNAME=root
DB_PASSWORD=

# Créer les tables
php artisan migrate

# Charger données de test
php artisan db:seed
```

### 4. Vérifications

```bash
# Vérifier installation Laravel
php artisan

# Afficher les routes API
php artisan route:list --path=api

# Vérifier les models
php artisan tinker
>>> App\Models\User::count()
```

### 5. Démarrer le serveur

```bash
# Développement
php artisan serve

# Serveur accessible à http://localhost:8000
# API à http://localhost:8000/api
```

---

## 🔧 Données de Test Incluses

Après `php artisan db:seed` :

### Utilisateurs

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@cni.fr | password123 | Admin |
| formateur1@cni.fr | password123 | Formateur |
| formateur2@cni.fr | password123 | Formateur |
| etudiant1@cni.fr - etudiant20@cni.fr | password123 | Étudiant |

### Formations

- Laravel Avancé (40h)
- React JS (36h)
- API REST avec Node.js (32h)

### Sessions

- 3 sessions créées avec dates variables

---

## 🚀 Premiers Tests

### 1. Vérifier que l'API répond

```bash
curl http://localhost:8000/api/formations
# → Error 401 (attendu, pas authentifié)
```

### 2. Se connecter en tant qu'admin

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cni.fr",
    "password": "password123"
  }' | jq .

# Réponse :
{
  "message": "Connecté avec succès",
  "user": {...},
  "access_token": "1|XXX...",
  "token_type": "Bearer"
}
```

### 3. Utiliser le token

```bash
TOKEN="1|XXX..."

# Lister les formations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/formations | jq .

# Accéder au dashboard admin
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/admin/dashboard | jq .
```

---

## 📁 Structure des Fichiers Clés

### Models (`app/Models/`)
- `User.php` - Utilisateurs avec rôles
- `Formation.php` - Formations
- `SessionFormation.php` - Sessions avec logique de validation auto
- `Inscription.php` - Inscriptions étudiants
- `Certificat.php` - Certificats

### Services (`app/Services/`)
- `FormationService.php` - Logique formations
- `SessionService.php` - Logique sessions
- `InscriptionService.php` - Logique inscriptions & validation auto
- `CertificatService.php` - Génération PDF et certificats

### Controllers (`app/Http/Controllers/Api/`)
- `AuthController.php` - Authentification
- `FormationController.php` - Endpoints formations
- `SessionController.php` - Endpoints sessions
- `InscriptionController.php` - Endpoints inscriptions
- `CertificatController.php` - Endpoints certificats
- `DashboardController.php` - Dashboard admin

### Routes (`routes/api.php`)
- Tous les endpoints API avec middlewares de sécurité

---

## 🔐 Logique Métier Implémentée

### ✅ Validation Automatique des Sessions

```
Quand : Une inscription est créée
Si : Nombre d'inscriptions actives >= 17
Alors : Session passée au statut 'validee' automatiquement
```

Implémentée dans `SessionFormation::validerAutomatiquement()`

### ✅ Génération de Certificats

```
Conditions obligatoires :
1. Session doit être validee
2. Formation doit être terminee (date_fin passée)
3. Inscription doit être terminee (avec note)
4. Pas déjà un certificat pour cette session/étudiant

Processus :
1. Créer certificat en BD
2. Générer PDF depuis template Blade
3. Sauvegarder fichier dans storage/app/public/certificats/
4. Étudiant peut télécharger le PDF
```

Implémentée dans `CertificatService`

### ✅ Sécurité des Rôles

```
Tous les endpoints ont des middlewares :
- auth:sanctum (authentification)
- role:admin,formateur (vérification rôles)

Appliquées aux routes critiques :
- Création/modification formations → Admin seulement
- Création/validation sessions → Admin + Formateur
- Inscription → Étudiant seulement
- Génération certificats → Admin + Formateur
```

---

## 📊 Tests Recommandés

### Test Workflow Étudiant

```bash
# 1. Enregistrement
POST /api/auth/register

# 2. Connexion
POST /api/auth/login

# 3. Lister formations disponibles
GET /api/formations

# 4. Voir les sessions d'une formation
GET /api/sessions (filter par formation)

# 5. S'inscrire à une session
POST /api/inscriptions
{
  "session_formation_id": 1
}

# 6. Consulter ses inscriptions
GET /api/inscriptions/mes-inscriptions

# 7. Voir ses certificats (après formation terminée)
GET /api/certificats/mes-certificats

# 8. Télécharger certificat PDF
GET /api/certificats/{id}/telecharger
```

### Test Workflow Formateur

```bash
# 1. Connexion formateur
POST /api/auth/login (formateur1@cni.fr)

# 2. Créer une session
POST /api/sessions
{
  "formation_id": 1,
  "titre": "Laravel Avancé 2026",
  "date_debut": "2026-02-01",
  "date_fin": "2026-02-15",
  "lieu": "Paris",
  "nombre_places": 25
}

# 3. Voir les inscriptions
GET /api/inscriptions/session/{id}

# 4. Terminer les inscriptions avec notes
POST /api/inscriptions/{id}/terminer
{
  "note": 18.5
}

# 5. Générer les certificats
POST /api/certificats/{inscriptionId}/generer

# 6. Générer les PDFs
POST /api/certificats/{certificatId}/generer-pdf

# 7. Voir les certificats générés
GET /api/certificats/session/{id}
```

### Test Dashboard Admin

```bash
# Connexion admin
POST /api/auth/login (admin@cni.fr)

# Voir statistiques
GET /api/admin/dashboard

# Réponse :
{
  "data": {
    "utilisateurs": {
      "total": 23,
      "etudiants": 20,
      "formateurs": 2,
      "admins": 1
    },
    "inscriptions": {...},
    "sessions": {...}
  }
}
```

---

## 🐛 Troubleshooting

### Erreur : CORS bloqué

**Solution :**
```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### Erreur : 419 CSRF Token Mismatch

**Cause :** Endpoints API n'en ont pas besoin
**Solution :** Les tokens Sanctum remplacent les CSRF tokens

### Erreur : Token introuvable

**Cause :** Header Authorization mal formaté
**Solution :**
```
Bon :  Authorization: Bearer 1|XXX...
Mauvais : Authorization: 1|XXX...
Mauvais : Bearer: 1|XXX...
```

### Erreur : 403 Forbidden

**Cause :** Rôle insuffisant
**Solution :** Vérifier le rôle avec `GET /api/auth/profil`

### PDF non généré

**Cause :** Dossier certificats n'existe pas ou permissions insuffisantes
**Solution :**
```bash
mkdir -p storage/app/public/certificats
chmod -R 755 storage/app/public
php artisan storage:link
```

---

## 📝 Configuration Production

### .env pour production

```env
APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=mysql
DB_HOST=votre-host
DB_DATABASE=formations
DB_USERNAME=user
DB_PASSWORD=secure_password

SANCTUM_STATEFUL_DOMAINS=frontend.example.com
SESSION_DOMAIN=.example.com

MAIL_HOST=votre-smtp
MAIL_USERNAME=email@example.com
```

### Commandes finales

```bash
# Compiler assets
npm run build

# Optimiser autoloader
composer install --no-dev --optimize-autoloader

# Configurer permissions
chmod -R 755 storage bootstrap/cache

# Cache configuration
php artisan config:cache
php artisan route:cache
```

---

## 📚 Fichiers de Documentation

- `BACKEND_DOCUMENTATION.md` - Documentation complète de l'API
- `AUTH_CONFIG.md` - Configuration d'authentification
- Ce fichier - Guide de mise en place

---

## 🎯 Prochaines Étapes

1. ✅ Backend implémenté
2. ➡️ Frontend React : Intégration des endpoints API
3. ➡️ Tests unitaires : Couverture des services
4. ➡️ Déploiement : Configuration production

---

Pour questions ou support : contactez l'équipe dev
