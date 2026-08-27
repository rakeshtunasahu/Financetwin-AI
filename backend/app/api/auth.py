from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from backend.app.core.rbac import (
    DEMO_USERS,
    DEMO_USER_BY_EMAIL,
    get_current_user,
    Role,
    DemoUser,
    PERMISSIONS
)

router = APIRouter(prefix="/api/auth", tags=["Auth & RBAC"])

class SwitchRoleRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

@router.get("/demo-users")
def list_demo_users():
    """Returns the list of all available role-specific enterprise demo personas."""
    return [u.to_dict() for u in DEMO_USERS]

@router.get("/me")
def get_current_user_info(user: DemoUser = Depends(get_current_user)):
    """Returns current active authenticated user and their active permissions."""
    return user.to_dict()

@router.post("/login")
def login(req: LoginRequest):
    """
    Role-based authentication endpoint for demo purposes.
    Matches role-specific emails and returns authorized profile.
    """
    clean_email = req.email.strip().lower()
    if clean_email not in DEMO_USER_BY_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid credentials: No registered account found for email '{req.email}'."
        )
    user = DEMO_USER_BY_EMAIL[clean_email]
    return {
        "status": "success",
        "message": f"Successfully authenticated as {user.name} ({user.role.value})",
        "user": user.to_dict()
    }

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
    return {
        "status": "success",
        "message": f"Switched active role to {user.role.value} ({user.name})",
        "user": user.to_dict()
    }
