# 🎓 CNI Gestion Formations - Backend Laravel

Système complet de gestion de formations avec authentification, inscriptions automatiques, génération de certificats PDF et dashboard administrateur.

## 🚀 Démarrage Rapide

```bash
# Installation
cd backend
composer install
npm install

# Configuration
cp .env.example .env
php artisan key:generate

# Base de données
php artisan migrate
php artisan db:seed

# Démarrage
php artisan serve
# API disponible à http://localhost:8000/api
```

**Données de test :**
- Admin : `admin@cni.fr` / `password123`
- Formateurs : `formateur1@cni.fr`, `formateur2@cni.fr`
- Étudiants : `etudiant1@cni.fr` à `etudiant20@cni.fr`

---

## 📋 Fonctionnalités Principales

### ✅ Authentification & Sécurité
- Enregistrement/Connexion sécurisée (Sanctum)
- 3 rôles : Admin, Formateur, Étudiant
- Middlewares de vérification des rôles
- Validation complète des données

### ✅ Gestion des Formations
- CRUD complet des formations
- Création de sessions de formation
- Statistiques par session
- Gestion des places disponibles

### ✅ Inscriptions & Validations
- Inscription des étudiants aux sessions
- **Validation automatique** : Session passe à validée si >= 17 inscriptions
- Gestion des statuts (active, terminée, abandonnée)
- Notes et suivi des performances

### ✅ Certificats & PDF
- Génération automatique de certificats
- Création de PDF professionnels
- Téléchargement sécurisé
- Suivi des certificats émis

### ✅ Dashboard Admin
- Vue d'ensemble statistiques
- Nombre d'utilisateurs par rôle
- État des inscriptions
- État des sessions

---

## 🏗️ Architecture

### Structure du Projet
```
backend/
├── app/
│   ├── Models/                    # 5 modèles Eloquent
│   ├── Services/                  # 4 services métier
│   ├── Http/
│   │   ├── Controllers/Api/       # 6 controllers API
│   │   └── Middleware/            # 2 middlewares
│   └── Providers/
├── database/
│   ├── migrations/                # 5 migrations
│   └── seeders/
├── routes/
│   └── api.php                    # 37 endpoints
└── resources/
    └── views/
        └── certificat_template.blade.php
```

### Base de Données
- `users` - Utilisateurs avec rôles
- `formations` - Formations proposées
- `session_formations` - Sessions de formation
- `inscriptions` - Inscriptions étudiants
- `certificats` - Certificats émis

### Services Métier
- `FormationService` - Gestion formations
- `SessionService` - Gestion sessions + validation
- `InscriptionService` - Gestion inscriptions
- `CertificatService` - Génération certificats PDF

---

## 🌐 API Endpoints (37 total)

### Authentification
```
POST   /auth/register              Enregistrement
POST   /auth/login                 Connexion
POST   /auth/logout                Déconnexion
GET    /auth/profil                Profil utilisateur
```

### Formations
```
GET    /formations                 Lister
POST   /formations                 Créer (Admin)
GET    /formations/{id}            Détail
PUT    /formations/{id}            Modifier (Admin)
DELETE /formations/{id}            Supprimer (Admin)
```

### Sessions
```
GET    /sessions                   Lister
POST   /sessions                   Créer (Admin/Formateur)
GET    /sessions/{id}              Détail
GET    /sessions/{id}/statistiques Statistiques
PUT    /sessions/{id}              Modifier (Admin/Formateur)
DELETE /sessions/{id}              Supprimer (Admin)
POST   /sessions/{id}/terminer     Terminer (Admin/Formateur)
POST   /sessions/{id}/valider      Valider (Admin/Formateur)
```

### Inscriptions
```
POST   /inscriptions                Inscrire (Étudiant)
GET    /inscriptions/mes-inscriptions Mes inscriptions
GET    /inscriptions/session/{id}   Inscriptions d'une session (Admin/Formateur)
POST   /inscriptions/{id}/terminer  Terminer + note (Admin/Formateur)
POST   /inscriptions/{id}/annuler   Annuler inscription
```

### Certificats
```
POST   /certificats/{id}/generer        Générer (Admin/Formateur)
POST   /certificats/{id}/generer-pdf    Générer PDF (Admin/Formateur)
GET    /certificats/{id}/telecharger    Télécharger (Admin/Étudiant)
GET    /certificats/mes-certificats     Mes certificats (Étudiant)
GET    /certificats/session/{id}        Certificats session (Admin/Formateur)
```

### Admin
```
GET    /admin/dashboard           Statistiques (Admin)
```

---

## 🔐 Sécurité

### Authentification
- Laravel Sanctum (tokens Bearer)
- Hash des mots de passe (bcrypt)
- Tokens uniques par session

### Autorisation
- Middlewares de rôles
- Vérification côté serveur
- CORS configuré
- Validation complète des données

### Base de Données
- Foreign keys avec cascade
- Unique constraints
- Transactions pour opérations critiques

---

## 💡 Logique Métier Clé

### 1. Validation Automatique des Sessions
```
Déclencheur: Création d'une inscription
Si: inscriptionsActives >= 17
Alors: Session passe à statut 'validée'
```

### 2. Génération de Certificats
```
Conditions:
- Session doit être validée
- Formation doit être terminée
- Inscription doit être terminée (avec note)
- Un seul certificat par étudiant/session

Processus:
1. Créer certificat en BD
2. Générer PDF depuis template
3. Sauvegarder le fichier
4. Permettre le téléchargement
```

---

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | 📚 Index de toute la documentation |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | ⭐ Résumé de l'implémentation |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | 🚀 Guide d'installation |
| [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) | 📖 Doc complète (2500+ lignes) |
| [API_EXAMPLES.md](API_EXAMPLES.md) | 🧪 Exemples complets avec curl |
| [AUTH_CONFIG.md](AUTH_CONFIG.md) | 🔐 Configuration authentification |
| [E2E_TEST_GUIDE.md](E2E_TEST_GUIDE.md) | ✅ Guide de test E2E |
| [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md) | ⚙️ Configuration variables d'env |

**→ Commencer par [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**

---

## 🧪 Tests

### Test Rapide
```bash
# 1. Démarrer le serveur
php artisan serve

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cni.fr","password":"password123"}'

# 3. Obtenir le token et l'utiliser
TOKEN="<access_token>"

curl -X GET http://localhost:8000/api/formations \
  -H "Authorization: Bearer $TOKEN"
```

### Test Complet
```bash
# Voir E2E_TEST_GUIDE.md pour les 6 scénarios complets
```

---

## 🛠️ Développement

### Ajouter un nouvel endpoint

1. **Créer la route** dans `routes/api.php`
2. **Créer la méthode** dans le controller approprié
3. **Valider les données** avec `$request->validate()`
4. **Utiliser un service** pour la logique métier
5. **Retourner une réponse JSON** avec les codes HTTP appropriés

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Models | 5 |
| Services | 4 |
| Controllers | 6 |
| Endpoints | 37 |
| Tables BD | 5 |
| Migrations | 5 |
| Lignes de code | ~2000 |
| Lignes de documentation | ~5000 |

---

## ⚙️ Configuration

### Variables d'Environnement Clés

```env
# Application
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite par défaut)
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Authentication
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

Pour plus de détails : [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md)

---

## 🐛 Troubleshooting

### Erreur: CORS bloqué
```
Vérifier SANCTUM_STATEFUL_DOMAINS dans .env
```

### Erreur: 403 Forbidden
```
Vérifier le rôle avec GET /auth/profil
```

### Erreur: PDF non généré
```bash
mkdir -p storage/app/public/certificats
chmod 755 storage/app/public
```

### Base de données vide
```bash
php artisan migrate:fresh --seed
```

---

## 📞 Support & Contribution

Pour toute question ou signalement de bug, consulter la documentation appropriée.

---

## 📝 License

Propriété de CNI - Formations

---

**Implémentation complète et testée ✅**

*Version: 1.0*
*Framework: Laravel 12*
*API: REST + Bearer Tokens*
*BD: SQLite/MySQL*


We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
