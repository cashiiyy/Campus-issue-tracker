"""Team repository for database access operations."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.team import Team


class TeamRepository:
    @staticmethod
    def get_by_id(db: Session, team_id: str) -> Optional[Team]:
        return db.get(Team, team_id)

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Team]:
        stmt = select(Team).where(Team.name == name.strip())
        return db.scalars(stmt).first()

    @staticmethod
    def list_all(db: Session) -> List[Team]:
        stmt = select(Team).order_by(Team.name.asc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create(db: Session, *, name: str, description: Optional[str] = None) -> Team:
        team = Team(name=name.strip(), description=description.strip() if description else None)
        db.add(team)
        db.commit()
        db.refresh(team)
        return team
