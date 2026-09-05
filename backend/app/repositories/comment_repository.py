"""Comment repository for database operations."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.comment import Comment


class CommentRepository:
    @staticmethod
    def get_by_id(db: Session, comment_id: str) -> Optional[Comment]:
        stmt = (
            select(Comment)
            .where(Comment.id == comment_id)
            .options(joinedload(Comment.author))
        )
        return db.scalars(stmt).first()

    @staticmethod
    def get_by_issue_id(db: Session, issue_id: str) -> List[Comment]:
        stmt = (
            select(Comment)
            .where(Comment.issue_id == issue_id)
            .options(joinedload(Comment.author))
            .order_by(Comment.created_at.asc())
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def create(db: Session, *, issue_id: str, author_id: str, content: str) -> Comment:
        comment = Comment(
            issue_id=issue_id,
            author_id=author_id,
            content=content.strip(),
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return CommentRepository.get_by_id(db, comment.id) or comment
