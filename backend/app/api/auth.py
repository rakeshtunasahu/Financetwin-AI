import uuid
from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.core.rbac import (
    DEMO_USERS,
    DEMO_USER_BY_EMAIL,
    get_current_user,
    Role,
    DemoUser,
    PERMISSIONS
)

router = APIRouter(prefix="/api/auth", tags=["Auth & RBAC"])

# ── Default permissions per role ─────────────────────────────────────────────
ROLE_PERMISSIONS = {
    "RECOVERY_OPERATOR": PERMISSIONS[Role.RECOVERY_OPERATOR],
    "RECOVERY_MANAGER": PERMISSIONS[Role.RECOVERY_MANAGER],
    "RECOVERY_ADMIN": PERMISSIONS[Role.RECOVERY_ADMIN],
}

# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    company: Optional[str] = ""
    job_role: Optional[str] = "Revenue Operations"
    role: Optional[str] = "RECOVERY_OPERATOR"  # default system role

class LoginRequest(BaseModel):
    email: str
    password: str

class SwitchRoleRequest(BaseModel):
    email: str


# ── Register ──────────────────────────────────────────────────────────────────
@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user account with a hashed password.
    Returns a JWT token on success.
    """
    clean_email = req.email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Please provide your full name.")

    # Check uniqueness
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")

    # Normalise role
    role_str = (req.role or "RECOVERY_OPERATOR").upper()
    if role_str not in ROLE_PERMISSIONS:
        role_str = "RECOVERY_OPERATOR"

    new_user = User(
        id=str(uuid.uuid4()),
        email=clean_email,
        name=req.name.strip(),
        company=req.company or "",
        job_role=req.job_role or "",
        hashed_password=hash_password(req.password),
        role=role_str,
    )
    new_user.permissions = ROLE_PERMISSIONS[role_str]
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role, "user_id": new_user.id})
    return {
        "status": "success",
        "message": f"Account created successfully. Welcome, {new_user.name}!",
        "token": token,
        "user": new_user.to_dict()
    }


# ── Login ─────────────────────────────────────────────────────────────────────
@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with email + password.
    First checks the real users table; falls back to demo personas (no password required for demo).
    Returns a JWT token on success.
    """
    clean_email = req.email.strip().lower()

    # 1. Check real registered users first
    user = db.query(User).filter(User.email == clean_email).first()
    if user:
        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again."
            )
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is deactivated. Contact your administrator.")
        token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
        return {
            "status": "success",
            "message": f"Welcome back, {user.name}!",
            "token": token,
            "user": user.to_dict()
        }

    # 2. Fall back to demo personas (accept any password for demo convenience)
    if clean_email in DEMO_USER_BY_EMAIL:
        demo = DEMO_USER_BY_EMAIL[clean_email]
        token = create_access_token({"sub": demo.email, "role": demo.role.value, "demo": True})
        return {
            "status": "success",
            "message": f"Demo login as {demo.name} ({demo.role.value})",
            "token": token,
            "user": demo.to_dict()
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No account found with this email. Please sign up or check your credentials."
    )


# ── Current User (me) ─────────────────────────────────────────────────────────
@router.get("/me")
def get_me(user: DemoUser = Depends(get_current_user)):
    """Returns current active authenticated user and their active permissions."""
    return user.to_dict()


# ── Demo helpers (unchanged) ──────────────────────────────────────────────────
@router.get("/demo-users")
def list_demo_users():
    """Returns the list of all available role-specific enterprise demo personas."""
    return [u.to_dict() for u in DEMO_USERS]


@router.post("/switch-role")
def switch_demo_role(req: SwitchRoleRequest):
    """Seamlessly switch between demo accounts during product demonstration."""
    clean_email = req.email.strip().lower()
    if clean_email not in DEMO_USER_BY_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demo user with email '{req.email}' not found."
        )
    user = DEMO_USER_BY_EMAIL[clean_email]
    token = create_access_token({"sub": user.email, "role": user.role.value, "demo": True})
    return {
        "status": "success",
        "message": f"Switched active role to {user.role.value} ({user.name})",
        "token": token,
        "user": user.to_dict()
    }
