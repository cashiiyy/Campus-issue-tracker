"""Issue repository for filtering, querying, and updating issues."""

from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.issue import Issue
from app.models.comment import Comment
from app.models.enums import IssueCategory, IssuePriority, IssueStatus


class IssueRepository:
    @staticmethod
    def get_by_id(db: Session, issue_id: str) -> Optional[Issue]:
        stmt = (
            select(Issue)
            .where(Issue.id == issue_id)
            .options(
                joinedload(Issue.creator),
                joinedload(Issue.assignee),
                joinedload(Issue.team),
                joinedload(Issue.comments).joinedload(Comment.author),
            )
        )
        return db.scalars(stmt).unique().first()

    @staticmethod
    def create(
        db: Session,
        *,
        title: str,
        description: str,
        category: IssueCategory,
        location: str,
        priority: IssuePriority,
        created_by: str,
    ) -> Issue:
        issue = Issue(
            title=title.strip(),
            description=description.strip(),
            category=category,
            location=location.strip(),
            priority=priority,
            status=IssueStatus.OPEN,
            created_by=created_by,
        )
        db.add(issue)
        db.commit()
        db.refresh(issue)
        # Reload with relationships
        return IssueRepository.get_by_id(db, issue.id) or issue

    @staticmethod
    def update(db: Session, issue: Issue, update_dict: Dict[str, Any]) -> Issue:
        for field, value in update_dict.items():
            if hasattr(issue, field) and value is not None:
                setattr(issue, field, value)
        db.commit()
        db.refresh(issue)
        return IssueRepository.get_by_id(db, issue.id) or issue

    @staticmethod
    def delete(db: Session, issue: Issue) -> None:
        db.delete(issue)
        db.commit()

    @staticmethod
    def list_filtered(
        db: Session,
        *,
        search: Optional[str] = None,
        category: Optional[IssueCategory] = None,
        status: Optional[IssueStatus] = None,
        priority: Optional[IssuePriority] = None,
        assigned_team: Optional[str] = None,
        assigned_to: Optional[str] = None,
        created_by: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Issue], int]:
        query = select(Issue).options(
            joinedload(Issue.creator),
            joinedload(Issue.assignee),
            joinedload(Issue.team),
        )

        conditions = []

        if created_by:
            conditions.append(Issue.created_by == created_by)
        if category:
            conditions.append(Issue.category == category)
        if status:
            conditions.append(Issue.status == status)
        if priority:
            conditions.append(Issue.priority == priority)
        if assigned_team:
            conditions.append(Issue.assigned_team == assigned_team)
        if assigned_to:
            conditions.append(Issue.assigned_to == assigned_to)

        if search:
            search_pattern = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Issue.title.ilike(search_pattern),
                    Issue.description.ilike(search_pattern),
                    Issue.location.ilike(search_pattern),
                )
            )

        if conditions:
            query = query.where(*conditions)

        # Count total
        count_stmt = select(func.count(Issue.id))
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total = db.scalar(count_stmt) or 0

        # Pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(Issue.created_at.desc()).offset(offset).limit(page_size)

        items = list(db.scalars(query).unique().all())
        return items, total

    @staticmethod
    def get_status_counts(db: Session, created_by: Optional[str] = None) -> Dict[str, int]:
        stmt = select(Issue.status, func.count(Issue.id))
        if created_by:
            stmt = stmt.where(Issue.created_by == created_by)
        stmt = stmt.group_by(Issue.status)
        results = db.execute(stmt).all()

        counts = {s.value: 0 for s in IssueStatus}
        for status_enum, count in results:
            val = status_enum.value if hasattr(status_enum, "value") else str(status_enum)
            counts[val] = count
        return counts

    @staticmethod
    def get_dashboard_metrics(db: Session) -> Dict[str, Any]:
        # Total
        total_stmt = select(func.count(Issue.id))
        total = db.scalar(total_stmt) or 0

        # Status counts
        status_stmt = select(Issue.status, func.count(Issue.id)).group_by(Issue.status)
        status_res = db.execute(status_stmt).all()
        by_status = {s.value: 0 for s in IssueStatus}
        for st, c in status_res:
            val = st.value if hasattr(st, "value") else str(st)
            by_status[val] = c

        # Priority counts
        priority_stmt = select(Issue.priority, func.count(Issue.id)).group_by(Issue.priority)
        priority_res = db.execute(priority_stmt).all()
        by_priority = {p.value: 0 for p in IssuePriority}
        for pr, c in priority_res:
            val = pr.value if hasattr(pr, "value") else str(pr)
            by_priority[val] = c

        # Category counts
        category_stmt = select(Issue.category, func.count(Issue.id)).group_by(Issue.category)
        category_res = db.execute(category_stmt).all()
        by_category = {cat.value: 0 for cat in IssueCategory}
        for cat, c in category_res:
            val = cat.value if hasattr(cat, "value") else str(cat)
            by_category[val] = c

        # Recent 5 issues
        recent_stmt = (
            select(Issue)
            .options(
                joinedload(Issue.creator),
                joinedload(Issue.assignee),
                joinedload(Issue.team),
            )
            .order_by(Issue.created_at.desc())
            .limit(5)
        )
        recent_issues = list(db.scalars(recent_stmt).unique().all())

        return {
            "total_issues": total,
            "open_issues": by_status.get(IssueStatus.OPEN.value, 0),
            "in_progress_issues": by_status.get(IssueStatus.IN_PROGRESS.value, 0),
            "resolved_issues": by_status.get(IssueStatus.RESOLVED.value, 0),
            "closed_issues": by_status.get(IssueStatus.CLOSED.value, 0),
            "critical_issues": by_priority.get(IssuePriority.CRITICAL.value, 0),
            "by_category": by_category,
            "by_priority": by_priority,
            "by_status": by_status,
            "recent_issues": recent_issues,
        }
