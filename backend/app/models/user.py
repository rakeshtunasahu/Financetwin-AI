import json
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from backend.app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=True, default="")
    job_role = Column(String, nullable=True, default="")
    hashed_password = Column(String, nullable=False)

    # Role: RECOVERY_OPERATOR | RECOVERY_MANAGER | RECOVERY_ADMIN
    role = Column(String, nullable=False, default="RECOVERY_OPERATOR")

    # JSON-encoded list of permission strings
    permissions_json = Column(Text, nullable=False, default="[]")

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def permissions(self) -> list[str]:
        try:
            return json.loads(self.permissions_json)
        except Exception:
            return []

    @permissions.setter
    def permissions(self, value: list[str]):
        self.permissions_json = json.dumps(value)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "company": self.company,
            "job_role": self.job_role,
            "role": self.role,
            "permissions": self.permissions,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
