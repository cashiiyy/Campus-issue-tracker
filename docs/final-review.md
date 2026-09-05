# Final Evaluation & Requirements Matrix - Campus Issue Tracker

## 1. Requirements Compliance Matrix

This document acts as an evaluation assessment of the Campus Issue Tracker project against all core and bonus requirements.

| Requirement | Implemented | Implementation Location | Verification Evidence |
|---|:---:|---|---|
| **Student creates issues** | Yes | `backend/app/api/v1/issues.py`, `backend/app/services/issue_service.py`, `frontend/app/issues/new/page.tsx` | Pytest `test_create_issue` passed; form validation with React Hook Form + Zod |
| **Student views own issues** | Yes | `backend/app/services/issue_service.py` (`list_issues` & `get_issue`), `frontend/app/issues/page.tsx`, `frontend/app/dashboard/page.tsx` | Pytest `test_student_lists_only_own_issues` passed; query scoped to `created_by = user.id` |
| **Student edits own issues** | Yes | `backend/app/api/v1/issues.py` (`PATCH /issues/{id}`), `backend/app/services/issue_service.py` | Pytest `test_admin_bypasses_ownership_restrictions`, `test_ownership_student_cannot_edit_another_students_issue` passed |
| **Ownership protection** | Yes | `backend/app/services/issue_service.py`, `backend/app/services/comment_service.py` | Pytest `test_ownership_student_cannot_view_another_students_issue` returns HTTP 403 `NOT_ISSUE_OWNER` |
| **Audit lock on resolved issues** | Yes | `backend/app/services/issue_service.py` | Pytest `test_student_cannot_edit_resolved_or_closed_issue` returns HTTP 400 `ISSUE_LOCKED` |
| **Status tracking** | Yes | `backend/app/models/enums.py` (`IssueStatus`), `frontend/components/issues/StatusTimeline.tsx`, `frontend/components/issues/StatusBadge.tsx` | Status states `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` tracked with visual timeline |
| **Admin views all issues** | Yes | `backend/app/services/issue_service.py`, `frontend/app/admin/issues/page.tsx` | Pytest `test_admin_views_all_issues` passed (admin sees cross-student issues) |
| **Admin changes status** | Yes | `backend/app/api/v1/admin.py` (`PATCH /admin/issues/{id}/status`), `frontend/components/admin/StatusModal.tsx` | Pytest `test_admin_updates_status_lifecycle` passed |
| **Admin changes priority** | Yes | `backend/app/api/v1/admin.py` (`PATCH /admin/issues/{id}/priority`), `frontend/components/admin/PriorityModal.tsx` | Pytest `test_admin_updates_priority` passed |
| **Assignment (Person & Team)** | Yes | `backend/app/models/issue.py`, `backend/app/api/v1/admin.py` (`PATCH /admin/issues/{id}/assignment`), `frontend/components/admin/AssignmentModal.tsx` | Pytest `test_admin_assigns_person_and_team` passed; relational FKs to `users` and `teams` |
| **Admin Dashboard Statistics** | Yes | `backend/app/api/v1/admin.py` (`GET /admin/stats`), `frontend/app/admin/page.tsx` | Pytest `test_admin_dashboard_stats` passed; returns KPIs and distributions |
| **REST API Design** | Yes | `backend/app/api/v1/`, OpenAPI Swagger `/docs`, `docs/api.md` | Standard resource paths, HTTP verbs, versioning `/api/v1`, OpenAPI auto-generation |
| **Persistent Database** | Yes | PostgreSQL 16 (production/Docker) & SQLite (local/tests), SQLAlchemy 2.0 | Foreign keys, cascading deletes, indexes, migrations via Alembic |
| **Input Validation** | Yes | Pydantic v2 schemas (`backend/app/schemas/`), Zod schemas (`frontend/schemas/`) | Pytest `test_validation.py` (5 tests passing); min/max lengths, trimmed strings, enum checks |
| **HTTP Status Codes** | Yes | `backend/app/core/exceptions.py`, `backend/app/main.py` | 200, 201, 400, 401, 403, 404, 409, 422, 500 mapped cleanly without leaking stack traces |
| **Authentication (JWT & Bcrypt)** | Yes | `backend/app/core/security.py`, `backend/app/api/v1/auth.py`, `frontend/lib/auth.tsx` | Pytest `test_auth.py` (7 tests passing); salted Bcrypt hashing, signed HS256 tokens |
| **Role-Based Access Control (RBAC)** | Yes | `backend/app/dependencies/auth.py` (`require_role`, `require_admin`, `require_student`) | Pytest `test_student_cannot_access_admin_endpoints` (HTTP 403 `INSUFFICIENT_PERMISSIONS`) |
| **Search & Filtering** | Yes | `backend/app/repositories/issue_repository.py`, `frontend/app/issues/page.tsx`, `frontend/app/admin/issues/page.tsx` | Pytest `test_issue_search_and_filtering` passed; searches title, description, location; filters by category/status |
| **Pagination** | Yes | `backend/app/schemas/common.py` (`PaginatedResponse`), `backend/app/repositories/issue_repository.py` | Pytest `test_pagination_structure` passed; returns `items`, `page`, `page_size`, `total`, `total_pages` |
| **Comments (Bonus Requirement)** | Yes | `backend/app/api/v1/comments.py`, `backend/app/services/comment_service.py`, `frontend/components/comments/` | Pytest `test_comments.py` (4 tests passing); owner & admin commenting, cross-student blocked |
| **Seed / Demo Data** | Yes | `backend/app/seed.py` | Seeds 4 demo accounts, 5 campus teams, 8 realistic issues, and comment threads |
| **Docker & Docker Compose** | Yes | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` | Multi-container setup with health checks for Postgres, Backend, and Frontend |
| **Comprehensive Documentation** | Yes | `README.md`, `docs/architecture.md`, `docs/api.md`, `docs/database.md`, `docs/authentication.md`, `docs/decisions.md` | All architectural diagrams in Mermaid, API tables, and setup instructions |

---

## 2. Architecture & Design Tradeoffs

1. **UUIDs as Primary Keys vs. Auto-Incrementing Integers**:
   - *Choice*: Used UUID v4 strings for `users`, `teams`, `issues`, and `comments`.
   - *Tradeoff*: UUIDs consume slightly more storage index space than 32-bit integers, but completely eliminate sequential enumeration attacks where users could guess other issue IDs.

2. **HTTP 403 Forbidden vs. HTTP 404 Not Found for Ownership**:
   - *Choice*: Selected HTTP 403 Forbidden with clear error codes (`NOT_ISSUE_OWNER`).
   - *Tradeoff*: While some public consumer applications return 404 to obscure the existence of a resource, in an authenticated internal university enterprise system, 403 provides clear feedback to clients and testers that access is restricted by policy.

3. **Stateless JWT vs. Stateful Server Sessions**:
   - *Choice*: Stateless JWT signed with HMAC-SHA256.
   - *Tradeoff*: Revocation before token expiration requires a denylist if immediate invalidation is needed. However, for an issue tracker, a standard 24-hour expiration token offers great scalability and zero server-side session memory overhead.

---

## 3. Known Limitations & Potential Future Improvements

1. **File & Photo Attachments**:
   - *Current*: Issues and comments support rich textual descriptions and locations.
   - *Future*: Direct S3/MinIO presigned URL integration for attaching photos of campus damage directly from mobile cameras.

2. **Real-Time Push Notifications**:
   - *Current*: Frontend utilizes TanStack Query with background polling and refetch on focus.
   - *Future*: WebSocket or SSE (Server-Sent Events) channel to broadcast live status changes as maintenance teams update tickets.

3. **Email / SMS Notifications**:
   - *Current*: Changes are tracked on the web dashboard.
   - *Future*: Integration with campus email or SMS alerts when an issue moves to `RESOLVED`.
