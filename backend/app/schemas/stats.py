"""Statistics and analytics schemas for admin dashboard."""

from typing import Dict, List
from pydantic import BaseModel, ConfigDict
from app.schemas.issue import IssueResponse


class CategoryDistribution(BaseModel):
    category: str
    count: int


class PriorityDistribution(BaseModel):
    priority: str
    count: int


class StatusDistribution(BaseModel):
    status: str
    count: int


class AdminDashboardStatsResponse(BaseModel):
    total_issues: int
    open_issues: int
    in_progress_issues: int
    resolved_issues: int
    closed_issues: int
    critical_issues: int
    by_category: Dict[str, int]
    by_priority: Dict[str, int]
    by_status: Dict[str, int]
    recent_issues: List[IssueResponse]

    model_config = ConfigDict(from_attributes=True)
