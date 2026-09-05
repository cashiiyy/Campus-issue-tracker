"""Team service for listing and managing teams."""

from typing import List
from sqlalchemy.orm import Session

from app.repositories.team_repository import TeamRepository
from app.schemas.team import TeamCreateRequest, TeamResponse


class TeamService:
    @staticmethod
    def list_teams(db: Session) -> List[TeamResponse]:
        teams = TeamRepository.list_all(db)
        return [TeamResponse.model_validate(t) for t in teams]

    @staticmethod
    def create_team(db: Session, request: TeamCreateRequest) -> TeamResponse:
        team = TeamRepository.create(db, name=request.name, description=request.description)
        return TeamResponse.model_validate(team)
