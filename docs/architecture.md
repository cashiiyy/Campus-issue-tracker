# Architecture Overview - Campus Issue Tracker

## 1. System Architecture

The Campus Issue Tracker is designed as a decoupled, modern multi-tier web application built with separation of concerns, strict type safety, server-enforced role-based access control (RBAC), and persistent relational storage.

```mermaid
flowchart TB
    subgraph Client["Client Tier (Browser)"]
        UI["Next.js 14 SPA / App Router"]
        RQ["TanStack Query Cache"]
        RHF["React Hook Form + Zod"]
        AuthCtx["Auth Context (JWT In-Memory/Storage)"]
    end

    subgraph Edge["Reverse Proxy / Network"]
        DockerNet["Docker Bridge Network"]
    end

    subgraph Server["Application Tier (FastAPI)"]
        API["FastAPI API Gateway (v1 Routers)"]
        Dep["Auth & Dependency Injection"]
        Svc["Service Layer (Business Logic & Authorization)"]
        Repo["Repository Layer (SQLAlchemy ORM Data Access)"]
    end

    subgraph Data["Persistence Tier (PostgreSQL)"]
        DB[(PostgreSQL 16 Relational DB)]
        Alembic["Alembic Schema Migrations"]
    end

    UI -->|"HTTP / REST (JSON + Bearer JWT)"| API
    API --> Dep
    Dep -->|"Validated Identity (User, Role)"| Svc
    Svc -->|"Clean domain operations"| Repo
    Repo -->|"SQLAlchemy 2.0 Queries"| DB
    Alembic -.->|"Schema DDL"| DB
```

---

## 2. Frontend Architecture

The frontend is implemented using **Next.js (App Router)** with **TypeScript** and **Tailwind CSS**.

### Key Architectural Layers:
1. **Routing & Pages (`app/`)**:
   - `(public)` routes: `/login`, `/register`
   - `(student)` routes: `/dashboard`, `/issues`, `/issues/new`, `/issues/[id]`
   - `(admin)` routes: `/admin`, `/admin/issues`, `/admin/issues/[id]`
2. **State & Caching (`TanStack Query`)**:
   - Manages asynchronous server state, cache invalidation, and background refreshing.
   - Decouples UI rendering from fetch lifecycles.
3. **Authentication Layer (`lib/auth.tsx`)**:
   - Manages active JWT tokens, user profiles, login/logout transitions, and client-side route guard redirection.
4. **Form Handling & Validation (`React Hook Form` + `Zod`)**:
   - Schema validation with Zod enforces real-time client-side feedback matching the backend constraints.
5. **Component Design System (`components/`)**:
   - Atomic and composite components: Button, Input, Select, Badge, Card, Modal, StatusTimeline, FilterControls, StatsCards.

---

## 3. Backend Architecture: Clean Layered Design

The backend enforces a strict **Layered Clean Architecture** pattern to guarantee testability, maintainability, and loose coupling.

```mermaid
flowchart LR
    subgraph Presentation["1. Presentation Layer"]
        Router["FastAPI Routers (/api/v1/*)"]
        Schemas["Pydantic v2 Schemas"]
        ExceptionHandler["Global Exception Handler"]
    end

    subgraph Business["2. Business Logic Layer"]
        AuthSvc["AuthService"]
        IssueSvc["IssueService"]
        CommentSvc["CommentService"]
        AdminSvc["AdminService"]
        TeamSvc["TeamService"]
    end

    subgraph DataAccess["3. Data Access Layer"]
        UserRepo["UserRepository"]
        IssueRepo["IssueRepository"]
        CommentRepo["CommentRepository"]
        TeamRepo["TeamRepository"]
    end

    subgraph Persistence["4. Database Engine"]
        SQLA["SQLAlchemy 2.0 Engine"]
        Postgres["PostgreSQL / SQLite"]
    end

    Router --> Schemas
    Router --> Business
    Business --> DataAccess
    DataAccess --> SQLA
    SQLA --> Postgres
    ExceptionHandler -.->|"Catches Domain Exceptions"| Router
```

### Layer Responsibilities:
- **API Routers (`app/api/v1/`)**: Pure transport protocol handling (HTTP headers, query params, status codes). No business logic.
- **Service Layer (`app/services/`)**: Core application rules, lifecycle transitions, authorization verification, domain checks.
- **Repository Layer (`app/repositories/`)**: Encapsulates SQLAlchemy queries, filtering logic, eager loading (`joinedload`), joins, and aggregations.
- **Models (`app/models/`)**: Declarative database schema definitions with relational constraints and cascade policies.

---

## 4. Request Lifecycle & Authorization

Every authenticated request follows a rigorous verification pipeline before reaching database operations:

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Client Browser
    participant Gateway as FastAPI Router
    participant AuthDep as get_current_user Dependency
    participant Service as Service Layer
    participant Repo as Repository Layer
    participant DB as PostgreSQL

    Browser->>Gateway: HTTP Request with 'Authorization: Bearer <token>'
    Gateway->>AuthDep: Validate token
    AuthDep->>AuthDep: Decode JWT (HS256) & verify signature and expiration
    AuthDep->>DB: Fetch user by ID
    DB-->>AuthDep: User record (id, role, name)
    AuthDep-->>Gateway: Injected User entity
    Gateway->>Service: Execute operation(payload, current_user)
    Service->>Service: Verify permissions & ownership (e.g., created_by == current_user.id)
    alt Unauthorized / Not Owner
        Service-->>Gateway: Raise ForbiddenException (HTTP 403)
        Gateway-->>Browser: Standardized JSON Error response
    else Authorized
        Service->>Repo: Perform query / mutation
        Repo->>DB: Execute SQL query
        DB-->>Repo: SQL result set
        Repo-->>Service: Database entity
        Service-->>Gateway: Response DTO
        Gateway-->>Browser: HTTP 200/201 JSON Response
    end
```

---

## 5. Issue Ownership & Authorization Decision Flowchart

```mermaid
flowchart TD
    Start["Incoming Issue Request: GET or PATCH /issues/{id}"] --> CheckAuth{"Is Request Authenticated?"}
    CheckAuth -- No --> Ret401["HTTP 401 Unauthorized"]
    CheckAuth -- Yes --> FetchIssue["Load Issue from DB"]
    FetchIssue --> IssueExists{"Issue Exists?"}
    IssueExists -- No --> Ret404["HTTP 404 Not Found"]
    IssueExists -- Yes --> CheckRole{"Is User Admin?"}
    CheckRole -- Yes --> AllowAdmin["Allow Access (Admin Override)"]
    CheckRole -- No --> CheckOwner{"issue.created_by == user.id?"}
    CheckOwner -- No --> Ret403["HTTP 403 Forbidden (NOT_ISSUE_OWNER)"]
    CheckOwner -- Yes --> CheckMutation{"Is PATCH / Edit Request?"}
    CheckMutation -- No --> AllowGet["Allow GET Detail"]
    CheckMutation -- Yes --> CheckStatus{"issue.status in [RESOLVED, CLOSED]?"}
    CheckStatus -- Yes --> Ret400["HTTP 400 Bad Request (ISSUE_LOCKED)"]
    CheckStatus -- No --> AllowEdit["Allow Student Edit (Title, Desc, Cat, Loc, Priority)"]
```
