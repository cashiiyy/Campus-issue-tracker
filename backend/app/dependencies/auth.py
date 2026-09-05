"""Authentication and role-based access control dependencies."""

from typing import Callable, List, Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from app.dependencies.database import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that decodes bearer token and loads current authenticated user."""
    if not token:
        raise UnauthorizedException(
            message="Authentication credentials were not provided.",
            code="NOT_AUTHENTICATED",
        )

    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException(
            message="Invalid authentication payload.",
            code="INVALID_TOKEN",
        )

    user = UserRepository.get_by_id(db, str(user_id))
    if not user:
        raise UnauthorizedException(
            message="User associated with token no longer exists.",
            code="USER_NOT_FOUND",
        )

    return user


def require_role(allowed_roles: List[UserRole]) -> Callable:
    """Factory dependency that restricts endpoint access to specified roles."""

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            role_names = ", ".join([r.value for r in allowed_roles])
            raise ForbiddenException(
                message=f"Access forbidden: This action requires one of the following roles: {role_names}.",
                code="INSUFFICIENT_PERMISSIONS",
            )
        return current_user

    return role_checker


# Convenient role-specific dependencies
require_admin = require_role([UserRole.ADMIN])
require_student = require_role([UserRole.STUDENT, UserRole.ADMIN])
