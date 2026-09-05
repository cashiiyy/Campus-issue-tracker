"""Authentication and User schemas."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.models.enums import UserRole


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of student or staff")
    email: EmailStr = Field(..., description="Valid institutional or personal email")
    password: str = Field(..., min_length=8, max_length=100, description="Password with minimum 8 characters")

    @field_validator("name")
    @classmethod
    def strip_and_validate_name(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 2:
            raise ValueError("Name must be at least 2 characters after trimming.")
        return stripped

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBriefResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
