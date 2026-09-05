"""Admin-specific issue management and metrics endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.auth import require_admin
from app.dependencies.database import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserBriefResponse
from app.schemas.issue import (
    IssueAssignmentUpdateRequest,
    IssueDetailResponse,
    IssuePriorityUpdateRequest,
    IssueStatusUpdateRequest,
)
from app.schemas.stats import AdminDashboardStatsResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get(
    "/stats",
    response_model=AdminDashboardStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin dashboard statistics",
    description="Returns aggregate KPI metrics, category/status/priority distributions, and recent issues.",
)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> AdminDashboardStatsResponse:
    return AdminService.get_dashboard_stats(db)


@router.patch(
    "/issues/{issue_id}/status",
    response_model=IssueDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update issue status (Admin only)",
    description="Transitions the lifecycle status of an issue (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).",
)
def update_issue_status(
    issue_id: str,
    request: IssueStatusUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> IssueDetailResponse:
    return AdminService.update_status(db, issue_id, request)


@router.patch(
    "/issues/{issue_id}/priority",
    response_model=IssueDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update issue priority (Admin only)",
    description="Changes the administrative priority level (LOW, MEDIUM, HIGH, CRITICAL).",
)
def update_issue_priority(
    issue_id: str,
    request: IssuePriorityUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> IssueDetailResponse:
    return AdminService.update_priority(db, issue_id, request)


@router.patch(
    "/issues/{issue_id}/assignment",
    response_model=IssueDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign issue to person and/or team (Admin only)",
    description="Assigns an issue to a staff member and/or campus department team.",
)
def update_issue_assignment(
    issue_id: str,
    request: IssueAssignmentUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> IssueDetailResponse:
    return AdminService.update_assignment(db, issue_id, request)


@router.get(
    "/staff",
    response_model=List[UserBriefResponse],
    status_code=status.HTTP_200_OK,
    summary="List staff/admin users for assignment (Admin only)",
    description="Returns a list of administrative and staff users eligible to be assigned issues.",
)
def list_staff(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> List[UserBriefResponse]:
    staff_users = UserRepository.list_by_role(db, UserRole.ADMIN)
    return [UserBriefResponse.model_validate(u) for u in staff_users]
