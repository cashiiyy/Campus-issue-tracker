# REST API Specification - Campus Issue Tracker

## 1. Overview

The Campus Issue Tracker API is a RESTful API versioned under `/api/v1`.
All requests and responses use JSON format (`application/json`).
All protected endpoints require a valid JWT bearer token in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

---

## 2. Standardized Responses

### 2.1 Success Responses
Successful operations return HTTP status codes matching standard REST conventions:
- `200 OK`: Successful retrieval or update.
- `201 Created`: Resource successfully created.
- `204 No Content`: Successful deletion (when applicable).

### 2.2 Error Envelope
All application and validation errors return a consistent error structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description.",
    "details": [
      {
        "field": "title",
        "message": "Title must be at least 5 characters after trimming whitespace."
      }
    ]
  }
}
```

### 2.3 Paginated Response Envelope
Endpoints that return lists return a consistent pagination metadata wrapper:
```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 45,
  "total_pages": 3
}
```

---

## 3. Endpoints Catalog

### 3.1 Authentication

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register a new student account | `201`, `409`, `422` |
| `POST` | `/api/v1/auth/login` | Public | Authenticate with email/password | `200`, `401`, `422` |
| `GET` | `/api/v1/auth/me` | Bearer | Get current user's profile | `200`, `401` |

#### `POST /api/v1/auth/register` Request Body:
```json
{
  "name": "Jane Doe",
  "email": "jane@campus.edu",
  "password": "Password123!"
}
```

#### `POST /api/v1/auth/login` Response Body:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "7bf3b0d2-dfa6-455b-b9d9-bb58a8a4b2c1",
    "name": "Jane Doe",
    "email": "jane@campus.edu",
    "role": "STUDENT",
    "created_at": "2026-09-05T12:00:00Z"
  }
}
```

---

### 3.2 Issues

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/v1/issues` | Bearer | Create a new campus issue | `201`, `401`, `422` |
| `GET` | `/api/v1/issues` | Bearer | List issues (scoped to user or all if admin) | `200`, `401` |
| `GET` | `/api/v1/issues/stats/summary` | Bearer | Get issue counts for student dashboard | `200`, `401` |
| `GET` | `/api/v1/issues/{id}` | Bearer | Get issue details with comments | `200`, `401`, `403`, `404` |
| `PATCH` | `/api/v1/issues/{id}` | Bearer | Edit issue (student owner or admin) | `200`, `400`, `401`, `403`, `404`, `422` |

#### Query Parameters for `GET /api/v1/issues`:
- `search` (string): Searches title, description, and location.
- `category` (string): `Infrastructure`, `Cleanliness`, `Electrical`, `Water`, `Internet`, `Security`, `Transportation`, `Academic`, `Other`.
- `status` (string): `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- `priority` (string): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `assigned_team` (UUID string): Filter by assigned team ID.
- `assigned_to` (UUID string): Filter by assigned staff ID.
- `page` (integer, default 1): Page number.
- `page_size` (integer, default 20, max 100): Number of records per page.

#### `POST /api/v1/issues` Request Body:
```json
{
  "title": "Air Conditioner Leaking in Library 2nd Floor",
  "description": "Water is dripping from the ceiling ceiling duct onto study tables.",
  "category": "Water",
  "location": "Central Library - 2nd Floor West Wing",
  "priority": "HIGH"
}
```

---

### 3.3 Comments

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/issues/{id}/comments` | Bearer | Get comment thread for an issue | `200`, `401`, `403`, `404` |
| `POST` | `/api/v1/issues/{id}/comments` | Bearer | Post a comment to an issue thread | `201`, `401`, `403`, `404`, `422` |

#### `POST /api/v1/issues/{id}/comments` Request Body:
```json
{
  "content": "Facilities technicians have arrived on site and isolated the valve."
}
```

---

### 3.4 Admin Operations (Role: ADMIN only)

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `PATCH` | `/api/v1/admin/issues/{id}/status` | Admin | Change issue status | `200`, `401`, `403`, `404`, `422` |
| `PATCH` | `/api/v1/admin/issues/{id}/priority` | Admin | Change issue priority | `200`, `401`, `403`, `404`, `422` |
| `PATCH` | `/api/v1/admin/issues/{id}/assignment` | Admin | Assign issue to staff / team | `200`, `401`, `403`, `404`, `422` |
| `GET` | `/api/v1/admin/stats` | Admin | Aggregate KPI metrics and breakdown | `200`, `401`, `403` |
| `GET` | `/api/v1/admin/staff` | Admin | List staff members for assignment | `200`, `401`, `403` |

#### `PATCH /api/v1/admin/issues/{id}/status` Request Body:
```json
{
  "status": "IN_PROGRESS"
}
```

#### `PATCH /api/v1/admin/issues/{id}/assignment` Request Body:
```json
{
  "assigned_to": "8c4598d1-55f6-49bf-a81d-ef279a0b93bb",
  "assigned_team": "5140b2a3-83eb-460d-a0c5-59b3bc58b292"
}
```

---

### 3.5 Teams

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/teams` | Bearer | List all campus department teams | `200`, `401` |
| `POST` | `/api/v1/teams` | Admin | Create a new campus department team | `201`, `401`, `403`, `422` |
