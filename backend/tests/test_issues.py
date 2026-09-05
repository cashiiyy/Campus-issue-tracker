"""Tests for issue creation, listing, searching, filtering, and pagination."""

def test_create_issue(client, student_headers):
    response = client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Broken desk in lecture hall",
            "description": "Row 4 desk 3 is completely cracked and unstable.",
            "category": "Infrastructure",
            "location": "Main Lecture Hall - Row 4",
            "priority": "HIGH",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Broken desk in lecture hall"
    assert data["category"] == "Infrastructure"
    assert data["status"] == "OPEN"
    assert data["priority"] == "HIGH"
    assert "id" in data


def test_student_lists_only_own_issues(client, student_headers, student2_headers):
    # Student 1 creates 2 issues
    client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Student 1 Issue One",
            "description": "Issue description text here.",
            "category": "Electrical",
            "location": "Room 101",
            "priority": "LOW",
        },
    )
    client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Student 1 Issue Two",
            "description": "Issue description text here.",
            "category": "Water",
            "location": "Room 102",
            "priority": "MEDIUM",
        },
    )

    # Student 2 creates 1 issue
    client.post(
        "/api/v1/issues",
        headers=student2_headers,
        json={
            "title": "Student 2 Issue Secret",
            "description": "Bob's private issue description.",
            "category": "Internet",
            "location": "Room 205",
            "priority": "CRITICAL",
        },
    )

    # Student 1 fetches issues list
    response = client.get("/api/v1/issues", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    titles = [item["title"] for item in data["items"]]
    assert "Student 1 Issue One" in titles
    assert "Student 1 Issue Two" in titles
    assert "Student 2 Issue Secret" not in titles


def test_issue_search_and_filtering(client, student_headers):
    # Create several issues for testing search & filters
    client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Library Wi-Fi disconnecting",
            "description": "Internet disconnects every 5 minutes in west wing.",
            "category": "Internet",
            "location": "Library West Wing",
            "priority": "HIGH",
        },
    )
    client.post(
        "/api/v1/issues",
        headers=student_headers,
        json={
            "title": "Cafeteria water cooler broken",
            "description": "No cold water flowing from the fountain.",
            "category": "Water",
            "location": "Dining Commons",
            "priority": "LOW",
        },
    )

    # Search by keyword "Library"
    search_resp = client.get("/api/v1/issues?search=Library", headers=student_headers)
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert search_data["total"] == 1
    assert search_data["items"][0]["title"] == "Library Wi-Fi disconnecting"

    # Filter by category "Water"
    cat_resp = client.get("/api/v1/issues?category=Water", headers=student_headers)
    assert cat_resp.status_code == 200
    cat_data = cat_resp.json()
    assert cat_data["total"] == 1
    assert cat_data["items"][0]["title"] == "Cafeteria water cooler broken"


def test_pagination_structure(client, student_headers):
    for i in range(5):
        client.post(
            "/api/v1/issues",
            headers=student_headers,
            json={
                "title": f"Numbered Issue {i+1}",
                "description": f"Detailed description for numbered issue {i+1}.",
                "category": "Infrastructure",
                "location": f"Hallway {i+1}",
                "priority": "MEDIUM",
            },
        )

    response = client.get("/api/v1/issues?page=1&page_size=2", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2
