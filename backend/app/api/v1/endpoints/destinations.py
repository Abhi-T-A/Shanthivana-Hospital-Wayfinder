from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.destination import Destination
from app.schemas.destination import DestinationListResponse, DestinationResponse

router = APIRouter(prefix="/destinations", tags=["Destinations"])


@router.get("", response_model=DestinationListResponse)
def list_destinations(
    q: Optional[str] = Query(
        None,
        description="Search destinations by name, description, or building",
    ),
    category: Optional[str] = Query(
        None,
        description="Filter by location category",
    ),
    limit: int = Query(20, ge=1, le=100, description="Page size limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db),
):
    """
    List all active campus destinations with optional search, category filter, and pagination.
    """
    query = db.query(Destination).filter(Destination.is_active.is_(True))

    if category:
        query = query.filter(Destination.category.ilike(category.strip()))

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Destination.name.ilike(search_term),
                Destination.description.ilike(search_term),
                Destination.building_name.ilike(search_term),
            )
        )

    total = query.count()
    items = query.order_by(Destination.name.asc()).offset(offset).limit(limit).all()

    return DestinationListResponse(
        items=[DestinationResponse.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/slug/{slug}", response_model=DestinationResponse)
def get_destination_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve a single active campus destination by its unique slug.
    """
    destination = (
        db.query(Destination)
        .filter(Destination.slug == slug.strip(), Destination.is_active.is_(True))
        .first()
    )
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with slug '{slug}' not found or is inactive.",
        )
    return DestinationResponse.model_validate(destination)


@router.get("/{destination_id}", response_model=DestinationResponse)
def get_destination_by_id(
    destination_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve a single active campus destination by its ID.
    """
    destination = (
        db.query(Destination)
        .filter(Destination.id == destination_id, Destination.is_active.is_(True))
        .first()
    )
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {destination_id} not found or is inactive.",
        )
    return DestinationResponse.model_validate(destination)
