"""API v1 master router aggregating all domain sub-routers."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.issues import router as issues_router
from app.api.v1.comments import router as comments_router
from app.api.v1.admin import router as admin_router
from app.api.v1.teams import router as teams_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(issues_router)
api_router.include_router(comments_router)
api_router.include_router(admin_router)
api_router.include_router(teams_router)
