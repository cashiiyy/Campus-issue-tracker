"""Authentication endpoints for registration, login, and identity verification."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student user",
    description="Creates a new student account. Role is automatically set to STUDENT server-side.",
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    return AuthService.register(db, request)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Log in with email and password",
    description="Authenticates credentials and issues a signed JWT access token.",
)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    return AuthService.login(db, request)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile information of the currently authenticated user.",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current_user)
