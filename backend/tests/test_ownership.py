"""Tests verifying strict issue ownership and authorization enforcement."""

def test_ownership_student_cannot_view_another_students_issue(
    client, student_headers, student2_headers
):
    # Student 1 creates an issue
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Private student 1 issue",
            "description": "Sensitive student room problem description.",
            "category": "Cleanliness",
            "location": "Dorm 401",
            "priority": "LOW",
        },
    )
    assert create_resp.status_code == 201
    issue_id = create_resp.json()["id"]

    # Student 1 can access it
    s1_resp = client.get(f"/api/v1/issues/{issue_id}", headers=student_headers)
    assert s1_resp.status_code == 200

    # Student 2 attempts to access it -> 403 Forbidden
    s2_resp = client.get(f"/api/v1/issues/{issue_id}", headers=student2_headers)
    assert s2_resp.status_code == 403
    assert s2_resp.json()["error"]["code"] == "NOT_ISSUE_OWNER"


def test_ownership_student_cannot_edit_another_students_issue(
    client, student_headers, student2_headers
):
    # Student 1 creates an issue
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Initial title from Student 1",
            "description": "Initial description from Student 1.",
            "category": "Electrical",
            "location": "Lab 3",
            "priority": "LOW",
        },
    )
    issue_id = create_resp.json()["id"]

    # Student 2 attempts to edit it -> 403 Forbidden
    s2_edit = client.patch(
        f"/api/v1/issues/{issue_id}",
        headers=student2_headers,
        json={"title": "Hacked title by Student 2"},
    )
    assert s2_edit.status_code == 403
    assert s2_edit.json()["error"]["code"] == "NOT_ISSUE_OWNER"


def test_admin_bypasses_ownership_restrictions(client, student_headers, admin_headers):
    # Student 1 creates an issue
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Student issue viewed by admin",
            "description": "Issue details accessible by administrator.",
            "category": "Security",
            "location": "Main Gate",
            "priority": "HIGH",
        },
    )
    issue_id = create_resp.json()["id"]

    # Admin can view
    admin_get = client.get(f"/api/v1/issues/{issue_id}", headers=admin_headers)
    assert admin_get.status_code == 200
    assert admin_get.json()["id"] == issue_id

    # Admin can edit
    admin_patch = client.patch(
        f"/api/v1/issues/{issue_id}",
        headers=admin_headers,
        json={"title": "Updated by administrator"},
    )
    assert admin_patch.status_code == 200
    assert admin_patch.json()["title"] == "Updated by administrator"


def test_student_cannot_edit_resolved_or_closed_issue(
    client, student_headers, admin_headers
):
    # Student creates an issue
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Issue to be resolved",
            "description": "Will be resolved by maintenance shortly.",
            "category": "Water",
            "location": "Restroom 1",
            "priority": "MEDIUM",
        },
    )
    issue_id = create_resp.json()["id"]

    # Admin resolves the issue
    resolve_resp = client.patch(
        f"/api/v1/admin/issues/{issue_id}/status",
        headers=admin_headers,
        json={"status": "RESOLVED"},
    )
    assert resolve_resp.status_code == 200

    # Student attempts to modify the resolved issue -> 400 Bad Request
    edit_resp = client.patch(
        f"/api/v1/issues/{issue_id}",
        headers=student_headers,
        json={"title": "Tampered after resolution"},
    )
    assert edit_resp.status_code == 400
    assert edit_resp.json()["error"]["code"] == "ISSUE_LOCKED"
