"""User model definition."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import UserRole


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum(UserRole, name="user_role", native_enum=False),
        default=UserRole.STUDENT,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    created_issues = relationship(
        "Issue",
        back_populates="creator",
        foreign_keys="Issue.created_by",
        cascade="all, delete-orphan",
    )
    assigned_issues = relationship(
        "Issue",
        back_populates="assignee",
        foreign_keys="Issue.assigned_to",
    )
    comments = relationship(
        "Comment",
        back_populates="author",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"
