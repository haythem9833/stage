# 🧪 Exemples API - CNI Gestion Formations

Fichier contenant des exemples complets de requêtes API avec curl et les réponses attendues.

## Variables d'environnement

```bash
API_URL="http://localhost:8000/api"
TOKEN=""
```

---

## 🔐 AUTHENTIFICATION

### 1. Enregistrement étudiant

```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

**Réponse 201:**
```json
{
  "message": "Utilisateur enregistré avec succès",
  "user": {
    "id": 24,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "role": "etudiant",
    "created_at": "2026-01-22T10:30:00Z",
    "updated_at": "2026-01-22T10:30:00Z"
  }
}
```

### 2. Connexion

```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "password123"
  }'
```

**Réponse 200:**
```json
{
  "message": "Connecté avec succès",
  "user": {
    "id": 24,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "role": "etudiant",
    "created_at": "2026-01-22T10:30:00Z"
  },
  "access_token": "1|g7K3vM2pL9xQ5wE8rT0yA4sB6dC7fG8h",
  "token_type": "Bearer"
}
```

**Sauvegarder le token :**
```bash
TOKEN="1|g7K3vM2pL9xQ5wE8rT0yA4sB6dC7fG8h"
```

### 3. Profil utilisateur

```bash
curl -X GET $API_URL/auth/profil \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "id": 24,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "role": "etudiant",
  "created_at": "2026-01-22T10:30:00Z"
}
```

### 4. Déconnexion

```bash
curl -X POST $API_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "message": "Déconnecté avec succès"
}
```

---

## 📚 FORMATIONS

### 1. Lister les formations

```bash
curl -X GET $API_URL/formations \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": 1,
      "titre": "Laravel Avancé",
      "description": "Formation complète sur les concepts avancés de Laravel",
      "duree": 40,
      "objectifs": "Maîtriser les patterns avancés de Laravel, les middlewares, les tests unitaires",
      "created_at": "2026-01-22T08:00:00Z",
      "updated_at": "2026-01-22T08:00:00Z",
      "sessions": [...]
    },
    ...
  ]
}
```

### 2. Détail formation

```bash
curl -X GET $API_URL/formations/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": {
    "id": 1,
    "titre": "Laravel Avancé",
    "description": "Formation complète sur les concepts avancés de Laravel",
    "duree": 40,
    "objectifs": "...",
    "sessions": [
      {
        "id": 1,
        "titre": "Laravel Avancé - Session 1",
        "date_debut": "2026-01-27",
        "date_fin": "2026-02-10",
        "statut": "planifiee",
        ...
      }
    ],
    "created_at": "2026-01-22T08:00:00Z"
  }
}
```

### 3. Créer une formation (Admin uniquement)

```bash
curl -X POST $API_URL/formations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Symfony 6",
    "description": "Découverte du framework Symfony",
    "duree": 32,
    "objectifs": "Maîtriser les bases de Symfony 6"
  }'
```

**Réponse 201:**
```json
{
  "message": "Formation créée avec succès",
  "data": {
    "id": 4,
    "titre": "Symfony 6",
    "description": "Découverte du framework Symfony",
    "duree": 32,
    "objectifs": "Maîtriser les bases de Symfony 6",
    "created_at": "2026-01-22T10:45:00Z",
    "updated_at": "2026-01-22T10:45:00Z"
  }
}
```

### 4. Modifier une formation (Admin uniquement)

```bash
curl -X PUT $API_URL/formations/4 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duree": 40
  }'
```

**Réponse 200:**
```json
{
  "message": "Formation mise à jour avec succès",
  "data": {
    "id": 4,
    "titre": "Symfony 6",
    "duree": 40,
    ...
  }
}
```

### 5. Supprimer une formation (Admin uniquement)

```bash
curl -X DELETE $API_URL/formations/4 \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "message": "Formation supprimée avec succès"
}
```

---

## 📅 SESSIONS

### 1. Lister les sessions

```bash
curl -X GET $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": 1,
      "formation_id": 1,
      "titre": "Laravel Avancé - Session 1",
      "description": "Première session de formation Laravel",
      "date_debut": "2026-01-27",
      "date_fin": "2026-02-10",
      "lieu": "Paris",
      "nombre_places": 25,
      "statut": "planifiee",
      "inscriptions": [...],
      "certificats": [...]
    },
    ...
  ]
}
```

### 2. Détail session + statistiques

```bash
curl -X GET $API_URL/sessions/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": {
    "id": 1,
    "titre": "Laravel Avancé - Session 1",
    "date_debut": "2026-01-27",
    "date_fin": "2026-02-10",
    "nombre_places": 25,
    "statut": "planifiee",
    "inscriptions": [
      {
        "id": 1,
        "etudiant_id": 5,
        "statut": "active",
        "note": null,
        "date_inscription": "2026-01-22"
      },
      ...
    ]
  }
}
```

### 3. Statistiques session (Admin/Formateur)

```bash
curl -X GET $API_URL/sessions/1/statistiques \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": {
    "nombre_total_inscriptions": 20,
    "nombre_inscriptions_actives": 18,
    "nombre_inscriptions_terminees": 2,
    "nombre_inscriptions_abandonnees": 0,
    "nombre_certificats": 0,
    "moyenne_notes": 16.5
  }
}
```

### 4. Créer une session (Admin/Formateur)

```bash
curl -X POST $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "formation_id": 1,
    "titre": "Laravel Avancé - Février 2026",
    "description": "Deuxième session",
    "date_debut": "2026-02-15",
    "date_fin": "2026-03-01",
    "lieu": "Lyon",
    "nombre_places": 30
  }'
```

**Réponse 201:**
```json
{
  "message": "Session créée avec succès",
  "data": {
    "id": 4,
    "formation_id": 1,
    "titre": "Laravel Avancé - Février 2026",
    "date_debut": "2026-02-15",
    "date_fin": "2026-03-01",
    "lieu": "Lyon",
    "nombre_places": 30,
    "statut": "planifiee",
    "created_at": "2026-01-22T11:00:00Z"
  }
}
```

### 5. Terminer une session (Admin/Formateur)

```bash
curl -X POST $API_URL/sessions/1/terminer \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "message": "Session marquée comme terminée",
  "data": {
    "id": 1,
    "statut": "terminee",
    ...
  }
}
```

### 6. Valider une session (Admin/Formateur)

```bash
curl -X POST $API_URL/sessions/1/valider \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "message": "Session validée",
  "data": {
    "id": 1,
    "statut": "validee",
    ...
  }
}
```

---

## 👥 INSCRIPTIONS

### 1. S'inscrire à une session (Étudiant)

```bash
curl -X POST $API_URL/inscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_formation_id": 1
  }'
```

**Réponse 201:**
```json
{
  "message": "Inscription réussie",
  "data": {
    "id": 21,
    "etudiant_id": 24,
    "session_formation_id": 1,
    "statut": "active",
    "note": null,
    "date_inscription": "2026-01-22",
    "session": {
      "id": 1,
      "titre": "Laravel Avancé - Session 1",
      "statut": "planifiee"
    }
  }
}
```

**Note:** Si >= 17 inscriptions, la session passe automatiquement à `validee`

### 2. Mes inscriptions (Étudiant)

```bash
curl -X GET $API_URL/inscriptions/mes-inscriptions \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": 21,
      "etudiant_id": 24,
      "session_formation_id": 1,
      "statut": "active",
      "note": null,
      "session": {
        "id": 1,
        "titre": "Laravel Avancé - Session 1",
        "formation": {
          "titre": "Laravel Avancé"
        }
      }
    }
  ]
}
```

### 3. Inscriptions d'une session (Admin/Formateur)

```bash
curl -X GET $API_URL/inscriptions/session/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": 1,
      "etudiant_id": 5,
      "statut": "active",
      "etudiant": {
        "nom": "Etudiant1",
        "prenom": "Prénom1",
        "email": "etudiant1@cni.fr"
      }
    },
    ...
  ]
}
```

### 4. Terminer une inscription + note (Admin/Formateur)

```bash
curl -X POST $API_URL/inscriptions/1/terminer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": 18.5
  }'
```

**Réponse 200:**
```json
{
  "message": "Inscription terminée"
}
```

### 5. Annuler une inscription

```bash
curl -X POST $API_URL/inscriptions/1/annuler \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "message": "Inscription annulée"
}
```

---

## 🎓 CERTIFICATS

### 1. Générer un certificat (Admin/Formateur)

**Conditions :**
- Session doit être validée
- Formation doit être terminée (date_fin passée)
- Inscription doit être terminée
- Pas déjà un certificat

```bash
curl -X POST $API_URL/certificats/1/generer \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 201:**
```json
{
  "message": "Certificat généré avec succès",
  "data": {
    "id": 1,
    "etudiant_id": 5,
    "session_formation_id": 3,
    "numero_certificat": "CERT-ABC1234567",
    "date_emission": "2026-01-22",
    "chemin_fichier": null,
    "created_at": "2026-01-22T12:00:00Z"
  }
}
```

### 2. Générer PDF du certificat (Admin/Formateur)

```bash
curl -X POST $API_URL/certificats/1/generer-pdf \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "message": "PDF généré avec succès",
  "data": {
    "chemin_fichier": "certificats/CERT-ABC1234567.pdf"
  }
}
```

### 3. Télécharger certificat PDF

```bash
curl -X GET $API_URL/certificats/1/telecharger \
  -H "Authorization: Bearer $TOKEN" \
  -o certificat.pdf
```

**Réponse 200:**
Fichier PDF en téléchargement

### 4. Mes certificats (Étudiant)

```bash
curl -X GET $API_URL/certificats/mes-certificats \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": 1,
      "numero_certificat": "CERT-ABC1234567",
      "date_emission": "2026-01-22",
      "chemin_fichier": "certificats/CERT-ABC1234567.pdf",
      "session": {
        "titre": "API REST - Session 1",
        "formation": {
          "titre": "API REST avec Node.js"
        }
      }
    }
  ]
}
```

### 5. Certificats d'une session (Admin/Formateur)

```bash
curl -X GET $API_URL/certificats/session/3 \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": 1,
      "numero_certificat": "CERT-ABC1234567",
      "etudiant": {
        "nom": "Etudiant1",
        "prenom": "Prénom1"
      },
      "date_emission": "2026-01-22"
    },
    ...
  ]
}
```

---

## 📊 DASHBOARD

### Statistiques admin

```bash
curl -X GET $API_URL/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse 200:**
```json
{
  "data": {
    "utilisateurs": {
      "total": 23,
      "etudiants": 20,
      "formateurs": 2,
      "admins": 1
    },
    "inscriptions": {
      "total": 45,
      "actives": 30,
      "terminees": 12,
      "abandonnees": 3
    },
    "sessions": {
      "planifiees": 2,
      "en_cours": 1,
      "validees": 1,
      "annulees": 0
    }
  }
}
```

---

## ⚠️ CODES D'ERREUR

### 400 Bad Request - Données invalides

```json
{
  "message": "Aucune place disponible pour cette session"
}
```

### 401 Unauthorized - Non authentifié

```json
{
  "message": "Non authentifié. Veuillez vous connecter."
}
```

### 403 Forbidden - Rôle insuffisant

```json
{
  "message": "Accès refusé. Rôle insuffisant."
}
```

### 404 Not Found - Ressource inexistante

```json
{
  "message": "Route not found"
}
```

### 422 Unprocessable Entity - Validation échouée

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

---

## 💡 CONSEILS D'UTILISATION

### 1. Automatiser avec variables

```bash
#!/bin/bash
API_URL="http://localhost:8000/api"

# Login
response=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@cni.fr",
    "password":"password123"
  }')

TOKEN=$(echo $response | jq -r '.access_token')
echo "Token: $TOKEN"

# Utiliser le token
curl -H "Authorization: Bearer $TOKEN" $API_URL/admin/dashboard
```

### 2. Avec Postman

1. Créer une collection
2. Ajouter variable d'environnement : `token`
3. Dans l'onglet "Tests" du login :
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.access_token);
```
4. Utiliser `{{token}}` dans les autres requêtes

### 3. Avec PowerShell

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    "titre" = "Ma formation"
    "duree" = 40
} | ConvertTo-Json

Invoke-WebRequest -Uri "$api_url/formations" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

**Fin des exemples API**
