"""Comment service for issue discussion threads."""

from typing import List
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.comment_repository import CommentRepository
from app.repositories.issue_repository import IssueRepository
from app.schemas.comment import CommentCreateRequest, CommentResponse


class CommentService:
    @staticmethod
    def get_comments(
        db: Session,
        issue_id: str,
        current_user: User,
    ) -> List[CommentResponse]:
        """Fetch all comments for an issue, verifying user has access to view the issue."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        # Authorization: Student must own the issue, Admin can view all
        if current_user.role != UserRole.ADMIN and issue.created_by != current_user.id:
            raise ForbiddenException(
                message="You do not have permission to view comments on this issue.",
                code="NOT_ISSUE_OWNER",
            )

        comments = CommentRepository.get_by_issue_id(db, issue_id)
        return [CommentResponse.model_validate(c) for c in comments]

    @staticmethod
    def create_comment(
        db: Session,
        issue_id: str,
        request: CommentCreateRequest,
        current_user: User,
    ) -> CommentResponse:
        """Add a comment to an issue thread."""
        issue = IssueRepository.get_by_id(db, issue_id)
        if not issue:
            raise NotFoundException(resource="Issue", identifier=issue_id)

        # Authorization: Student can only comment on own issue, Admin can comment on any issue
        if current_user.role != UserRole.ADMIN and issue.created_by != current_user.id:
            raise ForbiddenException(
                message="You do not have permission to comment on this issue.",
                code="NOT_ISSUE_OWNER",
            )

        comment = CommentRepository.create(
            db,
            issue_id=issue_id,
            author_id=current_user.id,
            content=request.content,
        )
        return CommentResponse.model_validate(comment)
