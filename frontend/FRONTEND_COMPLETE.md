# Plan Frontend Complet - CNI Gestion Formations

## 📋 Sommaire

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du projet](#architecture-du-projet)
3. [Pages implémentées](#pages-implémentées)
4. [Composants réutilisables](#composants-réutilisables)
5. [Flux d'authentification](#flux-dauthentification)
6. [API endpoints](#api-endpoints)
7. [Instructions de démarrage](#instructions-de-démarrage)
8. [Tests](#tests)

---

## Vue d'ensemble

Le frontend est une application **Next.js** complète avec un système de gestion de formations permettant à trois types d'utilisateurs (Admin, Formateur, Étudiant) de gérer leurs activités respective.

### Technos utilisées:
- **Next.js 16** - Framework React
- **React Context** - Gestion d'état (authentification)
- **JWT** - Authentication tokens
- **Axios** - Requêtes HTTP
- **CSS-in-JS** - Styled JSX

---

## Architecture du projet

```
frontend/
├── pages/
│   ├── index.js                    # Page d'accueil
│   ├── profil.js                   # Profil utilisateur
│   ├── aide.js                     # Page d'aide
│   ├── auth/
│   │   ├── login.js               # Connexion
│   │   └── register.js            # Inscription
│   ├── admin/
│   │   ├── dashboard.js           # Tableau de bord admin
│   │   ├── formations.js          # Gestion formations
│   │   ├── sessions.js            # Gestion sessions
│   │   ├── inscriptions.js        # Gestion inscriptions
│   │   ├── certificats.js         # Gestion certificats
│   │   └── users.js               # Gestion utilisateurs
│   ├── formateur/
│   │   ├── dashboard.js           # Tableau de bord formateur
│   │   ├── sessions.js            # Gestion sessions
│   │   ├── certificats.js         # Gestion certificats
│   │   └── sessions/[id].js       # Detail session
│   ├── etudiant/
│   │   ├── dashboard.js           # Tableau de bord etudiant
│   │   ├── formations.js          # Explorer formations
│   │   ├── mes-inscriptions.js    # Mes inscriptions
│   │   └── certificats.js         # Mes certificats
│   └── errors/
│       ├── 403.js                 # Acces refuse
│       ├── 404.js                 # Page non trouvee
│       └── 500.js                 # Erreur serveur
├── components/
│   ├── PrivateRoute.js            # Composant protection routes
│   ├── modals/
│   │   └── FormationModal.js      # Modal ajouter/modifier formation
│   ├── tables/
│   │   ├── FormationsTable.js     # Tableau formations
│   │   ├── SessionsTable.js       # Tableau sessions
│   │   └── InscriptionsTable.js   # Tableau inscriptions
│   ├── cards/                     # Cartes affichage data
│   └── forms/                     # Formulaires reusables
├── context/
│   └── AuthContext.js             # Context authentification
├── services/
│   └── api.js                     # Service API Axios
├── styles/
│   └── globals.css                # Styles globaux
├── public/                        # Fichiers statiques
└── package.json                   # Dependances NPM
```

---

## Pages implémentées

### 1. **Pages Publiques**

#### `/` - Page d'accueil
- Navigation avec liens vers auth
- Présentation du projet
- Appel à l'action (CTA)
- Responsive design

#### `/auth/login` - Connexion
- Formulaire email/mot de passe
- Appel API POST `/login`
- Stockage JWT dans localStorage
- Redirection selon rôle:
  - Admin → `/admin/dashboard`
  - Formateur → `/formateur/dashboard`
  - Étudiant → `/etudiant/dashboard`

#### `/auth/register` - Inscription
- Formulaire avec choix de rôle
- Validation mot de passe
- Appel API POST `/register`
- Redirection vers login

#### `/profil` - Mon Profil
- Affichage informations utilisateur
- Badge rôle colorisé
- Formulaire changement mot de passe
- Bouton déconnexion

#### `/aide` - Aide & Support
- FAQ - Questions/réponses
- Permissions par rôle
- Informations contact
- Informations à propos

#### `/errors/403` - Accès refusé
- Message permissions insuffisantes
- Liens retour

#### `/errors/404` - Page non trouvée
- Message page inexistante
- Liens retour

#### `/errors/500` - Erreur serveur
- Message erreur interne
- Liens retour

---

### 2. **Pages Admin** (protégées - rôle: admin)

#### `/admin/dashboard`
- Statistiques:
  - Nombre utilisateurs
  - Nombre formations
  - Nombre sessions
  - Nombre inscriptions
  - Nombre certificats
- Cartes cliquables vers gestion

#### `/admin/users`
- Tableau utilisateurs (ID, Nom, Email, Rôle)
- Actions: Modifier, Supprimer
- Modal ajouter utilisateur

#### `/admin/formations`
- Tableau formations (ID, Nom, Description)
- Actions: Modifier, Supprimer
- Modal ajouter/modifier formation
- Bouton "+ Ajouter Formation"

#### `/admin/sessions`
- Tableau sessions (ID, Formation, Date, Inscriptions, Statut)
- Badges statut (validee, en_cours, annulee)
- Actions: Modifier, Valider (si 17+ inscriptions), Supprimer
- Bouton "+ Ajouter Session"

#### `/admin/inscriptions`
- Tableau inscriptions (Etudiant, Formation, Session, Statut)
- Actions: Valider, Annuler
- Filtrage par statut

#### `/admin/certificats`
- Cartes certificats affichant:
  - Nom etudiant
  - Formation
  - Date session
  - Bouton Generer/Telecharger PDF

---

### 3. **Pages Formateur** (protégées - rôle: formateur)

#### `/formateur/dashboard`
- Statistiques:
  - Nombre sessions
  - Nombre inscriptions
  - Nombre certificats
- Liens rapides vers sessions et certificats

#### `/formateur/sessions`
- Tableau sessions du formateur
- Actions: Modifier, Valider, Supprimer
- Affichage nombre inscriptions

#### `/formateur/sessions/[id]`
- Detail session
- Liste inscriptions
- Actions valider/annuler inscriptions

#### `/formateur/certificats`
- Cartes certificats de ses sessions
- Actions: Generer, Telecharger PDF

---

### 4. **Pages Étudiant** (protégées - rôle: etudiant)

#### `/etudiant/dashboard`
- Statistiques:
  - Nombre formations
  - Nombre inscriptions
  - Nombre certificats
- Liens rapides

#### `/etudiant/formations`
- Grille cartes formations disponibles
- Affichage: Nom, Description
- Bouton "S'inscrire" par formation
- Appel API POST `/inscriptions`

#### `/etudiant/mes-inscriptions`
- Tableau inscriptions (Formation, Session, Statut)
- Filtrage par statut
- Badges statut colorises

#### `/etudiant/certificats`
- Cartes certificats obtenus
- Affichage: Formation, Date session
- Bouton "Telecharger PDF"

#### `/etudiant/certificats/[id]`
- Detail certificat
- Informations completes
- Bouton telechargement

---

## Composants réutilisables

### `PrivateRoute`
```jsx
<PrivateRoute roles={["admin"]}>
  <AdminDashboard />
</PrivateRoute>
```
- Protege les routes
- Verifie rôles autorisés
- Redirige vers `/errors/403` si non autorisé

### `FormationModal`
- Modal ajouter/modifier formation
- Champs: nom, description
- Modes creation/edition

### `FormationsTable`
- Affichage tableau formations
- Actions edit/delete
- Emojis pour icones

### `SessionsTable`
- Tableau sessions
- Affichage statut avec badge
- Actions edit/validate/delete
- Desactivation bouton validate si < 17 inscriptions

### `InscriptionsTable`
- Tableau inscriptions
- Affichage statut
- Actions validate/cancel
- Affichage conditionnel selon statut

---

## Flux d'authentification

```
Login Form
    ↓
API POST /login
    ↓
JWT Token Received
    ↓
loginUser(token) → AuthContext
    ↓
localStorage.setItem("token", token)
    ↓
Redirection selon rôle
```

### Token JWT contient:
- `id` - ID utilisateur
- `name` - Nom utilisateur
- `email` - Email
- `role` - Rôle (admin/formateur/etudiant)

---

## API Endpoints

### Authentification
```
POST   /login              - Connexion
POST   /register           - Inscription
POST   /logout             - Deconnexion
```

### Formations
```
GET    /formations         - Liste formations
GET    /formations/{id}    - Detail formation
POST   /formations         - Creer formation
PUT    /formations/{id}    - Modifier formation
DELETE /formations/{id}    - Supprimer formation
```

### Sessions
```
GET    /sessions           - Liste sessions
GET    /sessions/{id}      - Detail session
POST   /sessions           - Creer session
PUT    /sessions/{id}      - Modifier session
DELETE /sessions/{id}      - Supprimer session
POST   /sessions/{id}/validate - Valider session
```

### Inscriptions
```
GET    /inscriptions       - Liste inscriptions
GET    /my-inscriptions    - Mes inscriptions
POST   /inscriptions       - Creer inscription
PUT    /inscriptions/{id}  - Modifier inscription
DELETE /inscriptions/{id}  - Supprimer inscription
POST   /inscriptions/{id}/validate - Valider inscription
POST   /inscriptions/{id}/cancel - Annuler inscription
```

### Certificats
```
GET    /certificats        - Liste certificats
GET    /my-certificats     - Mes certificats
POST   /certificats/{id}/generate - Generer PDF
GET    /certificats/{id}/download - Telecharger
```

### Utilisateurs
```
GET    /users              - Liste utilisateurs
GET    /users/{id}         - Detail utilisateur
POST   /users              - Creer utilisateur
PUT    /users/{id}         - Modifier utilisateur
DELETE /users/{id}         - Supprimer utilisateur
PUT    /profile            - Modifier mon profil
POST   /change-password    - Changer mot de passe
```

---

## Instructions de démarrage

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Variables d'environnement
Creer `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### 3. Demarrage developpement
```bash
npm run dev
```
L'app est disponible sur: `http://localhost:3000`

### 4. Build production
```bash
npm run build
npm start
```

---

## Tests

### Comptes de test disponibles:
```
Admin:
Email: admin@test.com
Password: password123

Formateur:
Email: formateur@test.com
Password: password123

Étudiant:
Email: etudiant@test.com
Password: password123
```

### Flux de test recommandé:

#### 1. Test Admin
- [ ] Login avec admin
- [ ] Consulter dashboard
- [ ] Creer/modifier/supprimer formation
- [ ] Creer/modifier/supprimer session
- [ ] Valider inscription si 17+ participants
- [ ] Telecharger certificat

#### 2. Test Formateur
- [ ] Login avec formateur
- [ ] Voir ses sessions
- [ ] Valider/annuler inscriptions
- [ ] Generer certificat
- [ ] Telecharger PDF

#### 3. Test Étudiant
- [ ] Login avec etudiant
- [ ] Explorer formations disponibles
- [ ] S'inscrire a une formation
- [ ] Voir mes inscriptions
- [ ] Voir mes certificats
- [ ] Telecharger certificat

#### 4. Test Authentification
- [ ] Login invalide
- [ ] Session expiree
- [ ] Acces non autorise (403)
- [ ] Page inexistante (404)

---

## Statuts d'implementation

✅ = Complet
⚠️ = A connecter avec l'API
❌ = Non commence

### Pages
- ✅ Page d'accueil
- ✅ Authentification (login/register)
- ✅ Profil & Aide
- ✅ Pages erreurs
- ✅ Admin (dashboard, users, formations, sessions, inscriptions, certificats)
- ✅ Formateur (dashboard, sessions, certificats)
- ✅ Étudiant (dashboard, formations, mes-inscriptions, certificats)

### Composants
- ✅ PrivateRoute
- ✅ Modales (Formation)
- ✅ Tableaux (Formations, Sessions, Inscriptions)
- ⚠️ Composants formulaires
- ⚠️ Composants cartes

### Services
- ✅ API Axios
- ✅ Intercepteur JWT
- ✅ Endpoints definis

### Context
- ✅ AuthContext
- ✅ Login/Logout
- ✅ JWT Decode

---

## Notes de développement

1. **Redirections**: Tous les utilisateurs non-authentes sont rediriges vers `/auth/login`
2. **Rôles**: Les pages sont protegees avec `PrivateRoute roles={["admin"]}`
3. **CSS**: Styled JSX pour les styles isoles par composant
4. **Appels API**: Axios avec intercepteur JWT automatique
5. **Stockage**: Utilisateurs stockes dans JWT, persist dans localStorage

---

## Prochaines etapes

1. ✅ Build test
2. ⚠️ Connexion API backend
3. ⚠️ Tests E2E
4. ⚠️ Ameliorations UX/UI
5. ⚠️ Optimisation performance

---

## Support

Pour toute question: consultez `/aide.js` ou contactez l'equipe support.
