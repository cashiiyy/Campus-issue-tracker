"""Dependencies package exporting auth and database helpers."""

from app.dependencies.database import get_db
from app.dependencies.auth import (
    get_current_user,
    require_role,
    require_admin,
    require_student,
)

__all__ = [
    "get_db",
    "get_current_user",
    "require_role",
    "require_admin",
    "require_student",
]
