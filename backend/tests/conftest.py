"""Pytest fixtures for database isolation, test client, and authenticated users."""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force testing environment
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.enums import UserRole
from app.models.team import Team
from app.models.user import User

# In-memory SQLite test database with StaticPool so all connections share the same memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db():
    """Create fresh database tables for each test function and teardown after."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db):
    """FastAPI TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def student_user(db) -> User:
    user = User(
        name="Alice Student",
        email="alice@test.edu",
        password_hash=hash_password("Password123!"),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def student2_user(db) -> User:
    user = User(
        name="Bob Student",
        email="bob@test.edu",
        password_hash=hash_password("Password123!"),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db) -> User:
    user = User(
        name="Admin Chief",
        email="admin@test.edu",
        password_hash=hash_password("AdminPass123!"),
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def student_token(student_user: User) -> str:
    return create_access_token(
        subject=student_user.id,
        claims={"email": student_user.email, "role": student_user.role.value, "name": student_user.name},
    )


@pytest.fixture
def student_headers(student_token: str) -> dict:
    return {"Authorization": f"Bearer {student_token}"}


@pytest.fixture
def student2_token(student2_user: User) -> str:
    return create_access_token(
        subject=student2_user.id,
        claims={"email": student2_user.email, "role": student2_user.role.value, "name": student2_user.name},
    )


@pytest.fixture
def student2_headers(student2_token: str) -> dict:
    return {"Authorization": f"Bearer {student2_token}"}


@pytest.fixture
def admin_token(admin_user: User) -> str:
    return create_access_token(
        subject=admin_user.id,
        claims={"email": admin_user.email, "role": admin_user.role.value, "name": admin_user.name},
    )


@pytest.fixture
def admin_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def sample_team(db) -> Team:
    team = Team(name="Electrical Team", description="Electrical repairs")
    db.add(team)
    db.commit()
    db.refresh(team)
    return team
