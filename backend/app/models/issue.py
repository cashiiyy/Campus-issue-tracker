"""Issue model definition."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import IssueCategory, IssuePriority, IssueStatus


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(
        Enum(IssueCategory, name="issue_category", native_enum=False),
        nullable=False,
        index=True,
    )
    location = Column(String(200), nullable=False)
    priority = Column(
        Enum(IssuePriority, name="issue_priority", native_enum=False),
        default=IssuePriority.MEDIUM,
        nullable=False,
        index=True,
    )
    status = Column(
        Enum(IssueStatus, name="issue_status", native_enum=False),
        default=IssueStatus.OPEN,
        nullable=False,
        index=True,
    )
    created_by = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_to = Column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    assigned_team = Column(
        String(36),
        ForeignKey("teams.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    creator = relationship(
        "User",
        back_populates="created_issues",
        foreign_keys=[created_by],
    )
    assignee = relationship(
        "User",
        back_populates="assigned_issues",
        foreign_keys=[assigned_to],
    )
    team = relationship(
        "Team",
        back_populates="issues",
        foreign_keys=[assigned_team],
    )
    comments = relationship(
        "Comment",
        back_populates="issue",
        cascade="all, delete-orphan",
        order_by="Comment.created_at.asc()",
    )

    def __repr__(self) -> str:
        return f"<Issue {self.id}: {self.title} ({self.status.value})>"
