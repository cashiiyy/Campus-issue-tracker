"""Tests verifying input validation on backend schemas."""

def test_issue_title_too_short_rejected(client, student_headers):
    response = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Bad",
            "description": "Valid long description explaining the problem.",
            "category": "Infrastructure",
            "location": "Library",
            "priority": "LOW",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_issue_description_too_short_rejected(client, student_headers):
    response = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Valid Issue Title",
            "description": "Too short",
            "category": "Cleanliness",
            "location": "Restroom",
            "priority": "LOW",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_issue_invalid_category_rejected(client, student_headers):
    response = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Valid Issue Title",
            "description": "Valid description of reasonable length.",
            "category": "InvalidCategoryName",
            "location": "Main Lawn",
            "priority": "MEDIUM",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_issue_invalid_priority_rejected(client, student_headers):
    response = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Valid Issue Title",
            "description": "Valid description of reasonable length.",
            "category": "Infrastructure",
            "location": "Campus Center",
            "priority": "SUPER_URGENT",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_register_short_password_rejected(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Short Pass User",
            "email": "short@campus.edu",
            "password": "123",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
