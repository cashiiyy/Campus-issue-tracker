# Architecture Decision Records (ADRs) - Campus Issue Tracker

## ADR 001: Selection of Next.js for Frontend
- **Context**: The application requires a fast, responsive, and maintainable user interface for both desktop and mobile campus reporting.
- **Decision**: Adopted **Next.js 14+ (App Router)** with TypeScript and Tailwind CSS.
- **Rationale**:
  - React component model promotes reusable UI elements (Status badges, timelines, filter bars).
  - Built-in App Router provides clean nested layout hierarchies for Student and Admin experiences.
  - TypeScript provides end-to-end type safety matching backend Pydantic schemas.

---

## ADR 002: Selection of FastAPI for Backend
- **Context**: The backend needs to enforce strict schema validation, produce self-documenting APIs, and handle concurrent REST traffic cleanly.
- **Decision**: Adopted **FastAPI** with Python 3.10+ and Pydantic v2.
- **Rationale**:
  - Automatic OpenAPI / Swagger UI generation accelerates testing and documentation verification.
  - Native Pydantic v2 integration enforces input trimming and validation before handlers execute.
  - Dependency Injection simplifies authentication, session management, and test overrides.

---

## ADR 003: Selection of PostgreSQL for Relational Data Persistence
- **Context**: Campus issue tracking involves deeply relational relationships between users, teams, issues, and comments.
- **Decision**: Adopted **PostgreSQL 16** via **SQLAlchemy 2.0** and **Alembic**.
- **Rationale**:
  - ACID guarantees ensure reliable state transitions and comment consistency.
  - Foreign key constraints with `ON DELETE CASCADE` and `SET NULL` maintain referential integrity.
  - B-tree indexing on foreign keys and enums accelerates multi-column filter queries.

---

## ADR 004: Stateless JWT Authentication over Session Cookies
- **Context**: The application separates the Next.js frontend from the REST backend.
- **Decision**: Adopted **JWT Access Tokens (HS256)** with 24-hour expiration.
- **Rationale**:
  - Decouples client from backend server memory; horizontally scalable.
  - Tokens securely embed the user ID and role, allowing instant cryptographic validation in the backend dependency chain without secondary lookups for basic checks.

---

## ADR 005: Service and Repository Layer Separation
- **Context**: Putting database queries and business logic inside route handlers results in tightly coupled, unmaintainable code ("spaghetti architecture").
- **Decision**: Enforce a strict four-layer architecture: `API Routers -> Services -> Repositories -> Database`.
- **Rationale**:
  - API routers only deal with HTTP contracts and status codes.
  - Service layer centrally encapsulates business rules, authorization checks, and lifecycle validations.
  - Repositories isolate ORM queries, pagination, and SQL expressions, making unit and integration testing clean and isolated.

---

## ADR 006: Ownership Authorization Strategy: 403 Forbidden vs. 404 Not Found
- **Context**: When a student tries to access an issue created by another student, what HTTP status code should be returned?
- **Decision**: Return **HTTP 403 Forbidden** with error code `NOT_ISSUE_OWNER`.
- **Rationale**:
  - In an internal university system with authenticated users, clearly distinguishing between a non-existent resource (404) and insufficient privilege (403) provides unambiguous feedback to clients and automated tests.
  - The security policy is explicitly documented and tested in the test suite.

---

## ADR 007: Relational Assignment Modeling
- **Context**: How should issue assignment to personnel and campus teams be structured?
- **Decision**: Relational foreign keys (`assigned_to -> users.id` and `assigned_team -> teams.id`).
- **Rationale**:
  - Storing arbitrary freeform text leads to typos, broken filters, and unorganized departments.
  - A dedicated `teams` entity allows departments (e.g. Facilities, IT Support, Electrical) to maintain descriptions and ensures referential consistency.

---

## ADR 008: Issue Lifecycle Status Transitions & Lock Policy
- **Context**: Can students modify issues after they have been processed or resolved?
- **Decision**:
  - Lifecycle states: `OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`.
  - Only administrators can transition status, priority, and assignment.
  - Students can edit their own issues while in `OPEN` or `IN_PROGRESS`, but once an issue is `RESOLVED` or `CLOSED`, it is locked (`HTTP 400 Bad Request: ISSUE_LOCKED`) to preserve audit integrity.
