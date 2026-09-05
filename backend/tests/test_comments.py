"""Tests for issue comment creation and thread authorization."""

def test_student_adds_comment_to_own_issue(client, student_headers):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Commentable Issue",
            "description": "Student will comment on this problem.",
            "category": "Cleanliness",
            "location": "Cafeteria",
            "priority": "LOW",
        },
    )
    issue_id = create_resp.json()["id"]

    comment_resp = client.post(
        f"/api/v1/issues/{issue_id}/comments",
        headers=student_headers,
        json={"content": "I noticed more trash this afternoon."},
    )
    assert comment_resp.status_code == 201
    data = comment_resp.json()
    assert data["content"] == "I noticed more trash this afternoon."
    assert "author" in data
    assert data["author"]["name"] == "Alice Student"


def test_student_cannot_comment_on_another_students_issue(
    client, student_headers, student2_headers
):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Alice's Issue",
            "description": "Alice's issue description.",
            "category": "Academic",
            "location": "Room 10",
            "priority": "MEDIUM",
        },
    )
    issue_id = create_resp.json()["id"]

    # Student 2 tries to post a comment
    comment_resp = client.post(
        f"/api/v1/issues/{issue_id}/comments",
        headers=student2_headers,
        json={"content": "Intruding comment from Bob."},
    )
    assert comment_resp.status_code == 403
    assert comment_resp.json()["error"]["code"] == "NOT_ISSUE_OWNER"


def test_admin_can_comment_on_any_issue(client, student_headers, admin_headers):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Alice Issue for Admin Note",
            "description": "Alice description.",
            "category": "Water",
            "location": "Kitchen",
            "priority": "LOW",
        },
    )
    issue_id = create_resp.json()["id"]

    comment_resp = client.post(
        f"/api/v1/issues/{issue_id}/comments",
        headers=admin_headers,
        json={"content": "Maintenance team has been dispatched."},
    )
    assert comment_resp.status_code == 201
    assert comment_resp.json()["content"] == "Maintenance team has been dispatched."


def test_empty_comment_rejected(client, student_headers):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Empty Comment Test",
            "description": "Will attempt invalid comment.",
            "category": "Other",
            "location": "Quad",
            "priority": "LOW",
        },
    )
    issue_id = create_resp.json()["id"]

    comment_resp = client.post(
        f"/api/v1/issues/{issue_id}/comments",
        headers=student_headers,
        json={"content": "   "},
    )
    assert comment_resp.status_code == 422
