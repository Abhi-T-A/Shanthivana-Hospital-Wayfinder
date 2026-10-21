from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.route import RouteEdge, RouteNode
from app.schemas.route import (
    RouteEdgeListResponse,
    RouteEdgeResponse,
    RouteFindRequest,
    RouteFindResponse,
    RouteNodeListResponse,
    RouteNodeResponse,
)
from app.services.routing import find_shortest_path

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.get("/nodes", response_model=RouteNodeListResponse)
def list_route_nodes(
    verified_only: bool = Query(
        False,
        description="Filter to ground-truth verified route nodes only",
    ),
    db: Session = Depends(get_db),
):
    """
    List route nodes with optional filtering to verified nodes.
    """
    query = db.query(RouteNode)
    if verified_only:
        query = query.filter(RouteNode.is_verified.is_(True))

    nodes = query.order_by(RouteNode.id.asc()).all()
    return RouteNodeListResponse(
        items=[RouteNodeResponse.model_validate(node) for node in nodes],
        total=len(nodes),
    )


@router.get("/edges", response_model=RouteEdgeListResponse)
def list_route_edges(
    verified_only: bool = Query(
        False,
        description="Filter to ground-truth verified route edges only",
    ),
    db: Session = Depends(get_db),
):
    """
    List route edges with optional filtering to verified connections.
    """
    query = db.query(RouteEdge)
    if verified_only:
        query = query.filter(RouteEdge.is_verified.is_(True))

    edges = query.order_by(RouteEdge.id.asc()).all()
    return RouteEdgeListResponse(
        items=[RouteEdgeResponse.model_validate(edge) for edge in edges],
        total=len(edges),
    )


@router.post("/find", response_model=RouteFindResponse)
def find_route(
    request: RouteFindRequest,
    db: Session = Depends(get_db),
):
    """
    Find the shortest verified route between two campus nodes using Dijkstra's algorithm.

    Weighting & Safety Policy:
    - Only verified nodes and verified edges are considered.
    - Edges without a positive distance (distance_meters is None or <= 0) are excluded.
    - If no verified route exists, returns 404.
    """
    return find_shortest_path(
        db=db,
        source_node_id=request.source_node_id,
        destination_node_id=request.destination_node_id,
        travel_mode=request.travel_mode,
    )
