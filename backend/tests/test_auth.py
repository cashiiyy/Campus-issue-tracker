"""Tests for user registration, login, and identity verification."""

def test_register_student_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "David Miller",
            "email": "david.miller@campus.edu",
            "password": "SecurePassword123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "David Miller"
    assert data["email"] == "david.miller@campus.edu"
    assert data["role"] == "STUDENT"
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email_conflict(client, student_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Clone User",
            "email": student_user.email,
            "password": "Password123!",
        },
    )
    assert response.status_code == 409
    data = response.json()
    assert data["error"]["code"] == "EMAIL_ALREADY_REGISTERED"


def test_login_success(client, student_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "Password123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == student_user.email
    assert data["user"]["role"] == "STUDENT"


def test_login_invalid_password(client, student_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_nonexistent_email(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nobody@nowhere.edu",
            "password": "Password123!",
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_CREDENTIALS"


def test_get_current_user_profile(client, student_headers, student_user):
    response = client.get("/api/v1/auth/me", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == student_user.id
    assert data["email"] == student_user.email


def test_get_current_user_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "NOT_AUTHENTICATED"
