# CNI Training Management (CNI Gestion Formations)

![PHP](https://img.shields.io/badge/PHP-%5E8.2-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)
<!-- Placeholder for CI/CD badge: To be completed (no continuous integration pipeline currently configured in the repository) -->
<!-- Placeholder for Test Coverage badge: To be completed (requires setting up test coverage reporting) -->

---

## 1. Short Description

**CNI Training Management** is a full-stack web application designed for the complete lifecycle management of professional training courses. The platform centralizes both administrative and pedagogical tasks: publishing courses, student registrations, role-based access control (RBAC), dynamic attendance tracking (including automated attendance rate calculation and PDF sign-in sheet generation), secure PDF certificate generation, and analytical dashboards with CSV report exports.

The architecture relies on a RESTful API powered by **Laravel 12** and a responsive user interface built with **Next.js 16** and **Tailwind CSS**.

---

## 2. Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Token-based API Authentication** using Laravel Sanctum.
- **Three distinct roles**: Administrator (`admin`), Instructor (`formateur`), Student (`etudiant`).
- **Role elevation approval flow**: Any registration requesting elevated privileges (`formateur` or `admin`) defaults to the `etudiant` role with `pending` status, requiring administrator approval (`/api/admin/role-requests`).
- **Access protection**: Brute-force protection on authentication (rate-limited to 5 attempts per minute via `RateLimiter`).

### 📚 Course Management (v2 Architecture)
- Direct integration of sessions into courses: each training course holds its schedule (`date_debut`, `date_fin`), total duration (`duree`), location, seat capacity, and assigned instructor.
- Operational launch (`POST /api/formations/{id}/start`): sets the status to `en_cours` and activates attendance tracking.
- Batch course completion (`POST /api/formations/{id}/complete-all`): marks all enrollments as completed and triggers mass certificate generation.

### 📝 Student Registrations & Enrollments
- Direct enrollment for authenticated students to open training courses.
- Personalized registration and history overview (`GET /api/my-inscriptions`).
- Registration validation, cancellation, and status updates handled by administrators and instructors.

### 📋 Attendance & Sign-in Management
- Batch attendance logging by date (`present`, `absent`, `retard`, `justifie`).
- Automatic activation of attendance logging as soon as the start date is reached (`date_debut <= today`).
- Course attendance summaries and automated student attendance rate computation (`GET /api/etudiants/{id}/taux-presence`).
- Absence justification and record corrections with audit trail.
- Generation of printable official sign-in sheets in PDF format (`GET /api/formations/{id}/presences/feuille-presence`).

### 🎓 PDF Certificates
- Automated generation with standardized unique certificate IDs (`CERT-XXXXXXXX`).
- High-fidelity PDF rendering via the **DomPDF** engine.
- Secure certificate downloads for graduated students (`GET /api/certificats/{id}/download`).

### 📊 Dashboards & Reporting
- **Administrator Dashboard**: System-wide metrics, user distribution by role, pending role requests, and attendance statistics.
- **Instructor Dashboard**: Overview of assigned courses, attendee presence logging, and issued certificates.
- **Student Dashboard**: Available course directory, active enrollments, and earned certificates.
- **Reporting Module**: Data export for attendance, courses, and registrations in CSV format (`GET /api/rapports/*/export-csv`).

---

## 3. Screenshots or Demo

The web interface is accessible on local port `3000` once the frontend development server is running.

```
[Screenshot Placeholder: Administrator Dashboard - Statistics & User Management]
./docs/screenshots/admin-dashboard.png

[Screenshot Placeholder: Attendance Logging & Sign-in Sheet - Instructor Workspace]
./docs/screenshots/formateur-presences.png

[Screenshot Placeholder: Course Catalog & Registration - Student Workspace]
./docs/screenshots/etudiant-formations.png

[Screenshot Placeholder: Sample Generated Completion Certificate (PDF)]
./docs/screenshots/certificat-pdf-sample.png
```

---

## 4. Prerequisites

Ensure your development environment meets the following requirements before installation:

- **PHP**: version `>= 8.2` with extensions `pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, and `pdo_sqlite` (for local development) or `pdo_mysql` (for production).
- **Composer**: version `>= 2.2`.
- **Node.js**: version `>= 20.x` (required for Next.js 16 and React 19).
- **npm** (included with Node.js) or **pnpm** / **yarn**.
- **Database Engine**: SQLite (default in local development) or MySQL `>= 8.0`.

---

## 7. Installation

### 1. Clone the repository

```bash
git clone https://github.com/haythem9833/stage.git
cd stage
```

### 2. Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Create environment configuration file
# On Linux / macOS:
cp .env.example .env
# On Windows (PowerShell):
copy .env.example .env

# Generate application encryption key
php artisan key:generate

# Initialize the SQLite database file (if using SQLite)
# On Linux / macOS:
touch database/database.sqlite
# On Windows (PowerShell):
New-Item -ItemType File -Path database\database.sqlite -Force

# Run migrations and seed default test data
php artisan migrate --seed
```

### 3. Frontend Setup (Next.js)

```bash
cd ../frontend

# Install Node.js dependencies
npm install
```

---

## 8. Configuration / Environment Variables

### Backend (`./backend/.env`)

Core configuration parameters defined in `./backend/.env.example`:

| Variable | Description | Default / Example Value |
|---|---|---|
| `APP_NAME` | Application instance name | `Laravel` (or `CNI_Gestion_Formations`) |
| `APP_ENV` | Application environment | `local` |
| `APP_KEY` | Secret encryption key | *Generated via `php artisan key:generate`* |
| `APP_DEBUG` | Debug mode toggle | `true` |
| `APP_URL` | Base backend URL | `http://localhost:8000` |
| `DB_CONNECTION` | Database driver | `sqlite` (or `mysql`) |
| `DB_HOST` | Database host (if MySQL) | `127.0.0.1` |
| `DB_PORT` | Database port (if MySQL) | `3306` |
| `DB_DATABASE` | Database name or absolute path | `database/database.sqlite` |
| `DB_USERNAME` | Database username (if MySQL) | `root` |
| `DB_PASSWORD` | Database password (if MySQL) | `null` |
| `SESSION_DRIVER` | Session storage driver | `database` |
| `QUEUE_CONNECTION`| Asynchronous queue driver | `database` |
| `MAIL_MAILER` | Mail transfer agent | `log` (or `smtp`) |

### Frontend (`./frontend/.env.local`)

The HTTP client service (`./frontend/services/api.js`) relies on the following environment variable:

| Variable | Description | Default Fallback Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API endpoints | `http://127.0.0.1:8000/api` |

To override this setting, create a `./frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 9. Running the Project

To run the complete application in a local development environment, start both servers in separate terminal sessions:

### Terminal 1: Backend (Laravel API)

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```
The REST API will be accessible at: `http://127.0.0.1:8000/api`.

### Terminal 2: Frontend (Next.js UI)

```bash
cd frontend
npm run dev
```
The web application will be accessible at: `http://localhost:3000`.

---

## 10. Usage

### Pre-configured Seed Accounts

The initial database seeder (`./backend/database/seeders/DatabaseSeeder.php`) provisions the following test accounts:

| Role | Email | Password | System Role |
|---|---|---|---|
| **Administrator** | `admin@cni.fr` | `Password-123` | `admin` |
| **Instructor 1** | `formateur1@cni.fr` | `password123` | `formateur` |
| **Instructor 2** | `formateur2@cni.fr` | `password123` | `formateur` |
| **Students (20 accounts)** | `etudiant1@cni.fr` to `etudiant20@cni.fr` | `password123` | `etudiant` |

### Typical Workflow

1. **Authentication**: Go to `http://localhost:3000/auth/login` and log in with your credentials.
2. **Administration**: Access `/admin/dashboard` or `/admin/dashboard-v2` to manage users, assign instructors, and approve role upgrade requests.
3. **Training & Attendance**: The instructor navigates to `/formateur/formations`, starts the course (`Démarrer`), and records daily attendance at `/formateur/presences`.
4. **Completion & Certificates**: Once the course concludes, the instructor or administrator finalizes the training (`Clôturer tous`), which generates PDF certificates available for download in the student's space at `/etudiant/certificats`.

---

### REST API Reference

All protected endpoints require the following HTTP header: `Authorization: Bearer <your_token>`.

#### 1. Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/register` | Public | Register a new user |
| `POST` | `/api/login` | Public | Authenticate user and issue API token |
| `POST` | `/api/logout` | Authenticated | Revoke current user token |
| `GET` | `/api/profile` | Authenticated | Fetch current user profile |
| `POST` | `/api/change-password` | Authenticated | Update user password |

#### 2. Courses (Formations)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/formations` | Authenticated | List all available training courses |
| `GET` | `/api/formations/{id}` | Authenticated | Retrieve details of a specific course |
| `POST` | `/api/formations` | Admin, Formateur | Create a new course |
| `PUT` | `/api/formations/{id}` | Admin, Formateur | Update an existing course |
| `POST` | `/api/formations/{id}/start` | Admin, Formateur | Officially start course and activate attendance |
| `POST` | `/api/formations/{id}/complete-all`| Admin, Formateur | Batch complete course and issue certificates |
| `DELETE`| `/api/formations/{id}` | Admin, Formateur | Delete a course |

#### 3. Registrations (Inscriptions)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/my-inscriptions` | Etudiant | List registrations of current student |
| `POST` | `/api/inscriptions` | Etudiant | Register for a training course |
| `GET` | `/api/inscriptions` | Admin | List all registrations system-wide |
| `POST` | `/api/inscriptions/{id}/validate` | Admin, Formateur | Manually approve a registration |
| `POST` | `/api/inscriptions/{id}/cancel` | Admin, Etudiant | Cancel an existing registration |

#### 4. Attendance & Sign-in (Présences)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/formations/{id}/presences` | Admin, Formateur | Fetch attendance register for a course |
| `POST` | `/api/formations/{id}/presences/batch` | Admin, Formateur | Batch record attendance by date |
| `GET` | `/api/formations/{id}/presences/synthese` | Admin, Formateur | Course attendance summary |
| `GET` | `/api/formations/{id}/presences/feuille-presence` | Admin, Formateur | Generate printable attendance PDF |
| `PUT` | `/api/presences/{id}/justifier` | Admin, Formateur | Record an absence justification |
| `GET` | `/api/etudiants/{id}/taux-presence` | Authenticated | Get student attendance percentage |

#### 5. Certificates & Reports

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/my-certificats` | Etudiant | List certificates belonging to current student |
| `GET` | `/api/certificats/{id}/download` | Admin, Etudiant | Download certificate PDF |
| `GET` | `/api/admin/dashboard-v2/stats` | Admin | Fetch consolidated v2 dashboard metrics |
| `GET` | `/api/rapports/presences/export-csv` | Admin, Formateur | Export attendance records to CSV |
| `GET` | `/api/rapports/formations/export-csv` | Admin | Export course catalog to CSV |

---

### Request Examples

#### Login (`POST /api/login`)

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cni.fr",
    "password": "Password-123"
  }'
```

**Expected Response (`200 OK`):**

```json
{
  "message": "Connexion réussie",
  "token": "1|qF7x8K9mP2...",
  "user": {
    "id": 1,
    "nom": "Admin",
    "prenom": "CNI",
    "email": "admin@cni.fr",
    "role": "admin"
  }
}
```

#### Batch Attendance Logging (`POST /api/formations/{id}/presences/batch`)

```bash
curl -X POST http://localhost:8000/api/formations/1/presences/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|qF7x8K9mP2..." \
  -d '{
    "date": "2026-03-10",
    "presences": [
      { "inscription_id": 1, "statut": "present" },
      { "inscription_id": 2, "statut": "retard" },
      { "inscription_id": 3, "statut": "absent" }
    ]
  }'
```

#### Certificate PDF Download (`GET /api/certificats/{id}/download`)

```bash
curl -X GET http://localhost:8000/api/certificats/1/download \
  -H "Authorization: Bearer 1|qF7x8K9mP2..." \
  --output certificate.pdf
```

---

## 11. Tests

### Backend Tests

The backend uses the Laravel-integrated **PHPUnit** testing suite.

```bash
cd backend

# Run the complete test suite
php artisan test

# Run unit tests only
php artisan test --testsuite=Unit

# Run feature tests only
php artisan test --testsuite=Feature
```

Additional integration verification scripts are provided in `./backend/`:

```bash
# Validate API route registrations
php test_routes.php

# Run attendance API validation scripts
./test_api_presence.sh        # On Linux / macOS
.\test_api_presence.ps1       # On Windows PowerShell
```

### Frontend Tests

Static code analysis and linting are handled via ESLint:

```bash
cd frontend

# Run linting check
npm run lint
```

*(Note: Automated unit or E2E testing frameworks such as Jest or Playwright are not currently configured in `frontend/package.json`).*

---

## 12. Project Structure

```
stage/
├── backend/                              # Laravel 12 API Application
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/                     # Specialized controllers (Presence, Report, DashboardV2)
│   │   │   ├── AuthController.php       # Authentication & Sanctum handling
│   │   │   ├── CertificatController.php # PDF certificate generation & downloads
│   │   │   ├── FormationController.php  # Training course lifecycle
│   │   │   └── InscriptionController.php# Registration workflows
│   │   ├── Models/                      # Eloquent models (User, Formation, Presence, etc.)
│   │   └── Services/                    # Business logic (PresenceService, ReportService, etc.)
│   ├── config/                          # Application and package configurations
│   ├── database/
│   │   ├── factories/                   # Model factories for testing
│   │   ├── migrations/                  # 18 database schema migrations
│   │   └── seeders/                     # Test data and seed accounts
│   ├── resources/views/                 # Blade templates for PDF rendering
│   │   ├── certificats/                 # HTML templates for certificates
│   │   └── presences/                   # HTML templates for sign-in sheets
│   ├── routes/
│   │   └── api.php                      # Complete REST API route registrations
│   ├── tests/                           # PHPUnit feature and unit tests
│   ├── composer.json                    # PHP dependencies and scripts
│   └── phpunit.xml                      # PHPUnit configuration
│
├── frontend/                             # Next.js 16 Client Application
│   ├── components/                      # Reusable React components
│   │   ├── cards/                       # Course display cards
│   │   ├── modals/                      # Input and update modal dialogs
│   │   ├── planning/                    # Schedule and calendar components
│   │   ├── presences/                   # Attendance tables and forms
│   │   └── tables/                      # Generic data tables
│   ├── context/
│   │   └── AuthContext.js               # Global authentication context
│   ├── pages/                           # Next.js Pages router views
│   │   ├── admin/                       # Administration interfaces (v1, v2, reports)
│   │   ├── auth/                        # Login and registration pages
│   │   ├── etudiant/                    # Student views (catalog, certificates)
│   │   ├── formateur/                   # Instructor views (courses, attendance)
│   │   ├── errors/                      # HTTP error status pages (403, 404, 500)
│   │   └── index.js                     # Public landing page
│   ├── public/                          # Static web assets
│   ├── services/
│   │   └── api.js                       # Axios HTTP client with Bearer interceptor
│   ├── styles/                          # Global CSS and module stylesheets
│   ├── next.config.ts                   # Next.js configuration
│   ├── package.json                     # Node.js dependencies and scripts
│   └── tsconfig.json                    # TypeScript configuration
│
└── docs/                                 # Internal technical documentation
    ├── ANALYSE_PROFONDE_PROJET.md
    ├── DIAGRAMMES_ET_FLUX.md
    ├── QUICK_START_GUIDE.md
    ├── REFACTORISATION_SESSIONS_SUPPRESSION.md
    └── CHECKLIST_DEMARRAGE.md
```

---

## 13. Technologies Used

### Backend
- **Framework**: Laravel 12.0
- **Language**: PHP 8.2+
- **Authentication**: Laravel Sanctum 4.2
- **PDF Generation**: Barryvdh Laravel-DomPDF 3.1
- **Spreadsheet / CSV Exports**: Maatwebsite Excel 3.1
- **API Documentation**: L5-Swagger 10.1
- **Testing**: PHPUnit 11.5

### Frontend
- **Framework**: Next.js 16.1.4 (Pages Router)
- **UI Library**: React 19.2.3
- **Languages**: TypeScript 5 / JavaScript ECMAScript 2022
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios 1.13
- **Icons**: Lucide React & FontAwesome Free
- **Data Visualization**: Recharts 2.10
- **Calendar & Planning**: React Big Calendar 1.8

---

## 14. Deployment

### Backend Deployment (Production Environment)

1. **Web Server & PHP-FPM**: Configure Nginx or Apache pointing the `DocumentRoot` to `./backend/public/`.
2. **Environment Variables**:
   - Set `APP_ENV=production` and `APP_DEBUG=false`.
   - Provide database credentials pointing to a dedicated production database (MySQL or PostgreSQL).
3. **Laravel Cache Optimizations**:
   ```bash
   cd backend
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. **Database Migrations**:
   ```bash
   php artisan migrate --force
   ```
5. **Background Queue Worker**:
   Configure **Supervisor** or a `systemd` service to run the queue worker continuously:
   ```bash
   php artisan queue:work --tries=3
   ```

### Frontend Deployment

1. **Production Build**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Launch Production Server**:
   ```bash
   npm run start
   ```
   *Alternative*: Deploy directly to the Vercel platform or containerize with Node.js.

### Containerization (Docker)
- **To be completed**: No `Dockerfile` or `docker-compose.yml` is currently present in the repository root. A multi-container setup (PHP-FPM, Nginx, Node.js, MySQL) should be added to simplify containerized deployments.

---

## 15. Contributing

To contribute to this project, follow these standard steps:

1. Create a feature branch off the main branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Apply your changes adhering to project standards (PSR-12 for PHP, ESLint rules for frontend code).
3. Verify that all tests pass without regressions:
   ```bash
   # Backend checks
   cd backend && php artisan test
   # Frontend checks
   cd ../frontend && npm run lint
   ```
4. Commit your changes using clear and descriptive commit messages.
5. Push the feature branch and open a Pull Request for review.

---

## 16. License

The backend Laravel skeleton specifies the **MIT** license in `./backend/composer.json`.

- **To be completed**: No top-level `LICENSE` file exists in the repository root. The official license file chosen by the project owner should be added.

---

## 17. Authors / Contacts

- **Lead Developer**: Haythem Fadhlaoui ([haythemfadhlaoui5@gmail.com](mailto:haythemfadhlaoui5@gmail.com))
- **Affiliation / Organization**: National Center for Informatics (CNI - Centre National de l'Informatique)
- **Additional Contacts & Maintainers**: To be completed (specify the team maintainers or project supervisor).

---

## 18. Useful Resources

### Internal Project Documentation
- [Quick Start Guide](./QUICK_START_GUIDE.md): Step-by-step setup and operational commands.
- [In-Depth Project Analysis](./ANALYSE_PROFONDE_PROJET.md): Functional and architectural specifications.
- [Diagrams and Flows](./DIAGRAMMES_ET_FLUX.md): System architecture and sequence diagrams.
- [v2 Refactoring Log](./REFACTORISATION_SESSIONS_SUPPRESSION.md): Technical details on merging sessions into courses.
- [Startup Checklist](./CHECKLIST_DEMARRAGE.md): Team onboarding and milestone verification.
- [Controllers and Routes Directory](./CONTROLLERS_ROUTES_COMPLETE.md): Detailed API endpoint catalog.

### External Official Documentation
- [Laravel 12 Documentation](https://laravel.com/docs/12.x)
- [Next.js Documentation](https://nextjs.org/docs)
- [Laravel Sanctum Documentation](https://laravel.com/docs/12.x/sanctum)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Notes to Complete

This section identifies missing or unconfirmed items in the codebase and existing documentation that should be addressed:

1. **Root License File**: Add an official `LICENSE` file at the root of the repository to clearly define intellectual property and usage rights.
2. **Frontend Configuration Template (`.env.example`)**: Add a `./frontend/.env.example` file documenting the `NEXT_PUBLIC_API_URL` variable.
3. **Continuous Integration (CI/CD)**: Add workflow definitions under `.github/workflows/` to automate static analysis, linting, and test execution for both backend and frontend on pull requests.
4. **Frontend Automated Testing**: Install and configure an automated testing suite for React components (e.g., Vitest / React Testing Library or Playwright).
5. **Docker Containerization**: Provide a `docker-compose.yml` along with respective `Dockerfile`s for PHP-FPM, Nginx, Node.js, and MySQL to ensure reproducible development and deployment environments.
6. **Swagger UI OpenAPI Documentation**: Although `darkaonline/l5-swagger` is installed in `backend/composer.json`, complete OpenAPI annotations should be added across all API controllers, followed by running `php artisan l5-swagger:generate`.
7. **Seed Password Consistency**: The default admin password is set to `Password-123` in `./backend/database/seeders/DatabaseSeeder.php`, whereas legacy documentation guides mentioned `password123`. This credential should be aligned and confirmed across environments.
