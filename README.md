# Campus Issue Tracker

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

A modern, full-stack campus incident reporting and administrative management platform. The application allows university students to report facilities, electrical, internet, and infrastructure problems with real-time status tracking, while enabling campus administrators and departmental teams to triage, prioritize, assign, and resolve issues.

---

## 1. Project Overview

Campus facilities degrade quickly without rapid incident feedback. **Campus Issue Tracker** bridges the gap between campus residents and maintenance operations with:
- **Zero-trust Ownership**: Server-enforced role-based access control (RBAC) preventing unauthorized viewing, modification, or tampering with resolved reports.
- **Dynamic Administrative Workflows**: Multi-stage lifecycle state machine (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`), priority management, and routing to specialized teams (Facilities, IT, Electrical, Security, Maintenance).
- **Interactive Discussion Threads**: Direct communication between reporters and staff on active issues.
- **Real-Time Dashboards**: Metric KPIs, breakdown charts (by category, priority, status), and multi-criteria search and filter grids.

---

## 2. Features

### Student Features
- **Self-Service Onboarding**: Secure registration and login with JWT session handling.
- **Campus Issue Reporting**: Report issues with category, building location, urgency priority, and detailed descriptions.
- **Personal Dashboard**: Instant summary KPIs (Total, Open, In Progress, Resolved) and recent activity stream.
- **Search & Multi-Filter**: Search by title, description, or building location; filter by category or status.
- **Ownership-Protected Editing**: Modify open/in-progress issues (automatically locked once resolved or closed).
- **Issue Timeline & Comments**: Real-time lifecycle timeline tracking and discussion comments on reported problems.

### Admin Features
- **Executive Operations Dashboard**: Overview of system-wide KPIs, critical alerts, and distributions by category, priority, and status.
- **Campus-Wide Issue Directory**: Full visibility over all student and staff reports with multi-criteria filtering.
- **Lifecycle Status Management**: Transition issues through `OPEN`, `IN_PROGRESS`, `RESOLVED`, and `CLOSED`.
- **Administrative Priority Escalation**: Set urgency levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Personnel & Department Assignment**: Route issues to specific staff personnel and dedicated teams (`Facilities Team`, `IT Support`, `Electrical Team`, `Security Team`, `Maintenance Team`).
- **Administrative Notes & Comments**: Post updates to any issue thread visible to the reporter.

### Core Architectural Guarantees
- **Strict Server-Side Authorization**: Backend does not trust client roles; ownership is strictly enforced at the database/service layer (returns `403 Forbidden` if a student accesses another's issue).
- **Audit Locking**: Resolved or closed issues cannot be edited by students (`400 Bad Request`).
- **Input Sanitization & Validation**: Comprehensive Pydantic v2 schemas on the backend and Zod schemas on the frontend.
- **Standardized Error Envelope**: Consistent `{ "error": { "code", "message", "details" } }` responses with no leaked internal stack traces.

---

## 3. Technology Choices & Justifications

### Why Next.js?
- **App Router & Component Model**: Modular architecture separating public, student, and administrative layouts.
- **TypeScript Integration**: End-to-end type safety aligning with backend Pydantic models.
- **Responsive Ergonomics**: Tailored for mobile devices so students can report issues directly from classrooms, dormitories, or outdoor campus grounds.

### Why FastAPI?
- **Type-Safe Validation**: Pydantic v2 integration guarantees strict request parsing, trimming, and schema validation before handler execution.
- **Self-Documenting OpenAPI**: Automatic generation of interactive OpenAPI (Swagger UI) documentation at `/docs`.
- **High Performance & Async Ready**: Fast execution with dependency injection for clean authentication and database session handling.

### Why PostgreSQL?
- **Relational Integrity**: Foreign key constraints with cascading deletes ensure clean data relationships between users, teams, issues, and comments.
- **Indexed Search & Filtering**: Multi-column B-tree indexes allow sub-millisecond filtering across categories, statuses, priorities, and creation dates.
- **ACID Reliability**: Protects concurrent status updates and comment logging.

### Why Docker & Docker Compose?
- **Reproducible Local Evaluation**: Single command spinning up PostgreSQL, FastAPI backend, and Next.js frontend with isolated networking and health checks.

---

## 4. Demo Credentials

The application is pre-seeded with realistic campus data and demo accounts:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Student** | `student@example.com` | `StudentPass123!` | Student Dashboard, Report Issues, Own Issues |
| **Student 2** | `student2@example.com` | `StudentPass123!` | Used to verify cross-student ownership isolation |
| **Admin** | `admin@example.com` | `AdminPass123!` | Full Admin Dashboard, All Issues, Assign & Resolve |
| **Admin 2** | `admin2@example.com` | `AdminPass123!` | Secondary campus administrator / staff |

---

## 5. Quick Start Guide

### Option A: Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd campus-issue-tracker
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start all services**:
   ```bash
   docker compose up --build
   ```

4. **Access the application**:
   - **Frontend Application**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8001](http://localhost:8001)
   - **Interactive API Docs (Swagger)**: [http://localhost:8001/docs](http://localhost:8001/docs)
   - **API Redoc**: [http://localhost:8001/redoc](http://localhost:8001/redoc)

---

### Option B: Local Manual Development (Without Docker)

#### 1. Backend Setup:
```powershell
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and seed database
alembic upgrade head
python -m app.seed

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### 2. Frontend Setup:
```powershell
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```

---

## 6. Running Tests

### Backend Automated Test Suite
The backend contains 30 comprehensive unit and integration tests covering Authentication, Issues, Ownership, Role-Based Access Control, Comments, and Validation:

```powershell
cd backend
venv\Scripts\pytest -v
```

### Test Coverage Highlights:
- `test_auth.py`: Registration, duplicate email (409), login, invalid credentials (401), profile verification.
- `test_issues.py`: Issue creation, pagination envelopes, full-text search, category and status filtering.
- `test_ownership.py`: Cross-student access prohibition (403), student editing own issue, student blocked from editing resolved issues (400), admin override (200).
- `test_admin.py`: Admin viewing all issues, status progression (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`), priority change, assignment to staff and team, dashboard statistics.
- `test_comments.py`: Comment creation by owner, cross-student commenting blocked (403), admin commenting on any issue, whitespace comment rejection (422).
- `test_validation.py`: Minimum/maximum length constraints, enum validation, invalid password rejection.

---

## 7. Architecture & Documentation Index

For detailed architectural and design specifications, refer to the documents in the `docs/` folder:

- [docs/architecture.md](docs/architecture.md): High-level system architecture, request lifecycles, and layered clean architecture.
- [docs/api.md](docs/api.md): Complete RESTful API catalog with request/response schemas and HTTP status codes.
- [docs/database.md](docs/database.md): Relational schema, Mermaid ERD, table definitions, and index strategies.
- [docs/authentication.md](docs/authentication.md): JWT token specification, password hashing, and role-based permissions matrix.
- [docs/decisions.md](docs/decisions.md): Architecture Decision Records (ADRs) explaining technical choices.
- [docs/final-review.md](docs/final-review.md): Strict requirement matrix and self-evaluation.
