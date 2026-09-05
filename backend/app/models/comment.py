"""Comment model definition."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    issue_id = Column(
        String(36),
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = Column(Text, nullable=False)
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
    issue = relationship(
        "Issue",
        back_populates="comments",
        foreign_keys=[issue_id],
    )
    author = relationship(
        "User",
        back_populates="comments",
        foreign_keys=[author_id],
    )

    def __repr__(self) -> str:
        return f"<Comment {self.id} on Issue {self.issue_id}>"
