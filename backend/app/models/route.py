from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RouteNode(Base):
    __tablename__ = "route_nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    node_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    map_x: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    map_y: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    outgoing_edges: Mapped[List["RouteEdge"]] = relationship(
        "RouteEdge",
        foreign_keys="[RouteEdge.from_node_id]",
        back_populates="from_node",
        cascade="all, delete-orphan",
    )
    incoming_edges: Mapped[List["RouteEdge"]] = relationship(
        "RouteEdge",
        foreign_keys="[RouteEdge.to_node_id]",
        back_populates="to_node",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<RouteNode id={self.id} name={self.name!r} type={self.node_type!r}>"


class RouteEdge(Base):
    __tablename__ = "route_edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    from_node_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("route_nodes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    to_node_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("route_nodes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    distance_meters: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    travel_mode: Mapped[str] = mapped_column(
        String(50),
        default="walk",
        nullable=False,
        index=True,
    )
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    from_node: Mapped["RouteNode"] = relationship(
        "RouteNode",
        foreign_keys=[from_node_id],
        back_populates="outgoing_edges",
    )
    to_node: Mapped["RouteNode"] = relationship(
        "RouteNode",
        foreign_keys=[to_node_id],
        back_populates="incoming_edges",
    )

    __table_args__ = (
        CheckConstraint(
            "from_node_id != to_node_id",
            name="check_prevent_self_connection",
        ),
        Index("ix_route_edges_from_to", "from_node_id", "to_node_id"),
        Index("ix_route_edges_mode_verified", "travel_mode", "is_verified"),
    )

    def __repr__(self) -> str:
        return (
            f"<RouteEdge id={self.id} from={self.from_node_id} "
            f"to={self.to_node_id} mode={self.travel_mode!r}>"
        )
