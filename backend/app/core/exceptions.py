"""Custom domain exceptions and error schemas."""

from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception with standardized code and structure."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or []


class NotFoundException(AppException):
    """Resource not found (404)."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code=f"{resource.upper()}_NOT_FOUND",
            message=f"{resource} with identifier '{identifier}' was not found.",
        )


class ForbiddenException(AppException):
    """Access denied (403)."""

    def __init__(self, message: str = "You do not have permission to perform this action.", code: str = "FORBIDDEN"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code=code,
            message=message,
        )


class UnauthorizedException(AppException):
    """Authentication required or failed (401)."""

    def __init__(self, message: str = "Invalid credentials or expired session.", code: str = "UNAUTHORIZED"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=code,
            message=message,
        )


class ConflictException(AppException):
    """Resource conflict, e.g. duplicate email (409)."""

    def __init__(self, message: str, code: str = "RESOURCE_CONFLICT"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code=code,
            message=message,
        )


class BadRequestException(AppException):
    """Invalid business rule or request parameters (400)."""

    def __init__(self, message: str, code: str = "BAD_REQUEST", details: Optional[List[Dict[str, Any]]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=code,
            message=message,
            details=details,
        )


class ValidationException(AppException):
    """Validation failed (422)."""

    def __init__(self, message: str = "Validation failed for request data.", details: Optional[List[Dict[str, Any]]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )
