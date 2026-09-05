"""Schemas package exporting all request/response models."""

from app.schemas.common import (
    PaginationParams,
    PaginatedResponse,
    ErrorResponse,
    ErrorBody,
    ErrorDetail,
    MessageResponse,
)
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    UserBriefResponse,
    TokenResponse,
)
from app.schemas.team import (
    TeamCreateRequest,
    TeamResponse,
)
from app.schemas.comment import (
    CommentCreateRequest,
    CommentResponse,
)
from app.schemas.issue import (
    IssueCreateRequest,
    IssueUpdateRequest,
    IssueStatusUpdateRequest,
    IssuePriorityUpdateRequest,
    IssueAssignmentUpdateRequest,
    IssueResponse,
    IssueDetailResponse,
)
from app.schemas.stats import (
    AdminDashboardStatsResponse,
)

__all__ = [
    "PaginationParams",
    "PaginatedResponse",
    "ErrorResponse",
    "ErrorBody",
    "ErrorDetail",
    "MessageResponse",
    "UserRegisterRequest",
    "UserLoginRequest",
    "UserResponse",
    "UserBriefResponse",
    "TokenResponse",
    "TeamCreateRequest",
    "TeamResponse",
    "CommentCreateRequest",
    "CommentResponse",
    "IssueCreateRequest",
    "IssueUpdateRequest",
    "IssueStatusUpdateRequest",
    "IssuePriorityUpdateRequest",
    "IssueAssignmentUpdateRequest",
    "IssueResponse",
    "IssueDetailResponse",
    "AdminDashboardStatsResponse",
]
