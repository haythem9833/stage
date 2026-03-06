# 🔄 Diagrammes et Flux - CNI Gestion Formations

## 1. Diagramme Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEUR FINAL                       │
│           Browser (Web / Mobile Responsive)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                  FRONTEND (Next.js 16)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages (Auth, Admin, Étudiant, Formateur, etc.)    │   │
│  │  Components (Forms, Tables, Modals, etc.)          │   │
│  │  Context API (AuthContext pour auth globale)       │   │
│  │  Services API (axios clients pour appels)          │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
                         │ Token Sanctum
┌────────────────────────▼────────────────────────────────────┐
│                BACKEND (Laravel 11)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes (37+ endpoints)                         │   │
│  │  Controllers (Auth, Formation, Session, etc.)       │   │
│  │  Middlewares (Auth:Sanctum, CheckRole)             │   │
│  │  Services (FormationService, SessionService, etc.)  │   │
│  │  Models (User, Formation, SessionFormation, etc.)   │   │
│  │  Eloquent ORM                                       │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│              BASE DE DONNÉES                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Développement: SQLite                              │   │
│  │  Production: MySQL / PostgreSQL                     │   │
│  │  Tables: users, formations, sessions, etc.          │   │
│  │  Migrations versionnées (18 fichiers)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

           Fichiers
       ┌─────────────┐
       │ Certificats │
       │    (PDF)    │
       │  /storage   │
       └─────────────┘
```

---

## 2. Flux d'Authentification

```
┌─────────────┐
│ Utilisateur │
└──────┬──────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
  ┌─────────────┐                         ┌──────────────┐
  │   REGISTER  │                         │    LOGIN     │
  └──────┬──────┘                         └──────┬───────┘
         │                                       │
         │ POST /api/register                    │ POST /api/login
         │ {nom, prenom, email, pwd, role?}     │ {email, password}
         │                                       │
         ▼                                       ▼
  ┌──────────────────────┐            ┌──────────────────────┐
  │ Validate Input       │            │ Validate Email/Pwd   │
  │ Hash Password        │            │ Rate Limit (5/min)   │
  │ Create User          │            │ Generate Token       │
  └──────┬───────────────┘            └──────┬───────────────┘
         │                                    │
         │ SI rôle admin/formateur            │
         │ ALORS status=pending               │
         │ ELSE status=approved               │
         │                                    │
         ▼                                    ▼
  ┌──────────────────────┐            ┌──────────────────────┐
  │ User Created         │            │ Token Returned       │
  │ status: pending      │            │ user_data returned   │
  │ (need approval)      │            │                      │
  └──────┬───────────────┘            └──────┬───────────────┘
         │                                    │
         │ Admin approves later               │ Frontend stores token
         │ (role gets elevated)               │ (localStorage)
         │                                    │
         └─────────────────────┬──────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ Logged In   │
                        │ Can access  │
                        │ API routes  │
                        └─────────────┘
```

---

## 3. Flux d'Inscription à une Formation (Clée)

```
ÉTUDIANT                          FRONTEND                         BACKEND
    │                                │                                │
    │ Consulte formations             │                                │
    ├────────────────────────────────→ GET /formations                │
    │                                 ├───────────────────────────────→
    │                                 │ Retour: Liste formations       │
    │                                 ←───────────────────────────────┤
    │ Affichage sessions disponibles  │                                │
    │←────────────────────────────────┤                                │
    │                                 │                                │
    │ Clique "S'inscrire"             │                                │
    │                                 │                                │
    ├─ Données: {etudiant_id, formation_id}                           │
    │                                 │                                │
    │                              POST /inscriptions                  │
    │                                 ├───────────────────────────────→
    │                                 │                                │
    │                                 │  InscriptionService.inscrire()
    │                                 │                                │
    │                                 │  1. Vérifier pas déjà inscrit
    │                                 │  2. Vérifier places dispo
    │                                 │  3. Créer Inscription
    │                                 │  4. Appeler:
    │                                 │     session.validerAutomatiquement()
    │                                 │                                │
    │                                 │     ┌─ SI inscriptions >= 17 ┌─
    │                                 │     │  THEN statut = 'validee'│
    │                                 │     └─────────────────────────┘
    │                                 │                                │
    │                                 │  5. Retour: Inscription object
    │ Inscription créée              │ ←───────────────────────────────┤
    │ (status: 'active')             │                                │
    │←────────────────────────────────┤                                │
    │                                 │                                │
    │ Affichage confirmation          │                                │
    └─────────────────────────────────┘                                │
                                                                       │
                            🎯 IMPORTANT 🎯
                    Validation Session: AUTOMATIQUE
                    Trigger: Après chaque inscription
                    Condition: >= 17 inscriptions
                    Action: statut passe à 'validee'
```

---

## 4. État Session - Diagramme État

```
                    ┌──────────────┐
                    │   active     │
                    │ (creée)      │
                    └────────┬─────┘
                             │
                ┌────────────┴────────────┐
                │                        │
                ▼                        ▼
         AUTOMATIQUE                MANUEL (admin)
         (17+ inscrits)             (force validation)
                │                        │
                ▼                        ▼
            ┌──────────────┐        ┌──────────────┐
            │   validee    │        │   validee    │
            │ (auto)       │        │ (forced)     │
            └────────┬─────┘        └────┬─────────┘
                     │                   │
                     └───────┬───────────┘
                             │
                      (Admin ou fin date)
                             │
                             ▼
                        ┌──────────────┐
                        │  terminee    │
                        │ (closed)     │
                        └──────────────┘

Possibilité aussi:
active → abandonnee (si annulation)
```

---

## 5. Flux de Génération Certificat

```
ADMIN/FORMATEUR              FRONTEND                    BACKEND
        │                        │                          │
        │ Consulte inscriptions   │                          │
        ├───────────────────────→ GET /inscriptions         │
        │                        ├────────────────────────→
        │                        │ Retour: Liste           │
        │                        ←────────────────────────┤
        │                        │                          │
        │ Clique "Générer Cert." │                          │
        │                        │                          │
        │     {inscription_id}   │ POST /certificats/{id}/generate
        │                        ├──────────────────────────→
        │                        │                          │
        │                        │  CertificatService.genererCertificat()
        │                        │                          │
        │                        │  1. Vérifier inscription
        │                        │  2. Vérifier formation terminée
        │                        │  3. Générer numéro unique
        │                        │  4. Générer PDF:
        │                        │     - Template: certificat_template.blade.php
        │                        │     - Data: Étudiant, Formation, Dates
        │                        │     - DOMPDF: Blade → PDF
        │                        │  5. Sauvegarder:
        │                        │     /storage/certificats/cert_XXX.pdf
        │                        │  6. Créer record Certificat (BD)
        │                        │                          │
        │ Certificat généré      │ ← {id, numero, chemin}
        │ PDF disponible         ←──────────────────────────┤
        │                        │                          │
        │ Afficher lien téléch.  │                          │
        │                        │                          │
        │ Clic "Télécharger"     │ GET /certificats/{id}/download
        │                        ├──────────────────────────→
        │                        │                          │
        │                        │  Retour PDF (streaming)
        │ Téléchargement PDF     │ ←──────────────────────────┤
        │                        │                          │
        └────────────────────────┘                          │
                              Fichier PDF stocké
                              en /storage/certificats/
```

---

## 6. Flux d'Évaluation Formation

```
ÉTUDIANT                      FRONTEND                      BACKEND
    │                            │                             │
    │ Fin formation              │                             │
    │ Formation.statut = 'evaluation'                          │
    │ & date dans intervalle                                  │
    │                            │                             │
    │ Consulte "Mes Formations"  │                             │
    ├───────────────────────────→ GET /evaluations/formations │
    │                            ├────────────────────────────→
    │                            │ (formations à évaluer)      │
    │ Liste formations évaluables│ ←────────────────────────────┤
    │←────────────────────────────┤                            │
    │                            │                            │
    │ Clique "Évaluer"           │                            │
    │                            │                            │
    │ Ouvre EvaluationForm       │ GET /inscriptions/{id}/evaluation
    │                            ├────────────────────────────→
    │                            │ (récupère évaluation si existe)
    │                            │ ←────────────────────────────┤
    │                            │                            │
    │ Remplit formulaire:        │                            │
    │ - Environnement (1-5)      │                            │
    │ - Formateur (1-5)          │                            │
    │ - Formation (1-5)          │                            │
    │ - Services (1-5)           │                            │
    │ - Commentaires/Suggestions │                            │
    │                            │                            │
    │ Clique "Enregistrer"       │                            │
    │                            │ POST /inscriptions/{id}/evaluation/create
    │                            ├────────────────────────────→
    │                            │ {data: notes, commentaires}
    │                            │                             │
    │                            │  Créer Evaluation
    │                            │  status: 'pending'
    │                            │  Calculer note moyenne
    │                            │ ←────────────────────────────┤
    │ Évaluation sauvegardée    │                             │
    │ (peut modifier avant envoi)│                             │
    │                            │                             │
    │ Clique "Soumettre"         │ POST /evaluations/{id}/submit
    │                            ├────────────────────────────→
    │                            │                             │
    │                            │  Marquer comme 'completed'
    │                            │  Timestamp submitted_at
    │                            │ ←────────────────────────────┤
    │                            │                             │
    │ "Merci d'avoir évalué"     │                             │
    │←────────────────────────────┤                             │
    │                            │                             │
    └────────────────────────────┘                             │
                                    Evaluation enregistrée
                                    Admin peut voir stats
                                    Formateur voit feedback
```

---

## 7. Modèle Données - Relations

```
┌─────────────┐          ┌─────────────────────┐
│    USER     │          │    FORMATION        │
├─────────────┤          ├─────────────────────┤
│ id (PK)     │◄─────────│ id (PK)             │
│ email       │ 1:M      │ formateur_id (FK)   │
│ password    │          │ titre               │
│ role        │          │ statut              │
│ nom         │          │ date_debut_eval     │
│ prenom      │          │ date_fin_eval       │
│ status      │          └─────────────────────┘
└─────────────┘                  │
       │                         │ 1:M
       │ 1:M                     │
       │                         ▼
       │                  ┌──────────────────┐
       ├─────────────────→│ INSCRIPTION      │
       │                  ├──────────────────┤
       │                  │ id (PK)          │
       │                  │ etudiant_id (FK) │
       │                  │ formation_id (FK)│
       │                  │ statut           │
       │                  │ note             │
       │                  └──────┬───────────┘
       │                         │
       │                         │ 1:1
       │                         ▼
       │                  ┌──────────────────┐
       │                  │ EVALUATION       │
       │                  ├──────────────────┤
       │                  │ id (PK)          │
       │                  │ inscrit_id (FK)  │
       │                  │ formation_id(FK) │
       │                  │ note             │
       │                  │ env_note         │
       │                  │ form_note        │
       │                  │ form_note        │
       │                  │ services_note    │
       │                  │ status           │
       │                  └──────────────────┘
       │
       │ 1:M
       ▼
┌──────────────────┐
│   CERTIFICAT     │
├──────────────────┤
│ id (PK)          │
│ etudiant_id (FK) │
│ formation_id(FK) │
│ numero           │
│ chemin_fichier   │
│ date_emission    │
└──────────────────┘

SessionFormation (Legacy/Deprecated):
- Utilisée anciennement pour sessions
- Logique migrée vers Formation avec phases
- Peut être gardée pour compatibilité
```

---

## 8. Matrice Rôles & Permissions

```
┌────────────────────┬─────────┬──────────────┬──────────┐
│      Action        │  ADMIN  │  FORMATEUR   │ ETUDIANT │
├────────────────────┼─────────┼──────────────┼──────────┤
│ Créer Formation     │    ✓    │      ✓       │    ✗     │
│ Modifier Formation  │    ✓    │      ✓       │    ✗     │
│ Supprimer Formation │    ✓    │      ✗       │    ✗     │
├────────────────────┼─────────┼──────────────┼──────────┤
│ Valider Session    │    ✓    │      ✓       │    ✗     │
│ Terminer Session   │    ✓    │      ✓       │    ✗     │
│ Supprimer Session  │    ✓    │      ✗       │    ✗     │
├────────────────────┼─────────┼──────────────┼──────────┤
│ S'inscrire Form    │    ✗    │      ✗       │    ✓     │
│ Voir Inscriptions  │    ✓    │   Ses forms  │   Siennes │
│ Annuler Inscrip    │    ✓    │      ✗       │   Siennes │
├────────────────────┼─────────┼──────────────┼──────────┤
│ Générer Certificat │    ✓    │   Ses forms  │    ✗     │
│ Télécharger Cert   │    ✓    │   Ses forms  │   Siens   │
├────────────────────┼─────────┼──────────────┼──────────┤
│ Évaluer Formation  │    ✗    │      ✗       │    ✓     │
│ Voir Stats Eval    │    ✓    │   Ses forms  │    ✗     │
├────────────────────┼─────────┼──────────────┼──────────┤
│ Gérer Utilisateurs │    ✓    │      ✗       │    ✗     │
│ Approuver Rôles    │    ✓    │      ✗       │    ✗     │
│ Voir Dashboard     │    ✓    │      ✗       │    ✗     │
└────────────────────┴─────────┴──────────────┴──────────┘
```

---

## 9. Validation Automatique - Détail Technique

```
Classe: SessionFormation
Méthode: validerAutomatiquement()

┌─ Déclenchement
│  ├─ Après new Inscription.save()
│  └─ Appelé par InscriptionService.inscrire()
│
├─ Logique
│  │
│  ├─ Compter inscriptions acceptées/validées
│  │  $nombreInscriptions = $this->inscriptionsActives()->count()
│  │
│  ├─ SI count >= 17 ET statut != 'validee'
│  │  ├─ $this->statut = 'validee'
│  │  └─ $this->save()
│  │
│  └─ ELSE
│     └─ Pas de changement
│
└─ Résultat
   ├─ Session reste 'active' si < 17 inscrits
   ├─ Session devient 'validee' si >= 17 inscrits
   └─ BD sauvegardée automatiquement

Avantage: 
- Aucune intervention admin
- Processus transparent
- Scalable (même logique pour 100 sessions)

Seuil: 17 inscrits (configurable dans code)
```

---

## 10. Flux de Sécurité - Authentification

```
Request HTTP
    │
    ▼
┌──────────────────────────┐
│ Route API (protégée)     │
│ middleware:auth:sanctum  │
└────────┬─────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │ Header:             │
    │ Authorization:      │
    │ Bearer {TOKEN}      │
    └────────┬────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Sanctum valide token:    │
    │ - Existe en BD?          │
    │ - Pas expiré?            │
    │ - Avec bon app_key?      │
    └────────┬─────────────────┘
             │
      ┌──────┴──────┐
      │             │
   ✓ (valide)   ✗ (invalide)
      │             │
      ▼             ▼
  ┌──────┐    ┌──────────────┐
  │User  │    │ 401          │
  │object│    │ Unauthorized │
  └──┬───┘    └──────────────┘
     │
     ▼
┌──────────────────────────┐
│ SI middleware role:admin │
│ Vérifier user.role      │
└────────┬─────────────────┘
         │
      ┌──┴──┐
      │     │
   ✓ (ok) ✗ (403)
      │     │
      ▼     ▼
   Next  Forbidden
```

---

## 11. Séquence Complete: Inscription → Certificat

```
Jour 1: Étudiant s'inscrit
│
├─ POST /inscriptions
│  └─ Inscription créée (statut='active')
│     └─ session.validerAutomatiquement()
│
│ ... 16 autres étudiants s'inscrivent ...
│
├─ POST /inscriptions (17ème)
│  └─ Inscription créée
│     └─ session.validerAutomatiquement()
│        └─ 17 inscrits >= 17
│           └─ Session passe à 'validee' ✓
│
Jours 2-10: Formation se déroule
│
Jour 11: Formation terminée
│
├─ Admin change formation.statut = 'evaluation'
│
└─ Étudiants complètent leurs évaluations
   └─ POST /evaluations/{id}/submit

Jour 12: Génération certificats
│
├─ Admin/Formateur: POST /certificats/{id}/generate
│  ├─ Vérification inscription
│  ├─ Vérification formation terminée
│  ├─ Génération PDF (DOMPDF + Blade template)
│  ├─ Stockage /storage/certificats/
│  └─ Création record Certificat (BD)
│
└─ Certificat prêt pour téléchargement

Jour 13+: Étudiants téléchargent certificats
│
├─ GET /certificats/{id}/download
│  └─ Streaming PDF
│
└─ Étudiant a son PDF ✓
```

---

## 12. Stack Technologique Détaillé

```
┌──────────────────────────────────┐
│         FRONTEND STACK            │
├──────────────────────────────────┤
│ Framework: Next.js 16             │
│ Language: TypeScript / JavaScript │
│ UI Library: React 19              │
│ Styling: Tailwind CSS 4           │
│ Icons: Lucide React + FontAwesome │
│ HTTP Client: Axios                │
│ State: React Context + React Query│
│ Auth: JWT (jwt-decode)            │
│ Linter: ESLint 9                  │
└──────────────────────────────────┘
           │
           │ HTTP/HTTPS (JSON)
           │ Token Sanctum
           ▼
┌──────────────────────────────────┐
│         BACKEND STACK             │
├──────────────────────────────────┤
│ Framework: Laravel 11             │
│ Language: PHP 8.2+                │
│ Database ORM: Eloquent            │
│ Authentication: Sanctum 4         │
│ PDF Generation: DOMPDF 2          │
│ Testing: PHPUnit                  │
│ Data Faking: Faker                │
└──────────────────────────────────┘
           │
           │ SQL
           │
           ▼
┌──────────────────────────────────┐
│      DATABASE STACK               │
├──────────────────────────────────┤
│ Dev: SQLite (database.sqlite)     │
│ Prod: MySQL 8+ / PostgreSQL       │
│ Migrations: Laravel (18 versions) │
│ Seeders: Test Data                │
└──────────────────────────────────┘
           │
           │ File Storage
           │
           ▼
┌──────────────────────────────────┐
│      FILE STORAGE                 │
├──────────────────────────────────┤
│ Certificats PDF: /storage/...     │
│ Logs: /storage/logs/              │
│ Cache: /bootstrap/cache/          │
└──────────────────────────────────┘
```

---

**Fin des Diagrammes et Flux**
