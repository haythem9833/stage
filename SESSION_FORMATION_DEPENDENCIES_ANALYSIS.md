# SessionFormation Model - Complete Dependency Analysis
**Generated:** March 3, 2026  
**Project:** CNI Gestion de Formations  
**Status:** Comprehensive Inventory Complete

---

## 1. DATABASE TABLES & MIGRATIONS

### 1.1 Core Table: `session_formations`
**Location:** [backend/database/migrations/2026_01_18_143736_create_session_formations_table.php](backend/database/migrations/2026_01_18_143736_create_session_formations_table.php)

**Table Structure:**
```sql
CREATE TABLE session_formations (
    id (PK)
    formation_id (FK → formations) [CASCADE DELETE]
    titre VARCHAR
    description TEXT (nullable)
    date_debut DATE
    date_fin DATE
    lieu VARCHAR (nullable)
    nombre_places INT (default: 25)
    statut ENUM('planifiee', 'en_cours', 'validee', 'annulee') (default: 'planifiee')
    timestamps (created_at, updated_at)
)
```

**Related Migrations:**
- [2026_01_29_000002_make_session_formation_id_nullable.php](backend/database/migrations/2026_01_29_000002_make_session_formation_id_nullable.php) - Made `session_formation_id` nullable in inscriptions
- [2026_01_29_000003_add_auto_session_and_evaluations.php](backend/database/migrations/2026_01_29_000003_add_auto_session_and_evaluations.php) - Added `auto_created` column to sessions

### 1.2 Related Tables with Foreign Keys

| Table | Column | References | Constraint | Purpose |
|-------|--------|-----------|-----------|---------|
| `inscriptions` | `session_formation_id` | `session_formations.id` | CASCADE DELETE | Links enrollments to sessions |
| `certificats` | `session_formation_id` | `session_formations.id` | CASCADE DELETE | Links certificates to sessions |
| `presences` | `session_id` | `session_formations.id` | CASCADE DELETE | Links attendance records to sessions |

**Location:** [backend/database/migrations/2026_02_25_000006_create_presences_table.php](backend/database/migrations/2026_02_25_000006_create_presences_table.php)

---

## 2. MODELS & RELATIONSHIPS

### 2.1 Core Model: SessionFormation
**Location:** [backend/app/Models/SessionFormation.php](backend/app/Models/SessionFormation.php)

**Relationships:**
```php
- formation() : BelongsTo     // Parent Formation
- inscriptions() : HasMany     // Student enrollments
- certificats() : HasMany      // Generated certificates
- inscriptionsAcceptees()      // Filtered scope
```

**Key Methods:**
| Method | Purpose | Returns | Status |
|--------|---------|---------|--------|
| `validerAutomatiquement()` | Auto-validate if ≥17 inscriptions | void | ⚠️ **Missing method reference** |
| `isValidee()` | Check if session is validated | bool | ✓ |
| `isTerminee()` | Check if session is terminated | bool | ✓ |
| `inscriptionsActives()` | Count active enrollments | Collection | ✓ |

**⚠️ Issue Found:** The model calls `inscriptionsActives()` in `validerAutomatiquement()` (line 73) but this method is NOT defined in the model. It's only used in `InscriptionService`.

### 2.2 Related Models

**Formation Model:** [backend/app/Models/Formation.php](backend/app/Models/Formation.php)
- Relationship: `sessions() : HasMany` → SessionFormation

**Inscription Model:** [backend/app/Models/Inscription.php](backend/app/Models/Inscription.php)
- Relationship: `sessionFormation() : BelongsTo` (legacy alias)
- **Note:** Changed to link via `formation_id` instead of direct session reference
- Column: `session_formation_id` (was used, now nullable)

**Certificat Model:** [backend/app/Models/Certificat.php](backend/app/Models/Certificat.php)
- Relationship: `session() : BelongsTo` → SessionFormation
- Fillable: `session_formation_id`

**Presence Model:** [backend/app/Models/Presence.php](backend/app/Models/Presence.php)
- Relationship: `session() : BelongsTo` → SessionFormation
- Fields: `session_id`, `inscription_id`, `date_session`, `statut`
- Static Method: `tauxPresence($inscriptionId, $sessionId)` - Calculate attendance rate

---

## 3. CONTROLLERS & BUSINESS LOGIC

### 3.1 SessionController (Main Session Manager)
**Location:** [backend/app/Http/Controllers/SessionController.php](backend/app/Http/Controllers/SessionController.php)

**Key Methods & Responsibilities:**

| Method | Endpoint | Action | Authorization |
|--------|----------|--------|-----------------|
| `index()` | GET /api/sessions | List all sessions | Public |
| `show($id)` | GET /api/sessions/{id} | Get single session | Public |
| `store()` | POST /api/sessions | Create new session | admin, formateur |
| `update()` | PUT /api/sessions/{id} | Update session | admin, formateur |
| `destroy()` | DELETE /api/sessions/{id} | Delete session | admin only |
| `valider()` | POST /api/sessions/{id}/validate | Mark as validated | admin, formateur |
| `terminer()` | POST /api/sessions/{id}/terminate | Mark as completed | admin, formateur |
| `mesSessions()` | GET /api/formateur/sessions | Get trainer's sessions | formateur |
| `getSessionsAwaitingApproval()` | GET /api/sessions/awaiting-approval | Sessions pending trainer approval (2+ inscriptions) | formateur |
| `approveSession()` | POST /api/sessions/{id}/approve | Trainer approves pending session | formateur |
| `rejectSession()` | POST /api/sessions/{id}/reject | Trainer rejects pending session | formateur |

### 3.2 PresenceController (Attendance Management)
**Location:** [backend/app/Http/Controllers/Api/PresenceController.php](backend/app/Http/Controllers/Api/PresenceController.php)

**Key Methods:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `batch()` | POST /api/sessions/{id}/presences/batch | Record multiple attendances for a session date |
| `index()` | GET /api/sessions/{id}/presences | Get all attendance records for session |
| `synthese()` | GET /api/sessions/{id}/presences/synthese | Get attendance summary |
| `feuillePresence()` | GET /api/sessions/{id}/feuille-presence | Get or generate attendance sheet (JSON/PDF) |
| `tauxPresenceEtudiant()` | GET /api/etudiants/{id}/taux-presence | Calculate student attendance rate for session |

**Dependencies:** SessionFormation (eager loaded), Presence model, PresenceService

### 3.3 ReportController (Session Analytics)
**Location:** [backend/app/Http/Controllers/Api/ReportController.php](backend/app/Http/Controllers/Api/ReportController.php)

**Key Methods for Sessions:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `exportPresencesCSV()` | GET /api/rapports/presences/export-csv | Export attendance as CSV |
| `exportInscriptionsCSV()` | GET /api/rapports/inscriptions/export-csv | Export enrollments (filtered by session) |
| `getSessionBilan()` | GET /api/rapports/bilan-session/{id} | Generate complete session report |

**Parameters:** `session_id` query parameter filters by session

### 3.4 DashboardController (Analytics)
**Location:** [backend/app/Http/Controllers/Api/DashboardController.php](backend/app/Http/Controllers/Api/DashboardController.php)

**Session-related Metrics:**
- `SessionFormation::count()` - Total sessions
- `SessionFormation::where('statut', 'validee')->count()` - Validated sessions
- `SessionFormation::where('statut', 'en_attente')->count()` - Pending sessions
- Presence statistics by session

---

## 4. SERVICES & BUSINESS LOGIC

### 4.1 SessionService
**Location:** [backend/app/Services/SessionService.php](backend/app/Services/SessionService.php)

**Public Methods:**

```php
public function creer(array $data): SessionFormation
public function mettreAJour(SessionFormation $session, array $data): SessionFormation
public function toutes(): Collection
public function getParFormation(int $formationId): Collection
public function getById(int $id): SessionFormation
public function supprimer(SessionFormation $session): void
public function terminer(SessionFormation $session): SessionFormation
public function valider(SessionFormation $session): SessionFormation
```

### 4.2 PresenceService
**Location:** [backend/app/Services/PresenceService.php](backend/app/Services/PresenceService.php)

**Public Methods:**

```php
public function getTauxPresence(int $inscriptionId, int $sessionId): float
public function getFeuillePresence(int $sessionId): array
public function marquerPresences(int $sessionId, Carbon $dateSession, array $presences): array
public function genererPdfPresence(int $sessionId, Carbon $dateDebut, Carbon $dateFin): string
public function getSynthesePresences(int $sessionId): array
```

**Dependencies:** SessionFormation, Presence, Inscription, PDF generator

### 4.3 InscriptionService
**Location:** [backend/app/Services/InscriptionService.php](backend/app/Services/InscriptionService.php)

**Session-related Methods:**

```php
public function inscrire(int $etudiantId, int $sessionId): Inscription
  - Uses: SessionFormation::findOrFail($sessionId)
  - Calls: $session->inscriptionsActives()->count()
  - Calls: $session->validerAutomatiquement()
  - Reference: session_formation_id foreign key

public function getInscriptionsSession(int $sessionId): Collection
  - Filters inscriptions WHERE session_formation_id = $sessionId
```

### 4.4 CertificatService
**Location:** [backend/app/Services/CertificatService.php](backend/app/Services/CertificatService.php)

**Session-related Methods:**

```php
public function genererCertificat(int $inscriptionId): Certificat
  - Validates session is validated: $session->isValidee()
  - Validates session is completed: $session->isTerminee()
  - Uses: session_formation_id for certificate storage

public function getCertificatsSession(int $sessionId): Collection
  - WHERE session_formation_id = $sessionId
```

### 4.5 ReportService
**Location:** [backend/app/Services/ReportService.php](backend/app/Services/ReportService.php)

**Session-related Methods:**

```php
public function generatePresencesCSV($sessionId)
public function generateInscriptionsCSV($sessionId = null)
public function generateSessionBilan(int $sessionId): array
```

---

## 5. API ROUTES

### 5.1 Session Routes
**Location:** [backend/routes/api.php](backend/routes/api.php) (lines 44-55)

```
PUBLIC:
  GET    /api/sessions                    [SessionController@index]
  GET    /api/sessions/{id}               [SessionController@show]

ADMIN/FORMATEUR:
  POST   /api/sessions                    [SessionController@store]
  PUT    /api/sessions/{id}               [SessionController@update]
  POST   /api/sessions/{id}/validate      [SessionController@valider]
  POST   /api/sessions/{id}/terminate     [SessionController@terminer]

ADMIN ONLY:
  DELETE /api/sessions/{id}               [SessionController@destroy]

FORMATEUR APPROVAL WORKFLOW:
  GET    /api/sessions/awaiting-approval  [SessionController@getSessionsAwaitingApproval]
  POST   /api/sessions/{id}/approve       [SessionController@approveSession]
  POST   /api/sessions/{id}/reject        [SessionController@rejectSession]

TRAINER ACCESS:
  GET    /api/formateur/sessions          [SessionController@mesSessions]
```

### 5.2 Presence Routes
```
GET    /api/sessions/{id}/presences
GET    /api/sessions/{id}/presences/synthese
GET    /api/sessions/{id}/feuille-presence
POST   /api/sessions/{id}/presences/batch
GET    /api/etudiants/{id}/taux-presence
```

### 5.3 Report Routes (Session-related)
```
GET    /api/rapports/presences/export-csv?session_id={id}
GET    /api/rapports/inscriptions/export-csv?session_id={id}
GET    /api/rapports/bilan-session/{id}
```

---

## 6. FRONTEND PAGES & COMPONENTS

### 6.1 Formateur (Trainer) Pages

**[frontend/pages/formateur/presences.js](frontend/pages/formateur/presences.js)**
- **Purpose:** Manage and record student attendance for sessions
- **Functions Used:**
  - `getSessions()` - Load all trainer's sessions
  - `getPresences(sessionId)` - Get attendance records
  - `getPresenceSynthese(sessionId)` - Get summary
  - `batchRecordPresences(sessionId, data)` - Record attendance batch
- **Features:**
  - Session selector dropdown
  - Attendance date selection
  - Batch presence marking (present/absent/late/justified)
  - Attendance rate display

**[frontend/pages/formateur/session-approvals.js](frontend/pages/formateur/session-approvals.js)**
- **Purpose:** Approve or reject pending sessions
- **Functions Used:**
  - `api.get("/sessions/awaiting-approval")` - Load pending sessions
  - `api.post("/sessions/{id}/approve")` - Approve session
  - `api.post("/sessions/{id}/reject")` - Reject session
- **Trigger:** Appears when formation has 2+ valid enrollments
- **Features:**
  - Display pending sessions for approval
  - Count inscriptions per session
  - Approve/Reject buttons with loading states
  - Error handling

**[frontend/pages/formateur/formations.js](frontend/pages/formateur/formations.js)**
- Session management within formation context
- Create/Edit/Delete sessions
- View session details

**[frontend/pages/formateur/planning.js](frontend/pages/formateur/planning.js)**
- Manage session availability slots
- Schedule coordination for sessions

**[frontend/pages/formateur/certificats.js](frontend/pages/formateur/certificats.js)**
- Generate and manage certificates for completed sessions

### 6.2 Admin Pages

**[frontend/pages/admin/rapports.js](frontend/pages/admin/rapports.js)**
- **Purpose:** Generate comprehensive reports filtered by session
- **Features:**
  - Session selector dropdown
  - Session-based report generation
  - Filters: Attendance, Enrollments, Evaluations
  - Export CSV by session
  - Session summary/bilan report
- **Functions Used:**
  - `getSessions()` - Load all sessions
  - `getSessionBilan(sessionId)` - Get session report
  - `exportPresencesCSV(sessionId)` - Export attendance
  - `exportInscriptionsCSV(sessionId)` - Export enrollments

**[frontend/pages/admin/formations.js](frontend/pages/admin/formations.js)**
- Manage all sessions across formations
- CRUD operations on sessions
- View session statistics

**[frontend/pages/admin/dashboard-v2.js](frontend/pages/admin/dashboard-v2.js)**
- Display session metrics and KPIs
- Presence statistics

**[frontend/pages/admin/inscriptions.js](frontend/pages/admin/inscriptions.js)**
- Filter and manage enrollments by session

**[frontend/pages/admin/certificats.js](frontend/pages/admin/certificats.js)**
- Manage certificates tied to sessions

### 6.3 Student Pages

**[frontend/pages/profil.js](frontend/pages/profil.js)**
- **Session Display:** Active session information
- Shows current session context

**[frontend/pages/index.js](frontend/pages/index.js)**
- Homepage feature highlight: "Gestion de Sessions"

---

## 7. FRONTEND API SERVICE

**Location:** [frontend/services/api.js](frontend/services/api.js)

**Session Endpoints:**
```javascript
// Basic CRUD
export const getSessions = () => api.get("/sessions")
export const getSession = (id) => api.get(`/sessions/${id}`)
export const createSession = (data) => api.post("/sessions", data)
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data)
export const deleteSession = (id) => api.delete(`/sessions/${id}`)

// Lifecycle
export const validateSession = (id) => api.post(`/sessions/${id}/validate`)
export const terminateSession = (id) => api.post(`/sessions/${id}/terminate`)

// Trainer Access
export const getFormationsSessions = () => api.get("/formateur/sessions")

// Presence Management
export const getPresences = (sessionId) => api.get(`/sessions/${sessionId}/presences`)
export const batchRecordPresences = (sessionId, data) => 
  api.post(`/sessions/${sessionId}/presences/batch`, data)
export const getPresenceSynthese = (sessionId) => 
  api.get(`/presences/synthese/${sessionId}`)

// Reports
export const exportPresencesCSV = (sessionId) => 
  api.get(`/rapports/presences/export-csv?session_id=${sessionId}`)
export const exportInscriptionsCSV = (sessionId = null) => 
  api.get(`/rapports/inscriptions/export-csv${sessionId ? `?session_id=${sessionId}` : ""}`)
export const getSessionBilan = (id) => api.get(`/rapports/bilan-session/${id}`)
```

---

## 8. SESSION LIFECYCLE & STATUS FLOW

### 8.1 Session Status Values
```
Created:    'planifiee'    (initial state)
Running:    'en_cours'     (during training)
Validated:  'validee'      (approved by admin/trainer)
Terminated: 'terminee'     (training complete)
Cancelled:  'annulee'      (not conducted)
```

### 8.2 Session States Specific to Trainer Approval
```
'en_attente' - Pending trainer approval (appears in awaiting-approval endpoint)
'valide'     - Approved by trainer or admin
```

**⚠️ Inconsistency Found:** Mixed use of status values - code uses both 'valide' and 'validee', 'en_attente' for pending sessions

### 8.3 Approval Workflow
1. **Create** - Trainer/Admin creates session (`statut: 'en_attente'`)
2. **Check** - System auto-checks for 2+ valid enrollments
3. **Await Approval** - If 2+ enrollments, appears in `getSessionsAwaitingApproval()`
4. **Approve/Reject** - Trainer approves (`statut: 'valide'`) or rejects (deleted)
5. **Validate** - Can be validated manually via `/validate` endpoint
6. **Terminate** - Mark as complete via `/terminate` endpoint

---

## 9. KEY METHODS REQUIRING REFACTORING

### 9.1 Missing Method Definition
**Location:** [backend/app/Models/SessionFormation.php](backend/app/Models/SessionFormation.php#L73)

```php
// Line 73: Called but NOT defined in model
$nombreInscriptions = $this->inscriptionsActives()->count();

// Fix: Add method to SessionFormation model
public function inscriptionsActives(): HasMany
{
    return $this->inscriptions()->where('statut', '!=', 'abandonnee');
}
```

### 9.2 Inconsistent Method References
**Issue:** InscriptionService uses `session_formation_id` foreign key but:
- Inscription model has `formation_id` as primary relationship
- `sessionFormation()` in Inscription is now a legacy alias pointing to Formation

**Required Changes:**
```php
// Current (InscriptionService.php line 23):
Inscription::where('etudiant_id', $etudiantId)
    ->where('session_formation_id', $sessionId)  // ⚠️ May not work

// Should be:
Inscription::where('etudiant_id', $etudiantId)
    ->where('formation_id', $formation->id)
    // OR refactor to use proper session relationship
```

### 9.3 Status Value Inconsistencies
**Locations:** SessionController, SessionFormation migrations

**Inconsistencies:**
- Migration defines: `['planifiee', 'en_cours', 'validee', 'annulee']`
- Controller uses: `'en_attente'`, `'valide'`, `'terminee'`

**Requires:** Standardize status values across codebase

### 9.4 Auto-Validation Logic
**Location:** [backend/app/Models/SessionFormation.php](backend/app/Models/SessionFormation.php#L69-75)

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

**Issues:**
- Hard-coded minimum 17 enrollments (no configuration)
- Called from InscriptionService but logic is in Model
- Should use proper query builder instead of undefined method

---

## 10. COMPLETE DEPENDENCY GRAPH

### 10.1 Direct Dependencies on SessionFormation

```
SessionFormation
    ↓ (belongsTo)
    Formation
    ↓ (hasMany)
    Inscription
    ↓ (foreign key)
    Certificat
    Presence
    
SessionFormation
    ↓ (controllers)
    SessionController
    PresenceController
    ReportController
    DashboardController
    InscriptionController
    
SessionFormation
    ↓ (services)
    SessionService
    PresenceService
    InscriptionService
    CertificatService
    ReportService
    
SessionFormation
    ↓ (frontend)
    presences.js
    session-approvals.js
    rapports.js
    formations.js
    dashboard-v2.js
    planning.js
    certificats.js
```

### 10.2 Cross-Model Dependencies

**Formation → SessionFormation**
- Sessions created per formation
- Trainer sees only own formation's sessions

**Inscription → SessionFormation** (Deprecated but active)
- `session_formation_id` foreign key still in use
- Being migrated to `formation_id`

**Presence → SessionFormation**
- Attendance records tied to session
- Session ID used for filtering

**Certificat → SessionFormation**
- Generated after session completion
- Session must be validated and terminated

---

## 11. CRITICAL FILES TO MIGRATE/REFACTOR

### Phase 1: Core Model Fixes
- [ ] Add missing `inscriptionsActives()` method to SessionFormation
- [ ] Fix InscriptionService session relationship references
- [ ] Standardize status values across all files
- [ ] Configure auto-validation threshold (17 enrollments)

### Phase 2: Inscription Refactoring
- [ ] Complete migration from `session_formation_id` to `formation_id`
- [ ] Update InscriptionService to use formation relationship
- [ ] Remove legacy `sessionFormation()` alias from Inscription model

### Phase 3: Controller Updates
- [ ] Update SessionController to use consistent status values
- [ ] Add validation rules for session creation/update
- [ ] Improve error handling and logging

### Phase 4: Frontend Integration
- [ ] Update all API calls to handle new status values
- [ ] Refactor presence management component
- [ ] Update session approval workflow UI
- [ ] Fix report generation filters

### Phase 5: Testing
- [ ] Unit tests for SessionService methods
- [ ] Integration tests for session creation/approval workflow
- [ ] API endpoint tests
- [ ] Frontend component tests

---

## 12. SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| **Models** | 6 (SessionFormation, Formation, Inscription, Certificat, Presence, User) |
| **Controllers** | 4 (SessionController, PresenceController, ReportController, DashboardController) |
| **Services** | 5 (SessionService, PresenceService, InscriptionService, CertificatService, ReportService) |
| **API Routes** | 18 session-specific endpoints |
| **Migrations** | 4 session-related migrations |
| **Frontend Pages** | 8 pages with session management |
| **API Functions** | 20+ frontend API wrapper functions |
| **Database Relationships** | 3 foreign key constraints (inscriptions, certificats, presences) |
| **Cascading Deletes** | 3 (when session deleted) |

---

## 13. KNOWN ISSUES & WARNINGS

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| Undefined `inscriptionsActives()` method | 🔴 Critical | SessionFormation.php:73 | Runtime error when auto-validating |
| Inconsistent status values | 🔴 Critical | Multiple files | Logic errors in filtering |
| Legacy `sessionFormation()` alias | 🟡 High | Inscription.php | Confusion in relationships |
| Hard-coded auto-validation threshold | 🟡 High | SessionFormation.php | Not configurable per formation |
| Missing relationship in InscriptionService | 🟡 High | InscriptionService.php | May fail with session queries |

---

## 14. ADDITIONAL NOTES

### Auto-Created Sessions
- Migrations include `auto_created` column in session_formations table
- Indicates system auto-generates sessions under certain conditions
- Used with Evaluation phase system

### Trainer Approval System
- Unique workflow: sessions wait for trainer approval when 2+ valid enrollments
- Different from standard admin workflow
- Prevents auto-creation of sessions with insufficient participants

### Presence Tracking
- Complete attendance system with multiple statuses (present/absent/late/justified)
- Integrated with certificates generation
- Can export as CSV or PDF

### Status Validation Chain
1. Enrollment → Inscription (status: 'acceptee', 'validee', 'abandonnee')
2. Session → SessionFormation (status changes based on enrollment count)
3. Certificate → Generated only after session completion
4. Presence → Recorded throughout session duration

