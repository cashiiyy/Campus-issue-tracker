"""Authentication and user account service."""

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, NotFoundException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse


class AuthService:
    @staticmethod
    def register(db: Session, request: UserRegisterRequest) -> UserResponse:
        """Register a new student user."""
        existing_user = UserRepository.get_by_email(db, request.email)
        if existing_user:
            raise ConflictException(
                message=f"An account with email '{request.email}' already exists.",
                code="EMAIL_ALREADY_REGISTERED",
            )

        hashed_pw = hash_password(request.password)
        # Server forces role to STUDENT on public registration
        user = UserRepository.create(
            db,
            name=request.name,
            email=request.email,
            password_hash=hashed_pw,
            role=UserRole.STUDENT,
        )
        return UserResponse.model_validate(user)

    @staticmethod
    def login(db: Session, request: UserLoginRequest) -> TokenResponse:
        """Authenticate user and return JWT token."""
        user = UserRepository.get_by_email(db, request.email)
        if not user or not verify_password(request.password, user.password_hash):
            raise UnauthorizedException(
                message="Invalid email or password.",
                code="INVALID_CREDENTIALS",
            )

        token = create_access_token(
            subject=user.id,
            claims={
                "email": user.email,
                "role": user.role.value,
                "name": user.name,
            },
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def get_current_user_profile(db: Session, user_id: str) -> UserResponse:
        """Retrieve the profile of the current authenticated user."""
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise NotFoundException(resource="User", identifier=user_id)
        return UserResponse.model_validate(user)
