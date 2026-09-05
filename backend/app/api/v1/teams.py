"""Campus teams endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, require_admin
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.team import TeamCreateRequest, TeamResponse
from app.services.team_service import TeamService

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get(
    "",
    response_model=List[TeamResponse],
    status_code=status.HTTP_200_OK,
    summary="List all campus teams",
    description="Returns all campus maintenance and operational teams (Facilities, IT, Electrical, etc.).",
)
def list_teams(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> List[TeamResponse]:
    return TeamService.list_teams(db)


@router.post(
    "",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new campus team (Admin only)",
    description="Creates a new department team in the directory.",
)
def create_team(
    request: TeamCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> TeamResponse:
    return TeamService.create_team(db, request)
