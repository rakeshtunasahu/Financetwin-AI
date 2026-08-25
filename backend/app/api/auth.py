from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel
from backend.app.core.rbac import DEMO_USERS, DEMO_USER_BY_EMAIL, get_current_user, Role, DemoUser

router = APIRouter(prefix="/api/auth", tags=["Auth & RBAC"])

class SwitchRoleRequest(BaseModel):
    email: str

@router.get("/demo-users")
def list_demo_users():
    return [u.to_dict() for u in DEMO_USERS]

@router.get("/me")
def get_current_user_info(user: DemoUser = Depends(get_current_user)):
    return user.to_dict()

@router.post("/switch-role")
def switch_demo_role(req: SwitchRoleRequest):
    if req.email not in DEMO_USER_BY_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demo user with email '{req.email}' not found."
        )
    user = DEMO_USER_BY_EMAIL[req.email]
    return {
        "status": "success",
        "message": f"Switched active role to {user.role.value} ({user.name})",
        "user": user.to_dict()
    }
