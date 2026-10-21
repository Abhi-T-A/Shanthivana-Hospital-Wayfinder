from app.models.destination import Destination
from app.services.seed_data import seed_destinations


def test_system_root_and_health(client):
    """Verify original system root and health endpoints remain intact."""
    root_res = client.get("/")
    assert root_res.status_code == 200
    assert root_res.json()["status"] == "running"

    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"


def test_seed_destinations_idempotency(db_session):
    """Verify seed_destinations creates 26 campus locations and second run does not duplicate them."""
    # First seed run
    result1 = seed_destinations(db_session)
    assert result1["created"] == 26
    assert result1["updated"] == 0
    assert result1["total"] == 26

    count_after_first = db_session.query(Destination).count()
    assert count_after_first == 26

    # Second seed run (must be idempotent)
    result2 = seed_destinations(db_session)
    assert result2["created"] == 0
    assert result2["updated"] == 26
    assert result2["total"] == 26

    count_after_second = db_session.query(Destination).count()
    assert count_after_second == 26


def test_list_destinations_and_pagination(client, db_session):
    """Verify listing destinations supports pagination with limit and offset."""
    seed_destinations(db_session)

    # Page 1 (limit 10)
    res1 = client.get("/api/v1/destinations?limit=10&offset=0")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["total"] == 26
    assert data1["limit"] == 10
    assert data1["offset"] == 0
    assert len(data1["items"]) == 10

    # Page 2 (limit 10, offset 10)
    res2 = client.get("/api/v1/destinations?limit=10&offset=10")
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2["items"]) == 10
    assert data2["items"][0]["slug"] != data1["items"][0]["slug"]


def test_destination_search(client, db_session):
    """Verify search filter 'q' matches name, description, or building."""
    seed_destinations(db_session)

    # Search matches name (Patanjali) and description (Vasistha references Patanjali Hall)
    res = client.get("/api/v1/destinations?q=Patanjali")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    matched_slugs = {item["slug"] for item in data["items"]}
    assert "patanjali-yoga-hall" in matched_slugs
    assert "vasistha-yoga-hall" in matched_slugs

    # Search for unique keyword in name
    res_unique = client.get("/api/v1/destinations?q=Chaithanya")
    assert res_unique.status_code == 200
    assert res_unique.json()["total"] == 1
    assert res_unique.json()["items"][0]["slug"] == "villa-chaithanya"

    # Search by building name
    res_bldg = client.get("/api/v1/destinations?q=Main Hospital Block")
    assert res_bldg.status_code == 200
    data_bldg = res_bldg.json()
    assert data_bldg["total"] >= 3


def test_destination_category_filter(client, db_session):
    """Verify category filtering returns only matching destinations."""
    seed_destinations(db_session)

    res = client.get("/api/v1/destinations?category=yoga")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 3
    for item in data["items"]:
        assert item["category"] == "yoga"


def test_destination_by_id(client, db_session):
    """Verify fetching a destination by its primary key ID."""
    seed_destinations(db_session)
    dest = db_session.query(Destination).filter(Destination.slug == "reception").first()

    res = client.get(f"/api/v1/destinations/{dest.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == dest.id
    assert data["name"] == "Reception"
    assert data["building_name"] == "Main Hospital Block (A Block)"


def test_destination_by_slug(client, db_session):
    """Verify fetching a destination by unique slug."""
    seed_destinations(db_session)

    res = client.get("/api/v1/destinations/slug/main-entrance-gate")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "main-entrance-gate"
    assert data["category"] == "entrance"


def test_destination_not_found(client, db_session):
    """Verify 404 is returned when destination ID or slug does not exist."""
    res_id = client.get("/api/v1/destinations/999999")
    assert res_id.status_code == 404

    res_slug = client.get("/api/v1/destinations/slug/non-existent-location")
    assert res_slug.status_code == 404


def test_inactive_destination_hidden(client, db_session):
    """Verify inactive destinations are excluded from listing and return 404 on direct lookup."""
    seed_destinations(db_session)
    dest = db_session.query(Destination).filter(Destination.slug == "swimming-pool").first()
    dest.is_active = False
    db_session.commit()

    # Should not appear in active list
    res_list = client.get("/api/v1/destinations?q=Swimming")
    assert res_list.status_code == 200
    assert res_list.json()["total"] == 0

    # Direct ID lookup returns 404
    res_id = client.get(f"/api/v1/destinations/{dest.id}")
    assert res_id.status_code == 404

    # Direct slug lookup returns 404
    res_slug = client.get(f"/api/v1/destinations/slug/{dest.slug}")
    assert res_slug.status_code == 404
