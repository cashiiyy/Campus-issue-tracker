"""Comment schemas."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.auth import UserBriefResponse


class CommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Comment message content")

    @field_validator("content")
    @classmethod
    def strip_and_validate_content(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Comment cannot be empty or whitespace only.")
        return stripped


class CommentResponse(BaseModel):
    id: str
    issue_id: str
    author_id: str
    content: str
    created_at: datetime
    updated_at: datetime
    author: UserBriefResponse

    model_config = ConfigDict(from_attributes=True)
