# 🧪 Guide de Test du Backend - CNI Gestion Formations

## ✅ Étapes de Démarrage

### 1️⃣ Configuration et Démarrage

```bash
# Dans le dossier backend/
cd backend

# Configuration (une seule fois)
cp .env.example .env
php artisan key:generate

# Installer les dépendances (une seule fois)
composer install
```

### 2️⃣ Initialiser la Base de Données

```bash
# Créer les tables et charger les données de test
php artisan migrate:fresh --seed

# ✅ Résultat :
# - 23 utilisateurs créés
# - 3 formations créées
# - 3 sessions créées
```

### 3️⃣ Démarrer le Serveur

**Option 1 : PHP Built-in Server**
```bash
php -S 127.0.0.1:8000 -t public
# ✅ Serveur sur http://127.0.0.1:8000
```

**Option 2 : Laravel Artisan**
```bash
php artisan serve
# ✅ Serveur sur http://127.0.0.1:8000
```

---

## 🧪 Tests des Endpoints

### 1️⃣ **Authentification**

#### Login (Obtenir Token)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cni.fr",
    "password": "password123"
  }'
```

**Réponse :**
```json
{
  "token": "YOUR_TOKEN_HERE",
  "user": {
    "id": 1,
    "nom": "Admin",
    "prenom": "CNI",
    "email": "admin@cni.fr",
    "role": "admin"
  }
}
```

**Utilisateurs de Test :**
- Admin: `admin@cni.fr` / `password123`
- Formateur 1: `formateur1@cni.fr` / `password123`
- Étudiant 1-20: `etudiant1@cni.fr` à `etudiant20@cni.fr` / `password123`

---

#### Récupérer Profil
```bash
curl -X GET http://127.0.0.1:8000/api/auth/profil \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Logout
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

### 2️⃣ **Formations**

#### Lister Toutes les Formations
```bash
curl -X GET http://127.0.0.1:8000/api/formations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Créer une Formation (Admin)
```bash
curl -X POST http://127.0.0.1:8000/api/formations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Python Avancé",
    "description": "Formation complète en Python",
    "duree": 40,
    "objectifs": "Maîtriser Python pour data science"
  }'
```

#### Récupérer une Formation
```bash
curl -X GET http://127.0.0.1:8000/api/formations/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Modifier une Formation (Admin)
```bash
curl -X PUT http://127.0.0.1:8000/api/formations/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Python Avancé - Mise à jour",
    "duree": 45
  }'
```

#### Supprimer une Formation (Admin)
```bash
curl -X DELETE http://127.0.0.1:8000/api/formations/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3️⃣ **Sessions de Formation**

#### Lister les Sessions
```bash
curl -X GET http://127.0.0.1:8000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Créer une Session (Admin)
```bash
curl -X POST http://127.0.0.1:8000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "formation_id": 1,
    "titre": "Laravel - Janvier 2026",
    "description": "Session de janvier",
    "date_debut": "2026-02-01",
    "date_fin": "2026-02-20",
    "lieu": "Paris",
    "nombre_places": 30
  }'
```

#### Valider une Session (Admin)
```bash
curl -X POST http://127.0.0.1:8000/api/sessions/1/valider \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Terminer une Session (Admin)
```bash
curl -X POST http://127.0.0.1:8000/api/sessions/1/terminer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Statistiques Session (Admin/Formateur)
```bash
curl -X GET http://127.0.0.1:8000/api/sessions/1/statistiques \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse :**
```json
{
  "total_inscrits": 20,
  "actives": 18,
  "terminees": 2,
  "abandonnees": 0,
  "certificats_generes": 2,
  "moyenne_notes": 15.5
}
```

---

### 4️⃣ **Inscriptions**

#### S'Inscrire à une Session (Étudiant)
```bash
curl -X POST http://127.0.0.1:8000/api/inscriptions/inscrire \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_formation_id": 1
  }'
```

**Événement Important :** Si cette inscription atteint 17 étudiants, la session est **automatiquement validée** ✅

#### Mes Inscriptions (Étudiant)
```bash
curl -X GET http://127.0.0.1:8000/api/inscriptions/mes-inscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Inscriptions d'une Session (Admin/Formateur)
```bash
curl -X GET http://127.0.0.1:8000/api/inscriptions/session/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Terminer une Inscription (Formateur - Ajouter note)
```bash
curl -X POST http://127.0.0.1:8000/api/inscriptions/1/terminer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "note": 16.5
  }'
```

#### Annuler une Inscription (Étudiant/Admin)
```bash
curl -X POST http://127.0.0.1:8000/api/inscriptions/1/annuler \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5️⃣ **Certificats**

#### Générer un Certificat (Admin - Après fin formation + inscription terminée)
```bash
curl -X POST http://127.0.0.1:8000/api/certificats/generer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "etudiant_id": 5,
    "session_formation_id": 1
  }'
```

**Conditions pour générer :**
- Session doit être validée ✓
- Formation doit être terminée ✓
- Inscription doit être terminée ✓
- Un seul certificat par étudiant/session ✓

#### Mes Certificats (Étudiant)
```bash
curl -X GET http://127.0.0.1:8000/api/certificats/mes-certificats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Certificats d'une Session (Formateur)
```bash
curl -X GET http://127.0.0.1:8000/api/certificats/session/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Télécharger Certificat PDF
```bash
curl -X GET http://127.0.0.1:8000/api/certificats/1/telecharger \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o certificat_1.pdf
```

---

### 6️⃣ **Dashboard Admin**

#### Statistiques Globales (Admin)
```bash
curl -X GET http://127.0.0.1:8000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse :**
```json
{
  "total_utilisateurs": 23,
  "total_formations": 3,
  "total_sessions": 3,
  "sessions_actives": 2,
  "total_inscriptions": 45,
  "certificats_generes": 8,
  "formations_par_type": {
    "Laravel": 8,
    "React": 10,
    "API REST": 27
  }
}
```

---

## 🔐 Vérification des Permissions

### Admin peut :
- ✅ Lister/Créer/Modifier/Supprimer formations
- ✅ Lister/Créer/Modifier/Supprimer sessions
- ✅ Valider/Terminer sessions
- ✅ Lister/Terminer/Annuler inscriptions
- ✅ Générer certificats
- ✅ Voir dashboard

### Formateur peut :
- ✅ Lister formations
- ✅ Lister/Voir sessions
- ✅ Voir statistiques sessions
- ✅ Lister inscriptions de ses sessions
- ✅ Terminer inscriptions (ajouter note)
- ✅ Voir certificats générés

### Étudiant peut :
- ✅ Lister formations
- ✅ Lister sessions
- ✅ S'inscrire à une session
- ✅ Voir mes inscriptions
- ✅ Annuler mes inscriptions
- ✅ Voir mes certificats
- ✅ Télécharger mes certificats

---

## 🧪 Scénarios de Test Complets

### Scénario 1 : Inscription et Auto-validation
1. Login comme étudiant 1-17
2. S'inscrire à la session 1
3. Après 17e inscription → Session validée automatiquement ✅
4. Vérifier statut session (GET /api/sessions/1)

### Scénario 2 : Génération de Certificat
1. Login comme formateur
2. Terminer toutes les inscriptions de la session
3. Login comme admin
4. Générer certificat pour les étudiants
5. Login comme étudiant → Voir et télécharger certificat

### Scénario 3 : Vérification des Permissions
1. Login comme étudiant
2. Essayer DELETE /api/formations/1 → 403 Forbidden ✓
3. Login comme formateur
4. Essayer POST /api/formations → 403 Forbidden ✓

---

## 📊 Base de Données - Données Initiales

**Utilisateurs (23):**
- 1 Admin: `admin@cni.fr`
- 2 Formateurs: `formateur1@cni.fr`, `formateur2@cni.fr`
- 20 Étudiants: `etudiant1@cni.fr` à `etudiant20@cni.fr`

**Tous les mots de passe:** `password123`

**Formations (3):**
- Laravel Avancé (40h)
- React JS (36h)
- API REST avec Node.js (32h)

**Sessions (3):**
- Laravel Avancé - Session 1 (Planifiée)
- React JS - Session 1 (Planifiée)
- API REST - Session 1 (Validée)

---

## ⚠️ Points Importants

1. **Token JWT** : Inclure le token dans le header `Authorization: Bearer TOKEN` pour toutes les requêtes
2. **Validations** : Les sessions se valident automatiquement à 17 inscriptions confirmées
3. **Certificats** : Générés uniquement si toutes conditions sont remplies
4. **Permissions** : Chaque rôle a accès spécifique aux endpoints
5. **Statuts** : `planifiee`, `en_cours`, `validee`, `annulee`

---

## 🚀 Endpoints Complets

| Méthode | Route | Permission |
|---------|-------|-----------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authentifié |
| GET | `/api/auth/profil` | Authentifié |
| GET | `/api/formations` | Authentifié |
| POST | `/api/formations` | Admin |
| GET | `/api/formations/{id}` | Authentifié |
| PUT | `/api/formations/{id}` | Admin |
| DELETE | `/api/formations/{id}` | Admin |
| GET | `/api/sessions` | Authentifié |
| POST | `/api/sessions` | Admin |
| GET | `/api/sessions/{id}` | Authentifié |
| PUT | `/api/sessions/{id}` | Admin |
| DELETE | `/api/sessions/{id}` | Admin |
| POST | `/api/sessions/{id}/valider` | Admin |
| POST | `/api/sessions/{id}/terminer` | Admin |
| GET | `/api/sessions/{id}/statistiques` | Admin, Formateur |
| POST | `/api/inscriptions/inscrire` | Étudiant |
| GET | `/api/inscriptions/mes-inscriptions` | Étudiant |
| GET | `/api/inscriptions/session/{sessionId}` | Admin, Formateur |
| POST | `/api/inscriptions/{id}/terminer` | Formateur |
| POST | `/api/inscriptions/{id}/annuler` | Étudiant, Admin |
| POST | `/api/certificats/generer` | Admin |
| GET | `/api/certificats/mes-certificats` | Étudiant |
| GET | `/api/certificats/session/{sessionId}` | Admin, Formateur |
| GET | `/api/certificats/{id}/telecharger` | Authentifié |
| GET | `/api/admin/dashboard` | Admin |

---

✅ **Happy Testing!**
