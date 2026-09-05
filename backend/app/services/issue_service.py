"""Issue business logic and ownership authorization service."""

import math
from typing import Optional
from sqlalchemy.orm import Session

from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.models.enums import IssueCategory, IssuePriority, IssueStatus, UserRole
from app.models.user import User
from app.repositories.issue_repository import IssueRepository
from app.schemas.common import PaginatedResponse
from app.schemas.issue import (
    IssueCreateRequest,
    IssueDetailResponse,
    IssueResponse,
    IssueUpdateRequest,
)


class IssueService:
    @staticmethod
    def create_issue(
        db: Session,
        request: IssueCreateRequest,
        current_user: User,
    ) -> IssueResponse:
        """Create a new issue reported by the current user."""
        issue = IssueRepository.create(
            db,
            title=request.title,
            description=request.description,
            category=request.category,
            location=request.location,
            priority=request.priority,
            created_by=current_user.id,
        )
        return IssueService._to_issue_response(issue)

    @staticmethod
    def list_issues(
        db: Session,
        current_user: User,
        *,
        search: Optional[str] = None,
        category: Optional[IssueCategory] = None,
        status: Optional[IssueStatus] = None,
        priority: Optional[IssuePriority] = None,
        assigned_team: Optional[str] = None,
        assigned_to: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[IssueResponse]:
        """List issues with search, filters, and pagination.
        
        Strict ownership scoping: Students can ONLY view their own issues.
        Admins can view all issues across the university.
        """
        created_by_filter = None
        if current_user.role == UserRole.STUDENT:
            created_by_filter = current_user.id

        items, total = IssueRepository.list_filtered(
            db,
            search=search,
            category=category,
            status=status,
            priority=priority,
            assigned_team=assigned_team,
            assigned_to=assigned_to,
            created_by=created_by_filter,
            page=page,
            page_size=page_size,
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1
        response_items = [IssueService._to_issue_response(item) for item in items]

        return PaginatedResponse[IssueResponse](
            items=response_items,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    @staticmethod
    def get_issue(
        db: Session,
        issue_id: str,
        current_user: User,
    ) -> IssueDetailResponse:
        """Get issue details with strict ownership verification."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        # RBAC and Ownership check
        if current_user.role != UserRole.ADMIN and issue.created_by != current_user.id:
            raise ForbiddenException(
                message="You do not have permission to view this issue.",
                code="NOT_ISSUE_OWNER",
            )

        return IssueService._to_issue_detail_response(issue)

    @staticmethod
    def update_issue(
        db: Session,
        issue_id: str,
        request: IssueUpdateRequest,
        current_user: User,
    ) -> IssueDetailResponse:
        """Edit an existing issue with ownership and lifecycle state checks."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        # Ownership enforcement
        if current_user.role != UserRole.ADMIN and issue.created_by != current_user.id:
            raise ForbiddenException(
                message="You cannot modify an issue that you did not create.",
                code="NOT_ISSUE_OWNER",
            )

        # Business rule: Students cannot edit locked issues (RESOLVED or CLOSED)
        if current_user.role == UserRole.STUDENT and issue.status in [
            IssueStatus.RESOLVED,
            IssueStatus.CLOSED,
        ]:
            raise BadRequestException(
                message=f"Cannot edit an issue that is already marked as {issue.status.value}.",
                code="ISSUE_LOCKED",
            )

        update_data = request.model_dump(exclude_unset=True)
        updated_issue = IssueRepository.update(db, issue, update_data)
        return IssueService._to_issue_detail_response(updated_issue)

    @staticmethod
    def get_student_dashboard_stats(db: Session, current_user: User) -> dict:
        """Fetch summary statistics for the student's personal dashboard."""
        status_counts = IssueRepository.get_status_counts(db, created_by=current_user.id)
        total = sum(status_counts.values())

        return {
            "total_issues": total,
            "open_issues": status_counts.get(IssueStatus.OPEN.value, 0),
            "in_progress_issues": status_counts.get(IssueStatus.IN_PROGRESS.value, 0),
            "resolved_issues": status_counts.get(IssueStatus.RESOLVED.value, 0),
            "closed_issues": status_counts.get(IssueStatus.CLOSED.value, 0),
        }

    @staticmethod
    def _to_issue_response(issue) -> IssueResponse:
        resp = IssueResponse.model_validate(issue)
        resp.comment_count = len(issue.comments) if issue.comments else 0
        return resp

    @staticmethod
    def _to_issue_detail_response(issue) -> IssueDetailResponse:
        resp = IssueDetailResponse.model_validate(issue)
        resp.comment_count = len(issue.comments) if issue.comments else 0
        return resp
