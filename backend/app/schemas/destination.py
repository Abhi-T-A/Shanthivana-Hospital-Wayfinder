from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DestinationBase(BaseModel):
    name: str = Field(..., max_length=255, description="Official location name")
    slug: str = Field(..., max_length=255, description="Unique URL-friendly identifier")
    category: str = Field(..., max_length=100, description="Location category")
    description: Optional[str] = Field(None, description="Optional details or instructions")
    map_x: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Normalized X coordinate (0.0 to 1.0) on campus map",
    )
    map_y: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Normalized Y coordinate (0.0 to 1.0) on campus map",
    )
    building_name: Optional[str] = Field(
        None,
        max_length=255,
        description="Parent building or block name",
    )
    is_active: bool = Field(True, description="Whether location is actively available")
    is_verified: bool = Field(
        False,
        description="Whether physical location and coordinates have been ground-truth verified",
    )


class DestinationResponse(DestinationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DestinationListResponse(BaseModel):
    items: List[DestinationResponse]
    total: int
    limit: int
    offset: int
