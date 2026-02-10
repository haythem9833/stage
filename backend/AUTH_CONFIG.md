# Configuration Authentification

Tous les endpoints sont protégés par **Laravel Sanctum** pour une authentification sécurisée via tokens API.

## Utilisation des Middlewares

### 1. Middleware `auth:sanctum`

Appliqué à tous les endpoints sauf login/register.

```php
Route::middleware('auth:sanctum')->group(function () {
    // Routes protégées
});
```

### 2. Middleware `role:admin,formateur`

Vérifie les rôles autorisés.

```php
Route::post('/formations', [FormationController::class, 'store'])
    ->middleware('role:admin');

Route::post('/sessions', [SessionController::class, 'store'])
    ->middleware('role:admin,formateur');
```

## Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **Admin** | Tous les endpoints |
| **Formateur** | Créer sessions, corriger, générer certificats |
| **Étudiant** | S'inscrire, consulter, télécharger certificats |

## Flux d'Authentification

1. **Enregistrement** : `POST /api/auth/register`
   - Par défaut, l'utilisateur est créé avec le rôle `etudiant`
   - Les admins/formateurs doivent être créés manuellement ou via artisan

2. **Connexion** : `POST /api/auth/login`
   - Retourne un `access_token` Bearer

3. **Utilisation du token** : Ajouter le header à chaque requête
   ```
   Authorization: Bearer <token>
   ```

4. **Déconnexion** : `POST /api/auth/logout`
   - Invalide le token courant

## Exemple avec cURL

```bash
# 1. Enregistrement
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@email.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# 2. Connexion
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@email.com",
    "password": "password123"
  }' | jq -r '.access_token')

# 3. Utilisation du token
curl -X GET http://localhost:8000/api/formations \
  -H "Authorization: Bearer $TOKEN"

# 4. Déconnexion
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Créer des utilisateurs avec rôles spécifiques

Via Tinker :
```bash
php artisan tinker

# Créer un admin
\App\Models\User::create([
  'nom' => 'Admin',
  'prenom' => 'Admin',
  'email' => 'admin@cni.fr',
  'password' => bcrypt('password123'),
  'role' => 'admin'
]);

# Créer un formateur
\App\Models\User::create([
  'nom' => 'Formateur',
  'prenom' => 'Jean',
  'email' => 'formateur@cni.fr',
  'password' => bcrypt('password123'),
  'role' => 'formateur'
]);
```

## Gestion des rôles côté backend

### Vérifier le rôle de l'utilisateur connecté

```php
auth()->user()->role            // 'admin', 'formateur', 'etudiant'
auth()->user()->hasRole('admin') // true/false
auth()->user()->isAdmin()         // true/false
auth()->user()->isFormateur()     // true/false
auth()->user()->isEtudiant()      // true/false
```

### Dans les Controllers

```php
if (auth()->user()->isAdmin()) {
    // Logique réservée aux admins
}

if (!auth()->user()->isEtudiant()) {
    return response()->json(['message' => 'Accès refusé'], 403);
}
```

## Sécurité des Tokens

- **Expiration** : Configurable dans `config/sanctum.php`
- **Révocation** : Les tokens sont stockés en BD et peuvent être révoqués
- **Per-request** : Chaque token est lié à une requête spécifique
- **Transport** : Toujours utiliser HTTPS en production

## CORS (Cross-Origin)

Si le frontend est sur un domaine différent, configurer dans `config/cors.php` :

```php
'allowed_origins' => ['http://localhost:3000', 'https://frontend.example.com'],
```

## Erreurs d'Authentification

| Code | Erreur | Cause |
|------|--------|-------|
| 401 | Non authentifié | Token absent ou invalide |
| 403 | Accès refusé | Rôle insuffisant |
| 422 | Validation failed | Données mal formatées |

---

Pour plus de détails, voir [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
