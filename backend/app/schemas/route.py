from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class RouteNodeResponse(BaseModel):
    id: int
    name: str
    node_type: str
    map_x: Optional[float] = None
    map_y: Optional[float] = None
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RouteNodeListResponse(BaseModel):
    items: List[RouteNodeResponse]
    total: int


class RouteEdgeResponse(BaseModel):
    id: int
    from_node_id: int
    to_node_id: int
    distance_meters: Optional[float] = None
    travel_mode: str
    is_accessible: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RouteEdgeListResponse(BaseModel):
    items: List[RouteEdgeResponse]
    total: int


class RouteFindRequest(BaseModel):
    source_node_id: int = Field(..., description="Starting route node ID", gt=0)
    destination_node_id: int = Field(..., description="Target destination route node ID", gt=0)
    travel_mode: str = Field(
        default="walk",
        description="Mode of travel (e.g., 'walk', 'vehicle')",
    )


class RouteFindResponse(BaseModel):
    source_node_id: int
    destination_node_id: int
    travel_mode: str
    total_distance_meters: float
    path_node_ids: List[int]
    path_nodes: List[RouteNodeResponse]
    verified: bool = True
