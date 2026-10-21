import heapq
from collections import defaultdict
from typing import Dict, List, Set, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.route import RouteEdge, RouteNode
from app.schemas.route import RouteFindResponse, RouteNodeResponse

SUPPORTED_TRAVEL_MODES = {"walk", "vehicle"}


def find_shortest_path(
    db: Session,
    source_node_id: int,
    destination_node_id: int,
    travel_mode: str = "walk",
) -> RouteFindResponse:
    """
    Finds the shortest verified path between two campus route nodes using Dijkstra's algorithm.

    ROUTE WEIGHTING POLICY:
    - Only verified nodes (is_verified=True) and verified edges (is_verified=True) are used.
    - Edges must strictly match the requested travel_mode.
    - If distance_meters is None or <= 0, the edge is considered unmeasurable and cannot be
      safely traversed. It is excluded from the graph to prevent artificial zero-cost teleports
      or inaccurate visitor navigation.
    """
    mode = travel_mode.lower().strip()
    if mode not in SUPPORTED_TRAVEL_MODES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported travel mode '{travel_mode}'. "
                f"Supported modes are: {sorted(list(SUPPORTED_TRAVEL_MODES))}"
            ),
        )

    # Validate source node exists
    source_node = db.query(RouteNode).filter(RouteNode.id == source_node_id).first()
    if not source_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source route node {source_node_id} does not exist.",
        )

    # Validate destination node exists
    dest_node = db.query(RouteNode).filter(RouteNode.id == destination_node_id).first()
    if not dest_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination route node {destination_node_id} does not exist.",
        )

    # Verification checks
    if not source_node.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Source node '{source_node.name}' (id={source_node_id}) is not ground-truth verified.",
        )
    if not dest_node.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Destination node '{dest_node.name}' (id={destination_node_id}) is not ground-truth verified.",
        )

    # Trivial path
    if source_node_id == destination_node_id:
        node_dto = RouteNodeResponse.model_validate(source_node)
        return RouteFindResponse(
            source_node_id=source_node_id,
            destination_node_id=destination_node_id,
            travel_mode=mode,
            total_distance_meters=0.0,
            path_node_ids=[source_node_id],
            path_nodes=[node_dto],
            verified=True,
        )

    # Query all verified nodes
    verified_node_rows = (
        db.query(RouteNode.id).filter(RouteNode.is_verified.is_(True)).all()
    )
    verified_node_ids: Set[int] = {row[0] for row in verified_node_rows}

    # Query all verified edges with valid positive distances for this mode
    edges = (
        db.query(RouteEdge)
        .filter(
            RouteEdge.is_verified.is_(True),
            RouteEdge.travel_mode == mode,
            RouteEdge.distance_meters.isnot(None),
            RouteEdge.distance_meters > 0,
        )
        .all()
    )

    # Build adjacency graph
    graph: Dict[int, List[Tuple[int, float]]] = defaultdict(list)
    for edge in edges:
        if edge.from_node_id in verified_node_ids and edge.to_node_id in verified_node_ids:
            graph[edge.from_node_id].append((edge.to_node_id, float(edge.distance_meters)))

    # Dijkstra's Algorithm
    distances: Dict[int, float] = {source_node_id: 0.0}
    previous: Dict[int, int] = {}
    pq: List[Tuple[float, int]] = [(0.0, source_node_id)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if current_distance > distances.get(current_node, float("inf")):
            continue

        if current_node == destination_node_id:
            break

        for neighbor, weight in graph[current_node]:
            distance = current_distance + weight
            if distance < distances.get(neighbor, float("inf")):
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    if destination_node_id not in distances:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No verified route is currently available between the requested locations for this travel mode.",
        )

    # Reconstruct path
    path_node_ids: List[int] = []
    curr: int | None = destination_node_id
    while curr is not None:
        path_node_ids.append(curr)
        curr = previous.get(curr)
    path_node_ids.reverse()

    # Load node objects in sequence
    nodes_by_id = {
        node.id: node
        for node in db.query(RouteNode).filter(RouteNode.id.in_(path_node_ids)).all()
    }
    path_nodes = [
        RouteNodeResponse.model_validate(nodes_by_id[nid])
        for nid in path_node_ids
        if nid in nodes_by_id
    ]

    return RouteFindResponse(
        source_node_id=source_node_id,
        destination_node_id=destination_node_id,
        travel_mode=mode,
        total_distance_meters=round(distances[destination_node_id], 2),
        path_node_ids=path_node_ids,
        path_nodes=path_nodes,
        verified=True,
    )
