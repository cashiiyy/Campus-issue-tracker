"""User repository for database access operations."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.enums import UserRole


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.get(User, user_id)

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower().strip())
        return db.scalars(stmt).first()

    @staticmethod
    def create(db: Session, *, name: str, email: str, password_hash: str, role: UserRole = UserRole.STUDENT) -> User:
        user = User(
            name=name.strip(),
            email=email.lower().strip(),
            password_hash=password_hash,
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_by_role(db: Session, role: UserRole) -> List[User]:
        stmt = select(User).where(User.role == role).order_by(User.name.asc())
        return list(db.scalars(stmt).all())
