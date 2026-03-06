# ✅ CHECKLIST DE DÉMARRAGE - Plan v2.0 CNI

**Avant de commencer SEMAINE 1 (Salles & Ressources)**

---

## 📋 PRÉPARATION ÉQUIPE (DAY 1)

### 🧑‍💼 Rôles et Responsabilités
```
☐ Product Owner/Manager
  → Valide roadmap
  → Priorités client
  → Décisions rapides

☐ Backend Developer (Laravel)
  → Models, Services, Controllers
  → Migrations, Tests
  → API endpoints

☐ Frontend Developer (React/Next.js)
  → Components, Pages
  → Integration API
  → UX/Styling

☐ DevOps/Infra (optionnel mais utile)
  → DB setup
  → Mail setup
  → Deployment
```

### 💼 Compétences Requises
```
Backend:
  ☐ Laravel 12 (Eloquent, Jobs, Events)
  ☐ PHP 8.2+
  ☐ SQL (migrations, indexes)
  ☐ PHPUnit testing
  ☐ DOMPDF / PDF generation

Frontend:
  ☐ Next.js 16
  ☐ React 19 + Hooks
  ☐ TypeScript (optionnel mais recommandé)
  ☐ Tailwind CSS
  ☐ Axios / API integration

Partage:
  ☐ Architecture (penser ensemble)
  ☐ API contracts (avant coding)
  ☐ Git workflows
```

---

## 🔧 SETUP ENVIRONNEMENT (DAY 2-3)

### Backend Setup
```
☐ Laravel 12 déjà installé? (vérifier)
  
☐ Dépendances additionnelles
  composer require maatwebsite/excel:^3.1
  
☐ Config queue (pour notifications P2)
  QUEUE_CONNECTION=database  # dans .env
  php artisan queue:table
  php artisan migrate
  
☐ Config mail (pour notifications P2)
  MAIL_DRIVER=smtp
  MAIL_HOST=smtp.mailtrap.io (dev)
  MAIL_FROM_ADDRESS=cni@formations.local
  
☐ Database backup avant migrations
  # Faire backup BD actuelle
  php artisan db:export cni_backup.sql
  
☐ Git setup
  ☐ Branch feature/v2-priorite1-salles
  ☐ .gitignore updated
  ☐ Commits réguliers
```

### Frontend Setup
```
☐ Package.json updated avec:
  npm install recharts@^2.5
  npm install react-big-calendar@^1.8
  
☐ Component folder structure ready
  mkdir -p components/Salles
  mkdir -p components/Planning
  mkdir -p components/Presences
  mkdir -p components/Dashboard
  
☐ Services API folder
  mkdir -p services/api
  # Créer salle.service.ts, planning.service.ts, etc.
  
☐ Lint/Format tools
  npm run lint --fix  # ESLint
  npm run format      # Prettier si présent
```

### Database Backup
```
☐ SQLite (dev)
  cp backend/database.sqlite backend/database.sqlite.backup

☐ Production (si applicable)
  mysqldump -u root -p cni_formations > backup.sql
```

---

## 📋 PLANIFICATION SPRINTS (WEEK PLANNING)

### Sprint 1 (Sem 1-2): Salles & Ressources (30h)

#### Backend Tasks
```
☐ Migration: create_salles_table
☐ Migration: create_ressources_table
☐ Migration: add_salle_id_to_sessions_table
☐ Model: Salle.php
☐ Model: Ressource.php
☐ Service: SalleService.php (120 lignes)
☐ Controller: SalleController.php
☐ Routes: api.php (5 endpoints)
☐ Tests: SalleServiceTest.php
☐ Seeder: SalleSeeder.php (données test)
```

#### Frontend Tasks
```
☐ ListeSalles.tsx
☐ SalleDetail.tsx
☐ FormSalle.tsx
☐ CalendrierSalles.tsx
☐ DisponibiliteChecker.tsx
☐ salle.service.ts (Axios wrapper)
☐ Styling avec Tailwind
☐ Tests composants (optional)
```

#### QA/Integration
```
☐ Postman: 5 requests pour CRUD salles
☐ Manual testing: Créer salle → Vérifier DB
☐ Frontend: Appels API depuis UI
☐ Edge cases: Capacité négative? Nom vide?
```

#### Definition of Done
```
☐ Code reviewed (pair review)
☐ Tests passing (npm test + php artisan test)
☐ No linting errors
☐ Documentation commentaires
☐ Merged to main
```

---

### Sprint 2 (Sem 3-4): Suivi Presences (36h)

#### Backend Tasks
```
☐ Migration: create_presences_table
☐ Model: Presence.php
☐ Service: PresenceService.php (150 lignes)
☐ Controller: PresenceController.php
☐ Routes: api.php (5 endpoints presences)
☐ View Blade: presences/feuille-emargement.blade.php
☐ Tests: PresenceServiceTest.php
☐ Seeder: PresenceSeeder.php
```

#### Frontend Tasks
```
☐ FeuillePresenceForm.tsx (Marquage)
☐ FeuillePresenceView.tsx (Tableau)
☐ TauxPresenceCard.tsx
☐ JustificationModal.tsx
☐ PresenceStats.tsx
☐ presence.service.ts
☐ Export PDF button
☐ Styling + responsif
```

#### Testing
```
☐ Batch presences: 20 étudiants en 1 requête
☐ Calcul taux: 10 jours, vérifier 100% = 10/10
☐ PDF génération: Fichier créé, valide
☐ Edge cases: Présent + Absent jour? Duplicates?
```

---

### Sprint 3 (Sem 5): Planning Formateurs (26h)

#### Backend Tasks
```
☐ Migration: add_planning_columns_to_users_table
☐ Migration: create_disponibilites_formateurs_table
☐ Model: Formateur.php (extends User)
☐ Model: DisponibiliteFormateur.php
☐ Service: PlanningService.php (140 lignes)
☐ Controller: PlanningController.php
☐ Routes: api.php (4 endpoints)
☐ Tests: PlanningServiceTest.php
```

#### Frontend Tasks
```
☐ PlanningFormateur.tsx (Calendar)
☐ AjouterIndisponibilite.tsx (Modal)
☐ ConflitDetectionBanner.tsx
☐ planning.service.ts
☐ React Big Calendar setup
☐ Styling calendrier
```

#### Critical Testing
```
☐ Détecte conflits? Même jour × heure?
☐ Indisponibilités marquées correctement?
☐ Sessions formateur affichées?
☐ Drag-drop indispos fonctionne?
```

---

### Sprint 4 (Sem 6): Dashboard V2 (22h)

#### Backend Tasks
```
☐ Endpoint: GET /api/admin/dashboard-v2/stats
☐ Statistiques: sessions_actives, taux_remplissage
☐ Statistiques: taux_presence_global
☐ Alertes: sessions non validées, conflits
☐ Tests: DashboardControllerTest
```

#### Frontend Tasks
```
☐ AdminDashboardV2.tsx (page)
☐ StatistiquesCard.tsx
☐ GraphiqueTauxRemplissage.tsx
☐ SessionsCalendrier.tsx (mini calendar)
☐ AlertesWidget.tsx
☐ Recharts setup
☐ Responsive layout
```

#### Testing
```
☐ Graphiques affichent correct données
☐ Alertes détectées correctement
☐ Performance: reload < 2s
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Priority 1)
```
☐ SalleService::trouverSallesDisponibles()
☐ SalleService::recommanderSalle()
☐ PresenceService::getTauxPresence()
☐ PresenceService::getFeuillePresence()
☐ PlanningService::estDisponible()
☐ PlanningService::detecterConflits()

Command: php artisan test --filter=ServiceTest
```

### Feature Tests (Priority 1)
```
☐ POST /api/salles → Crée salle
☐ GET /api/salles/disponibles → Retourne bonnes salles
☐ POST /api/presences/batch → Enregistre correctement
☐ GET /api/sessions/{id}/feuille-presence → JSON valide
☐ POST /api/formateurs/check-disponibilite → Conflits détectés

Command: php artisan test --filter=FeatureTest
```

### API Tests (Priority 2)
```
☐ Authentification: Bearer token
☐ Authorization: role:admin sur delete
☐ Validation input: nom salle vide → 422
☐ Rate limiting: 60 req/min
☐ CORS: Frontend peut appeler

Tool: Postman collection
```

### Frontend Tests (Priority 2)
```
☐ ListeSalles charge et affiche
☐ FeuillePresenceForm submit fonctionne
☐ PlanningFormateur drags correctly
☐ Graphiques Dashboard rendus

Command: npm test (Jest/Vitest)
```

---

## 📐 ARCHITECTURE DECISIONS

### 1. Migrations Order
```
☐ Ordre figé, non-réversible:
  1. add_planning_columns_to_users_table
  2. create_disponibilites_formateurs_table
  3. create_salles_table
  4. create_ressources_table
  5. add_salle_id_to_sessions_table  ← SESSION dépend SALLE!
  6. create_presences_table          ← PRESENCE dépend SESSION!
  7. add_fields_to_formations_table
  8. modify_inscriptions_statut_enum

  Exécuter dans .env: php artisan migrate --path=...
```

### 2. API Response Format
```
☐ Success: { success: true, data: {...}, message: "..." }
☐ Error: { success: false, error: "...", code: "VALIDATION_ERROR" }
☐ Pagination: { data: [...], pagination: { total, per_page, current_page } }

Exemple:
GET /api/salles?page=1
Response: {
  data: [ { id, nom, capacite_max, ... } ],
  pagination: { total: 50, per_page: 15, current_page: 1 }
}
```

### 3. Frontend State Management
```
☐ Auth: Context (AuthContext.js) ✓
☐ API Data: React Query / SWR
☐ Form State: useState (simple) ou React Hook Form (complexe)
☐ Global UI: Context (modal, notifications)

Éviter Redux, c'est overkill
```

### 4. Performance Considerations
```
☐ DB Queries: Eager loading (with())
  SessionFormation::with(['salle', 'inscriptions', 'formateur'])->get()
  
☐ Indexes: 
  create index idx_session_salle on session_formations(salle_id)
  create index idx_presence_session_date on presences(session_id, date_session)
  
☐ Pagination: 
  Endpoint retourne max 20 items à la fois
  
☐ Caching: 
  Format salle cache 1h
  Dashboard stats cache 5 min
```

---

## 🚨 GOTCHAS & PIÈGES

### 1. Foreign Keys
```
⚠️ SI vous oubliez onDelete('cascade'):
   Supprimer session → Erreur! Presences orphelines

✓ Toujours:
  $table->foreign('salle_id')
    ->references('id')->on('salles')
    ->onDelete('cascade');
```

### 2. Date/Time Zones
```
⚠️ SQLite UTC, Laravel timezone config
   Presences comparaison date peut fail

✓ Toujours:
  date_session: Carbon::today()  // Pas now()!
  Comparer dates, pas datetimes
```

### 3. N+1 Query Problem
```
⚠️ MAUVAIS:
  $salles = Salle::all();
  foreach ($salles as $salle) {
    $salle->sessions()->count();  // +1 query par salle
  }

✓ BON:
  $salles = Salle::withCount('sessions')->get();
  // 1 query total!
```

### 4. DOMPDF Limitations
```
⚠️ PDF ne support pas:
  - Animations CSS
  - JavaScript
  - Images dynamiques (base64 ok)
  - Layouts complexes (padding peut cassé)

✓ Tester PDF sur données réelles
  php artisan tinker
  > return PDF::loadView('...', $data)->output();
```

### 5. Email Throttling
```
⚠️ Si vous envoyez 100 emails à la fois:
   Mail provider bloque (spam detection)

✓ Toujours utiliser Queue:
  event(new InscriptionConfirmed($inscription));
  // Event triggers job qui envoie email
  // Queue processe lentement
```

---

## 🎯 DEFINITION OF DONE (Chaque feature)

Pour **chaque fonctionnalité**, valider:

```
☐ CODE
  ☐ Code écrit selon standards Laravel/React
  ☐ Pas de dead code
  ☐ Commentaires sur logique complexe
  
☐ TESTING
  ☐ Tests unitaires ≥ 80% coverage
  ☐ Tests fonctionnels passent
  ☐ Manual testing complet
  
☐ DOCUMENTATION
  ☐ Code comments
  ☐ README si nouveau concept
  ☐ API doc (Postman ou Swagger)
  ☐ DB schema documentation
  
☐ REVIEW
  ☐ Code reviewed par pair
  ☐ Approuvé par tech lead
  
☐ INTEGRATION
  ☐ Merges to main sans conflict
  ☐ Tests CI/CD pass
  ☐ Pas de regressions
  
☐ DEPLOYMENT
  ☐ Migrations exécutées en prod
  ☐ Data migrated si besoin
  ☐ Rollback plan ready
```

---

## 📊 BURN-DOWN TRACKING

### Template Semaine
```
SEMAINE N: [FEATURE] - 30h

JOUR 1: Architecture (4h)
  ☐ DB design finalisé
  ☐ API contracts définis
  ☐ Components sketched
  Éstimé: 30h

JOUR 2-4: Implémentation (16h)
  ☐ Backend: Models + Services (8h)
  ☐ Frontend: Components (8h)
  Remaining: 14h

JOUR 5: Tests + Integration (6h)
  ☐ API tests
  ☐ Frontend tests
  ☐ Manual QA
  Remaining: 8h

REVISIT DAY 1 sem prochaine (8h)
  ☐ Bugfixes
  ☐ Optimisations
  ☐ Review feedback
  Status: DONE ✓
```

---

## 🔄 GIT WORKFLOW

### Branch Strategy
```
main (production)
  ↓
develop (integration)
  ↓
feature/v2-priorite1-salles
  ├─ backend/salles-db
  ├─ backend/salles-service
  └─ frontend/salles-ui
  
feature/v2-priorite1-presences
  ├─ backend/presences-db
  ├─ backend/presences-service
  └─ frontend/presences-ui
```

### Commit Convention
```
feat: Add Salle model and migrations
docs: Update API documentation
test: Add SalleService tests
fix: Correct capacity validation
refactor: Extract planning logic to service

Format: [type]: [description]
```

### PR Template
```markdown
## Description
Bref résumé de la feature

## Changes
- [ ] Backend: [list changes]
- [ ] Frontend: [list changes]
- [ ] Migrations: [list migrations]

## Testing
- [ ] Unit tests pass
- [ ] API endpoints tested
- [ ] Manual QA done

## Checklist
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No new warnings/errors
```

---

## 📞 DAILY STANDUP

### Format (15 min max)
```
BACKEND DEVELOPER:
  Yesterday: Implémented SalleService.findAvailable()
  Today: Finish SalleController, start tests
  Blockers: Nope

FRONTEND DEVELOPER:
  Yesterday: Created ListeSalles component
  Today: Wire API integration
  Blockers: Need backend endpoints deployed

SCRUM MASTER:
  → Actions from yesterday?
  → Risks? Timeline ok?
  → Any escalations?
```

### Weekly Demo (Friday 15h)
```
Show running feature
Ask feedback
Adjust roadmap si besoin
Celebrate successes!
```

---

## 🎓 KNOWLEDGE SHARING

### Pairing Sessions
```
☐ Week 1: Backend dev pair on Models/Migrations
☐ Week 2: Frontend dev pair on API integration
☐ Week 3: Full team architecture review
☐ Week 4: Database performance review
```

### Documentation
```
☐ Architecture Decision Record (ADR)
  Why we chose Salles over other approach
  
☐ API Documentation (Postman/Swagger)
  All 23 new endpoints documented
  
☐ Database Diagram
  ER diagram of new tables + relations
  
☐ Frontend Component Library
  Storybook or simple docs
```

---

## ✨ SUCCESS CRITERIA

### End of Week 6 (P1 Complete)
```
✓ 9 migrations applied, no rollbacks
✓ 5 new models + full test coverage
✓ 15+ API endpoints documented
✓ 30+ React components styled
✓ 3 PDFs generatable (presences, rapports)
✓ 0 critical bugs
✓ 100% uptime in dev/staging
✓ Team competent on new architecture
✓ Smooth handoff to P2 team
```

---

## 🚀 GO/NO-GO

### Ready to Launch SEMAINE 1 IF:
```
☐ Équipe formée et assignée
☐ Environnement prêt (DB, mail, git)
☐ Roadmap validée avec client
☐ Tous les outils installés
☐ Kickoff meeting fait
☐ Paires de programmeurs désignées
☐ Definition of Done convenue
```

### Abort SEMAINE 1 IF:
```
⚠️ Équipe indisponible ou incompétente
⚠️ Environnement cassé (DB errors, migrations fail)
⚠️ Client change d'avis/scope
⚠️ Infrastructure not ready (SMTP, queues)
⚠️ Major blockers identifiés
```

---

## 📋 FINAL CHECKLIST BEFORE START

```
Governance:
  ☐ Approvals: Client ✓, Management ✓, Team ✓
  ☐ Budget: Approuvé
  ☐ Timeline: Convenue (9 semaines)
  
People:
  ☐ Roles assignés
  ☐ Skills validated
  ☐ Availability 100% pour 6 weeks
  
Process:
  ☐ Agile/Scrum cadence définie
  ☐ Standups: Daily 10h
  ☐ Reviews: Friday 15h
  ☐ Retros: Friday 16h
  
Technology:
  ☐ Environments: Dev, Staging, Prod ready
  ☐ Tools: Git, CI/CD, Postman, DB tools
  ☐ Dependencies: Installed (composer, npm)
  ☐ Database: Backup taken
  
Documentation:
  ☐ Architecture docs written
  ☐ API contracts signed
  ☐ Definition of Done agreed
  ☐ Escalation paths defined
  
Quality:
  ☐ Testing strategy agreed
  ☐ Code review process ready
  ☐ Deployment checklist prepared
  ☐ Rollback procedure documented
```

**IF ALL CHECKED: 🚀 YOU ARE READY TO START!**

---

**Imprimez cette checklist et affiche-la dans le bureau!**

*Version: 1.0 | Date: 25 février 2026*
