"""Issue request and response schemas with strict validation."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import IssueCategory, IssuePriority, IssueStatus
from app.schemas.auth import UserBriefResponse
from app.schemas.team import TeamResponse
from app.schemas.comment import CommentResponse


class IssueCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=150, description="Brief summary of campus issue")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed explanation of problem")
    category: IssueCategory = Field(..., description="Issue category")
    location: str = Field(..., min_length=2, max_length=200, description="Campus building, room, or area")
    priority: IssuePriority = Field(default=IssuePriority.MEDIUM, description="Urgency priority")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 5:
            raise ValueError("Title must be at least 5 characters after trimming whitespace.")
        if len(stripped) > 150:
            raise ValueError("Title cannot exceed 150 characters.")
        return stripped

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError("Description must be at least 10 characters after trimming whitespace.")
        if len(stripped) > 2000:
            raise ValueError("Description cannot exceed 2000 characters.")
        return stripped

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 2:
            raise ValueError("Location must be at least 2 characters after trimming whitespace.")
        if len(stripped) > 200:
            raise ValueError("Location cannot exceed 200 characters.")
        return stripped


class IssueUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=150)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[IssueCategory] = None
    location: Optional[str] = Field(None, min_length=2, max_length=200)
    priority: Optional[IssuePriority] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        if len(stripped) < 5:
            raise ValueError("Title must be at least 5 characters after trimming whitespace.")
        return stripped

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError("Description must be at least 10 characters after trimming whitespace.")
        return stripped

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        if len(stripped) < 2:
            raise ValueError("Location must be at least 2 characters after trimming whitespace.")
        return stripped


class IssueStatusUpdateRequest(BaseModel):
    status: IssueStatus = Field(..., description="Target status transition")


class IssuePriorityUpdateRequest(BaseModel):
    priority: IssuePriority = Field(..., description="Updated priority level")


class IssueAssignmentUpdateRequest(BaseModel):
    assigned_to: Optional[str] = Field(None, description="User UUID to assign issue to")
    assigned_team: Optional[str] = Field(None, description="Team UUID to assign issue to")


class IssueResponse(BaseModel):
    id: str
    title: str
    description: str
    category: IssueCategory
    location: str
    priority: IssuePriority
    status: IssueStatus
    created_by: str
    assigned_to: Optional[str] = None
    assigned_team: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Associated nested objects
    creator: Optional[UserBriefResponse] = None
    assignee: Optional[UserBriefResponse] = None
    team: Optional[TeamResponse] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class IssueDetailResponse(IssueResponse):
    comments: List[CommentResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
