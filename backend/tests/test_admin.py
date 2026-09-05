"""Tests for administrative issue management, status changes, assignments, and stats."""

def test_admin_views_all_issues(client, student_headers, student2_headers, admin_headers):
    # Student 1 creates issue
    client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Alice Issue",
            "description": "Reported by Alice in dormitory.",
            "category": "Cleanliness",
            "location": "Dorm Hall",
            "priority": "LOW",
        },
    )
    # Student 2 creates issue
    client.post(
        "/api/v1/issues",
        headers=student2_headers,
        json={
            "title": "Bob Issue",
            "description": "Reported by Bob in classroom.",
            "category": "Academic",
            "location": "Room 303",
            "priority": "MEDIUM",
        },
    )

    # Admin lists issues
    response = client.get("/api/v1/issues", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    titles = [i["title"] for i in data["items"]]
    assert "Alice Issue" in titles
    assert "Bob Issue" in titles


def test_admin_updates_status_lifecycle(client, student_headers, admin_headers):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Lifecycle Test Issue",
            "description": "Tracking status progression through states.",
            "category": "Infrastructure",
            "location": "Gymnasium",
            "priority": "MEDIUM",
        },
    )
    issue_id = create_resp.json()["id"]

    # 1. Update to IN_PROGRESS
    res1 = client.patch(
        f"/api/v1/admin/issues/{issue_id}/status",
        headers=admin_headers,
        json={"status": "IN_PROGRESS"},
    )
    assert res1.status_code == 200
    assert res1.json()["status"] == "IN_PROGRESS"

    # 2. Update to RESOLVED
    res2 = client.patch(
        f"/api/v1/admin/issues/{issue_id}/status",
        headers=admin_headers,
        json={"status": "RESOLVED"},
    )
    assert res2.status_code == 200
    assert res2.json()["status"] == "RESOLVED"

    # 3. Update to CLOSED
    res3 = client.patch(
        f"/api/v1/admin/issues/{issue_id}/status",
        headers=admin_headers,
        json={"status": "CLOSED"},
    )
    assert res3.status_code == 200
    assert res3.json()["status"] == "CLOSED"


def test_admin_updates_priority(client, student_headers, admin_headers):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Priority Test Issue",
            "description": "Will be escalated to critical.",
            "category": "Electrical",
            "location": "Power Substation",
            "priority": "LOW",
        },
    )
    issue_id = create_resp.json()["id"]

    res = client.patch(
        f"/api/v1/admin/issues/{issue_id}/priority",
        headers=admin_headers,
        json={"priority": "CRITICAL"},
    )
    assert res.status_code == 200
    assert res.json()["priority"] == "CRITICAL"


def test_admin_assigns_person_and_team(
    client, student_headers, admin_headers, admin_user, sample_team
):
    create_resp = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Assignment Test Issue",
            "description": "Needs to be assigned to electrical team and staff.",
            "category": "Electrical",
            "location": "Basement",
            "priority": "MEDIUM",
        },
    )
    issue_id = create_resp.json()["id"]

    res = client.patch(
        f"/api/v1/admin/issues/{issue_id}/assignment",
        headers=admin_headers,
        json={"assigned_to": admin_user.id, "assigned_team": sample_team.id},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["assigned_to"] == admin_user.id
    assert data["assigned_team"] == sample_team.id
    assert data["team"]["name"] == "Electrical Team"


def test_admin_dashboard_stats(client, student_headers, admin_headers):
    client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Critical Problem",
            "description": "Major security concern on campus.",
            "category": "Security",
            "location": "East Gate",
            "priority": "CRITICAL",
        },
    )

    stats_resp = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_issues"] >= 1
    assert stats["critical_issues"] >= 1
    assert "Security" in stats["by_category"]


def test_student_cannot_access_admin_endpoints(client, student_headers):
    res = client.get("/api/v1/admin/stats", headers=student_headers)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "INSUFFICIENT_PERMISSIONS"
