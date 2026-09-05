"""Administrative issue management and analytics service."""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.enums import IssuePriority, IssueStatus
from app.repositories.issue_repository import IssueRepository
from app.repositories.team_repository import TeamRepository
from app.repositories.user_repository import UserRepository
from app.schemas.issue import (
    IssueAssignmentUpdateRequest,
    IssueDetailResponse,
    IssuePriorityUpdateRequest,
    IssueResponse,
    IssueStatusUpdateRequest,
)
from app.schemas.stats import AdminDashboardStatsResponse


class AdminService:
    @staticmethod
    def update_status(
        db: Session,
        issue_id: str,
        request: IssueStatusUpdateRequest,
    ) -> IssueDetailResponse:
        """Admin updates issue status (e.g. OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED)."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        updated = IssueRepository.update(db, issue, {"status": request.status})
        resp = IssueDetailResponse.model_validate(updated)
        resp.comment_count = len(updated.comments) if updated.comments else 0
        return resp

    @staticmethod
    def update_priority(
        db: Session,
        issue_id: str,
        request: IssuePriorityUpdateRequest,
    ) -> IssueDetailResponse:
        """Admin changes issue priority."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        updated = IssueRepository.update(db, issue, {"priority": request.priority})
        resp = IssueDetailResponse.model_validate(updated)
        resp.comment_count = len(updated.comments) if updated.comments else 0
        return resp

    @staticmethod
    def update_assignment(
        db: Session,
        issue_id: str,
        request: IssueAssignmentUpdateRequest,
    ) -> IssueDetailResponse:
        """Admin assigns issue to a specific staff member and/or team."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        update_dict = {}

        if request.assigned_to is not None:
            if request.assigned_to != "":
                user = UserRepository.get_by_id(db, request.assigned_to)
                if not user:
                    raise NotFoundException(resource="User", identifier=request.assigned_to)
                update_dict["assigned_to"] = request.assigned_to
            else:
                update_dict["assigned_to"] = None

        if request.assigned_team is not None:
            if request.assigned_team != "":
                team = TeamRepository.get_by_id(db, request.assigned_team)
                if not team:
                    raise NotFoundException(resource="Team", identifier=request.assigned_team)
                update_dict["assigned_team"] = request.assigned_team
            else:
                update_dict["assigned_team"] = None

        updated = IssueRepository.update(db, issue, update_dict)
        resp = IssueDetailResponse.model_validate(updated)
        resp.comment_count = len(updated.comments) if updated.comments else 0
        return resp

    @staticmethod
    def get_dashboard_stats(db: Session) -> AdminDashboardStatsResponse:
        """Calculate and return system-wide dashboard statistics."""
        data = IssueRepository.get_dashboard_metrics(db)
        recent_resps = []
        for iss in data["recent_issues"]:
            r = IssueResponse.model_validate(iss)
            r.comment_count = len(iss.comments) if iss.comments else 0
            recent_resps.append(r)

        return AdminDashboardStatsResponse(
            total_issues=data["total_issues"],
            open_issues=data["open_issues"],
            in_progress_issues=data["in_progress_issues"],
            resolved_issues=data["resolved_issues"],
            closed_issues=data["closed_issues"],
            critical_issues=data["critical_issues"],
            by_category=data["by_category"],
            by_priority=data["by_priority"],
            by_status=data["by_status"],
            recent_issues=recent_resps,
        )
