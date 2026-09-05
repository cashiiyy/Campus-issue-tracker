"""Issue reporting, viewing, and modification endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.enums import IssueCategory, IssuePriority, IssueStatus
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.issue import (
    IssueCreateRequest,
    IssueDetailResponse,
    IssueResponse,
    IssueUpdateRequest,
)
from app.services.issue_service import IssueService

router = APIRouter(prefix="/issues", tags=["Issues"])


@router.post(
    "",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new campus issue",
    description="Allows an authenticated student or staff to report a problem on campus.",
)
def create_issue(
    request: IssueCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IssueResponse:
    return IssueService.create_issue(db, request, current_user)


@router.get(
    "/stats/summary",
    status_code=status.HTTP_200_OK,
    summary="Get issue count summary for current user",
    description="Returns aggregate counts (total, open, in progress, resolved, closed) for the current user's issues.",
)
def get_student_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return IssueService.get_student_dashboard_stats(db, current_user)


@router.get(
    "",
    response_model=PaginatedResponse[IssueResponse],
    status_code=status.HTTP_200_OK,
    summary="List issues with search, filters, and pagination",
    description="Returns a paginated list of issues. Students automatically see only their own issues. Admins see all issues.",
)
def list_issues(
    search: Optional[str] = Query(None, description="Search query matching title, description, or location"),
    category: Optional[IssueCategory] = Query(None, description="Filter by issue category"),
    status: Optional[IssueStatus] = Query(None, description="Filter by lifecycle status"),
    priority: Optional[IssuePriority] = Query(None, description="Filter by urgency priority"),
    assigned_team: Optional[str] = Query(None, description="Filter by assigned team UUID"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user UUID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse[IssueResponse]:
    return IssueService.list_issues(
        db,
        current_user,
        search=search,
        category=category,
        status=status,
        priority=priority,
        assigned_team=assigned_team,
        assigned_to=assigned_to,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{issue_id}",
    response_model=IssueDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get issue details",
    description="Returns issue details including associated comments. Enforces ownership: students can only access their own issues (403 Forbidden otherwise).",
)
def get_issue(
    issue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IssueDetailResponse:
    return IssueService.get_issue(db, issue_id, current_user)


@router.patch(
    "/{issue_id}",
    response_model=IssueDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an issue",
    description="Allows students to modify their own issues (if not RESOLVED or CLOSED). Admins can also update issues.",
)
def update_issue(
    issue_id: str,
    request: IssueUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IssueDetailResponse:
    return IssueService.update_issue(db, issue_id, request, current_user)
