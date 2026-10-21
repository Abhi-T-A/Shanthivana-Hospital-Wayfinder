from app.models.route import RouteEdge, RouteNode


def setup_sample_network(db_session):
    """
    Sets up a small test network:
    Node 1 (Entrance, verified)
    Node 2 (Junction A, verified)
    Node 3 (Reception, verified)
    Node 4 (Garden Path, unverified)
    Node 5 (Isolated Temple, verified)
    Node 6 (Unmeasurable Path Node, verified)

    Edges:
    1 -> 2: 50.0m walk, verified
    2 -> 3: 40.0m walk, verified
    1 -> 3: 120.0m walk, verified (longer path)
    1 -> 2: 50.0m vehicle, verified
    2 -> 4: 30.0m walk, unverified
    4 -> 3: 20.0m walk, verified
    2 -> 6: None distance walk, verified (unmeasurable)
    6 -> 3: 10.0m walk, verified
    """
    n1 = RouteNode(name="Main Gate", node_type="entrance", is_verified=True)
    n2 = RouteNode(name="Central Junction", node_type="junction", is_verified=True)
    n3 = RouteNode(name="Hospital Entrance", node_type="building_entrance", is_verified=True)
    n4 = RouteNode(name="Garden Path", node_type="pathway_point", is_verified=False)
    n5 = RouteNode(name="Isolated Spot", node_type="pathway_point", is_verified=True)
    n6 = RouteNode(name="Unmeasured Node", node_type="pathway_point", is_verified=True)

    db_session.add_all([n1, n2, n3, n4, n5, n6])
    db_session.commit()

    # Edges
    e1 = RouteEdge(
        from_node_id=n1.id,
        to_node_id=n2.id,
        distance_meters=50.0,
        travel_mode="walk",
        is_verified=True,
    )
    e2 = RouteEdge(
        from_node_id=n2.id,
        to_node_id=n3.id,
        distance_meters=40.0,
        travel_mode="walk",
        is_verified=True,
    )
    e3 = RouteEdge(
        from_node_id=n1.id,
        to_node_id=n3.id,
        distance_meters=120.0,
        travel_mode="walk",
        is_verified=True,
    )
    e4 = RouteEdge(
        from_node_id=n1.id,
        to_node_id=n2.id,
        distance_meters=50.0,
        travel_mode="vehicle",
        is_verified=True,
    )
    e5_unverified = RouteEdge(
        from_node_id=n2.id,
        to_node_id=n4.id,
        distance_meters=30.0,
        travel_mode="walk",
        is_verified=False,
    )
    e6 = RouteEdge(
        from_node_id=n4.id,
        to_node_id=n3.id,
        distance_meters=20.0,
        travel_mode="walk",
        is_verified=True,
    )
    e7_null_distance = RouteEdge(
        from_node_id=n2.id,
        to_node_id=n6.id,
        distance_meters=None,
        travel_mode="walk",
        is_verified=True,
    )
    e8 = RouteEdge(
        from_node_id=n6.id,
        to_node_id=n3.id,
        distance_meters=10.0,
        travel_mode="walk",
        is_verified=True,
    )

    db_session.add_all([e1, e2, e3, e4, e5_unverified, e6, e7_null_distance, e8])
    db_session.commit()

    return {"n1": n1, "n2": n2, "n3": n3, "n4": n4, "n5": n5, "n6": n6}


def test_list_route_nodes(client, db_session):
    """Verify route nodes listing and verified_only filter."""
    nodes = setup_sample_network(db_session)

    # All nodes
    res_all = client.get("/api/v1/routes/nodes")
    assert res_all.status_code == 200
    assert res_all.json()["total"] == 6

    # Verified only nodes
    res_verified = client.get("/api/v1/routes/nodes?verified_only=true")
    assert res_verified.status_code == 200
    assert res_verified.json()["total"] == 5
    for item in res_verified.json()["items"]:
        assert item["is_verified"] is True


def test_list_route_edges(client, db_session):
    """Verify route edges listing and verified_only filter."""
    setup_sample_network(db_session)

    # All edges
    res_all = client.get("/api/v1/routes/edges")
    assert res_all.status_code == 200
    assert res_all.json()["total"] == 8

    # Verified only edges
    res_verified = client.get("/api/v1/routes/edges?verified_only=true")
    assert res_verified.status_code == 200
    assert res_verified.json()["total"] == 7
    for item in res_verified.json()["items"]:
        assert item["is_verified"] is True


def test_find_shortest_path_verified(client, db_session):
    """Verify Dijkstra finds the shortest verified path (1 -> 2 -> 3: 90.0m rather than 1 -> 3: 120.0m)."""
    nodes = setup_sample_network(db_session)
    n1, n3 = nodes["n1"], nodes["n3"]

    payload = {
        "source_node_id": n1.id,
        "destination_node_id": n3.id,
        "travel_mode": "walk",
    }
    res = client.post("/api/v1/routes/find", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["source_node_id"] == n1.id
    assert data["destination_node_id"] == n3.id
    assert data["travel_mode"] == "walk"
    assert data["total_distance_meters"] == 90.0
    assert data["path_node_ids"] == [n1.id, nodes["n2"].id, n3.id]
    assert len(data["path_nodes"]) == 3
    assert data["verified"] is True


def test_find_route_disconnected(client, db_session):
    """Verify 404 is returned when no verified path exists to an isolated node."""
    nodes = setup_sample_network(db_session)
    n1, n5 = nodes["n1"], nodes["n5"]

    payload = {
        "source_node_id": n1.id,
        "destination_node_id": n5.id,
        "travel_mode": "walk",
    }
    res = client.post("/api/v1/routes/find", json=payload)
    assert res.status_code == 404
    assert "No verified route" in res.json()["detail"]


def test_find_route_invalid_node_ids(client, db_session):
    """Verify 404 is returned when source or destination node does not exist."""
    nodes = setup_sample_network(db_session)
    n1 = nodes["n1"]

    res1 = client.post("/api/v1/routes/find", json={"source_node_id": 99999, "destination_node_id": n1.id})
    assert res1.status_code == 404

    res2 = client.post("/api/v1/routes/find", json={"source_node_id": n1.id, "destination_node_id": 99999})
    assert res2.status_code == 404


def test_find_route_unverified_node_rejected(client, db_session):
    """Verify route finding rejects unverified nodes with 400 Bad Request."""
    nodes = setup_sample_network(db_session)
    n1, n4 = nodes["n1"], nodes["n4"]

    res = client.post(
        "/api/v1/routes/find",
        json={"source_node_id": n1.id, "destination_node_id": n4.id, "travel_mode": "walk"},
    )
    assert res.status_code == 400
    assert "not ground-truth verified" in res.json()["detail"]


def test_find_route_unsupported_travel_mode(client, db_session):
    """Verify unsupported travel modes are rejected with 400 Bad Request."""
    nodes = setup_sample_network(db_session)
    n1, n3 = nodes["n1"], nodes["n3"]

    res = client.post(
        "/api/v1/routes/find",
        json={"source_node_id": n1.id, "destination_node_id": n3.id, "travel_mode": "airplane"},
    )
    assert res.status_code == 400
    assert "Unsupported travel mode" in res.json()["detail"]


def test_find_route_travel_mode_filtering(client, db_session):
    """Verify pathfinding respects mode: vehicle path exists to n2, but not to n3 in test setup."""
    nodes = setup_sample_network(db_session)
    n1, n2, n3 = nodes["n1"], nodes["n2"], nodes["n3"]

    # Vehicle route 1 -> 2 exists
    res_veh = client.post(
        "/api/v1/routes/find",
        json={"source_node_id": n1.id, "destination_node_id": n2.id, "travel_mode": "vehicle"},
    )
    assert res_veh.status_code == 200
    assert res_veh.json()["total_distance_meters"] == 50.0

    # Vehicle route 1 -> 3 does not exist (only walk edges exist to n3)
    res_veh_missing = client.post(
        "/api/v1/routes/find",
        json={"source_node_id": n1.id, "destination_node_id": n3.id, "travel_mode": "vehicle"},
    )
    assert res_veh_missing.status_code == 404


def test_find_route_safe_weighting_skips_null_distance(client, db_session):
    """
    Verify safe weighting policy:
    Even though 2 -> 6 (null distance) -> 3 (10m) looks like an edge, it is skipped because
    null distance cannot be safely traversed.
    """
    nodes = setup_sample_network(db_session)
    n2, n3 = nodes["n2"], nodes["n3"]

    res = client.post(
        "/api/v1/routes/find",
        json={"source_node_id": n2.id, "destination_node_id": n3.id, "travel_mode": "walk"},
    )
    assert res.status_code == 200
    # The path should be direct 2 -> 3 with distance 40.0m, NOT through node 6!
    assert res.json()["total_distance_meters"] == 40.0
    assert res.json()["path_node_ids"] == [n2.id, n3.id]


def test_find_route_same_source_and_destination(client, db_session):
    """Verify trivial path when source == destination."""
    nodes = setup_sample_network(db_session)
    n1 = nodes["n1"]

    res = client.post(
        "/api/v1/routes/find",
        json={"source_node_id": n1.id, "destination_node_id": n1.id, "travel_mode": "walk"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_distance_meters"] == 0.0
    assert data["path_node_ids"] == [n1.id]
