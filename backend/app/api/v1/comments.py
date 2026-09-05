"""Comment endpoints for issues."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.comment import CommentCreateRequest, CommentResponse
from app.services.comment_service import CommentService

router = APIRouter(prefix="/issues/{issue_id}/comments", tags=["Comments"])


@router.get(
    "",
    response_model=List[CommentResponse],
    status_code=status.HTTP_200_OK,
    summary="List comments for an issue",
    description="Returns chronological comments for the issue. Enforces ownership: students can only see comments on their own issues.",
)
def get_comments(
    issue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CommentResponse]:
    return CommentService.get_comments(db, issue_id, current_user)


@router.post(
    "",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a comment to an issue",
    description="Adds a comment to the specified issue. Students may comment on their own issues; admins may comment on any issue.",
)
def create_comment(
    issue_id: str,
    request: CommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentResponse:
    return CommentService.create_comment(db, issue_id, request, current_user)
