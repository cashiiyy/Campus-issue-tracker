"""Database seed script for local development and demonstration."""

import logging
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.comment import Comment
from app.models.enums import IssueCategory, IssuePriority, IssueStatus, UserRole
from app.models.issue import Issue
from app.models.team import Team
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


def seed_database(db: Session = None):
    own_session = False
    if db is None:
        own_session = True
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

    try:
        logger.info("Checking existing seed data...")

        # 1. Seed Teams
        team_data = [
            ("Facilities Team", "Manages university buildings, structural maintenance, and grounds."),
            ("IT Support", "Resolves campus network, Wi-Fi, computer labs, and smart projector issues."),
            ("Electrical Team", "Maintains electrical substations, classroom power sockets, and lighting."),
            ("Security Team", "Responsible for campus safety, keycard access, and surveillance systems."),
            ("Maintenance Team", "Handles plumbing, water coolers, sanitation fixtures, and general repairs."),
        ]

        teams = {}
        for name, desc in team_data:
            team = db.query(Team).filter(Team.name == name).first()
            if not team:
                team = Team(name=name, description=desc)
                db.add(team)
                db.commit()
                db.refresh(team)
                logger.info(f"Created team: {name}")
            teams[name] = team

        # 2. Seed Users
        users_data = [
            (
                "Demo Student",
                "student@example.com",
                "StudentPass123!",
                UserRole.STUDENT,
            ),
            (
                "Alex Rivera (Student)",
                "student2@example.com",
                "StudentPass123!",
                UserRole.STUDENT,
            ),
            (
                "Campus Administrator",
                "admin@example.com",
                "AdminPass123!",
                UserRole.ADMIN,
            ),
            (
                "Sarah Jenkins (Facilities Lead)",
                "admin2@example.com",
                "AdminPass123!",
                UserRole.ADMIN,
            ),
        ]

        users = {}
        for name, email, password, role in users_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    password_hash=hash_password(password),
                    role=role,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.info(f"Created user: {email} ({role.value})")
            users[email] = user

        student1 = users["student@example.com"]
        student2 = users["student2@example.com"]
        admin1 = users["admin@example.com"]

        # 3. Seed Realistic Campus Issues
        existing_issues_count = db.query(Issue).count()
        if existing_issues_count == 0:
            logger.info("Seeding realistic sample issues...")

            sample_issues = [
                {
                    "title": "Air Conditioning Failure in Central Library 3rd Floor",
                    "description": "The main HVAC unit on the quiet study floor has stopped functioning. The room temperature is rising rapidly, making it uncomfortable for students preparing for finals.",
                    "category": IssueCategory.INFRASTRUCTURE,
                    "location": "Central Library - 3rd Floor East Wing",
                    "priority": IssuePriority.HIGH,
                    "status": IssueStatus.IN_PROGRESS,
                    "created_by": student1.id,
                    "assigned_to": admin1.id,
                    "assigned_team": teams["Facilities Team"].id,
                    "comments": [
                        (student1.id, "The room is currently at 85 degrees and students are leaving."),
                        (admin1.id, "Facilities technicians have been dispatched with replacement fan belts."),
                    ],
                },
                {
                    "title": "Broken Hand Dryer and Water Leak in Science Hall Restroom",
                    "description": "Sink faucet in the 2nd floor men's restroom has a persistent high-pressure leak that is pooling water on the floor, posing a slip hazard.",
                    "category": IssueCategory.WATER,
                    "location": "Science Hall - 2nd Floor West Restroom",
                    "priority": IssuePriority.CRITICAL,
                    "status": IssueStatus.OPEN,
                    "created_by": student1.id,
                    "assigned_to": None,
                    "assigned_team": teams["Maintenance Team"].id,
                    "comments": [
                        (student1.id, "Placed a caution wet floor sign in the meantime."),
                    ],
                },
                {
                    "title": "Campus Wi-Fi eduroam Unstable in Dormitory Block B",
                    "description": "Continuous disconnection from eduroam Wi-Fi during evening study hours (7 PM - 11 PM). Signal drops to zero bars intermittently.",
                    "category": IssueCategory.INTERNET,
                    "location": "Dormitory Block B - Floors 2 to 4",
                    "priority": IssuePriority.HIGH,
                    "status": IssueStatus.IN_PROGRESS,
                    "created_by": student1.id,
                    "assigned_to": admin1.id,
                    "assigned_team": teams["IT Support"].id,
                    "comments": [
                        (admin1.id, "Access point firmware updates scheduled for tonight at 2 AM."),
                    ],
                },
                {
                    "title": "Flickering Overhead Fluorescent Tube in Chemistry Lab 102",
                    "description": "Two light fixtures above laboratory bench 4 are strobing rapidly, causing headaches during organic chemistry experiments.",
                    "category": IssueCategory.ELECTRICAL,
                    "location": "Chemistry Hall - Lab 102",
                    "priority": IssuePriority.MEDIUM,
                    "status": IssueStatus.RESOLVED,
                    "created_by": student1.id,
                    "assigned_to": admin1.id,
                    "assigned_team": teams["Electrical Team"].id,
                    "comments": [
                        (admin1.id, "Ballasts and LED tubes replaced on Tuesday morning. Resolved."),
                    ],
                },
                {
                    "title": "Spilled Coffee and Overflowing Trash in Student Union Lounge",
                    "description": "Several trash cans near the south entrance are overflowing onto the carpet, and a large sticky spill requires janitorial cleanup.",
                    "category": IssueCategory.CLEANLINESS,
                    "location": "Student Union - South Lounge",
                    "priority": IssuePriority.LOW,
                    "status": IssueStatus.CLOSED,
                    "created_by": student1.id,
                    "assigned_to": admin1.id,
                    "assigned_team": teams["Facilities Team"].id,
                    "comments": [
                        (admin1.id, "Custodial staff cleaned the carpet and replaced trash liners."),
                    ],
                },
                {
                    "title": "Exterior Keycard Reader Malfunction at Engineering Annex",
                    "description": "The card swipe reader at the rear night-entrance refuses valid student badges, showing a continuous red light.",
                    "category": IssueCategory.SECURITY,
                    "location": "Engineering Annex - North-West Night Entrance",
                    "priority": IssuePriority.CRITICAL,
                    "status": IssueStatus.OPEN,
                    "created_by": student2.id,
                    "assigned_to": None,
                    "assigned_team": teams["Security Team"].id,
                    "comments": [
                        (student2.id, "Graduate research students cannot access lab equipment after 6 PM."),
                    ],
                },
                {
                    "title": "Campus Shuttle Route 2 Bus Stop Shelter Glass Cracked",
                    "description": "Vandalism or impact has shattered the tempered safety glass on the west side of the shuttle shelter near North Quad.",
                    "category": IssueCategory.TRANSPORTATION,
                    "location": "North Quad Shuttle Stop",
                    "priority": IssuePriority.MEDIUM,
                    "status": IssueStatus.OPEN,
                    "created_by": student2.id,
                    "assigned_to": None,
                    "assigned_team": teams["Facilities Team"].id,
                    "comments": [],
                },
                {
                    "title": "Projector HDMI Cable Damaged in Lecture Hall 204",
                    "description": "HDMI cable at the instructor podium has bent connector pins, preventing projection of lecture slides.",
                    "category": IssueCategory.ACADEMIC,
                    "location": "Humanities Hall - Room 204",
                    "priority": IssuePriority.MEDIUM,
                    "status": IssueStatus.RESOLVED,
                    "created_by": student2.id,
                    "assigned_to": admin1.id,
                    "assigned_team": teams["IT Support"].id,
                    "comments": [
                        (admin1.id, "Installed a new 4K braided HDMI cable and tested audio/video output."),
                    ],
                },
            ]

            for iss_data in sample_issues:
                comments_to_add = iss_data.pop("comments")
                issue = Issue(**iss_data)
                db.add(issue)
                db.commit()
                db.refresh(issue)

                for author_id, comment_text in comments_to_add:
                    comment = Comment(
                        issue_id=issue.id,
                        author_id=author_id,
                        content=comment_text,
                    )
                    db.add(comment)
                db.commit()

            logger.info("Successfully seeded 8 sample issues with comments.")
        else:
            logger.info(f"Database already contains {existing_issues_count} issues. Skipping issue seed.")

        logger.info("Seed process completed successfully!")
    finally:
        if own_session:
            db.close()


if __name__ == "__main__":
    seed_database()
