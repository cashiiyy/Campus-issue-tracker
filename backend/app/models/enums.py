"""System-wide domain enumerations."""

import enum


class UserRole(str, enum.Enum):
    """Roles for role-based access control."""
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"


class IssueCategory(str, enum.Enum):
    """Allowed issue categories across campus facilities and services."""
    INFRASTRUCTURE = "Infrastructure"
    CLEANLINESS = "Cleanliness"
    ELECTRICAL = "Electrical"
    WATER = "Water"
    INTERNET = "Internet"
    SECURITY = "Security"
    TRANSPORTATION = "Transportation"
    ACADEMIC = "Academic"
    OTHER = "Other"


class IssuePriority(str, enum.Enum):
    """Urgency level of the reported issue."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IssueStatus(str, enum.Enum):
    """Lifecycle status of the issue."""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
