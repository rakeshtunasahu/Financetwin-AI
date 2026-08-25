from enum import Enum
from typing import Dict, Any, List, Optional
from fastapi import Request, HTTPException, status

class Role(str, Enum):
    ADMIN = "ADMIN"
    FINANCE_ANALYST = "FINANCE_ANALYST"
    FINANCE_MANAGER = "FINANCE_MANAGER"
    RISK_COMPLIANCE_OFFICER = "RISK_COMPLIANCE_OFFICER"
    AUDITOR = "AUDITOR"

class DemoUser:
    def __init__(self, email: str, name: str, role: Role, organization: str = "Razorpay FinTwin Org"):
        self.email = email
        self.name = name
        self.role = role
        self.organization = organization

    def to_dict(self) -> Dict[str, Any]:
        return {
            "email": self.email,
            "name": self.name,
            "role": self.role.value,
            "organization": self.organization
        }

DEMO_USERS: List[DemoUser] = [
    DemoUser("admin@financetwin.ai", "Admin User", Role.ADMIN),
    DemoUser("priya.sharma@financetwin.ai", "Priya Sharma", Role.FINANCE_ANALYST),
    DemoUser("rahul.verma@financetwin.ai", "Rahul Verma", Role.FINANCE_MANAGER),
    DemoUser("ananya.singh@financetwin.ai", "Ananya Singh", Role.RISK_COMPLIANCE_OFFICER),
    DemoUser("vikram.mehta@financetwin.ai", "Audit User", Role.AUDITOR)
]

DEMO_USER_BY_EMAIL: Dict[str, DemoUser] = {u.email: u for u in DEMO_USERS}

# Capabilities / Permissions Matrix
PERMISSIONS: Dict[Role, List[str]] = {
    Role.ADMIN: [
        "can_view_dashboard",
        "can_run_reconciliation",
        "can_view_full_reconciliation",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_simulate_policy",
        "can_apply_policy",
        "can_view_audit_logs",
        "can_manage_users",
        "can_view_risk_cases",
        "can_approve_high_risk_case",
    ],
    Role.FINANCE_ANALYST: [
        "can_view_dashboard",
        "can_run_reconciliation",
        "can_view_full_reconciliation",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_view_audit_logs",
    ],
    Role.FINANCE_MANAGER: [
        "can_view_dashboard",
        "can_view_full_reconciliation",
        "can_investigate_exception",
        "can_simulate_policy",
        "can_view_audit_logs",
        "can_view_risk_cases",
        "can_approve_high_risk_case",
    ],
    Role.RISK_COMPLIANCE_OFFICER: [
        "can_view_dashboard",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_simulate_policy",
        "can_view_audit_logs",
        "can_view_risk_cases",
    ],
    Role.AUDITOR: [
        "can_view_dashboard",
        "can_view_audit_logs",
        "can_view_historical_records",
    ],
}

def has_permission(role: Role, permission: str) -> bool:
    return permission in PERMISSIONS.get(role, [])

def get_current_user(request: Request) -> DemoUser:
    """
    Extract authenticated demo user context from incoming request headers.
    Supports X-User-Email header or X-User-Role header with fallback to ADMIN.
    """
    user_email = request.headers.get("X-User-Email")
    user_role_str = request.headers.get("X-User-Role")

    if user_email and user_email in DEMO_USER_BY_EMAIL:
        return DEMO_USER_BY_EMAIL[user_email]

    if user_role_str:
        for u in DEMO_USERS:
            if u.role.value == user_role_str.upper():
                return u

    # Default fallback for unauthenticated calls or backwards compatibility
    return DEMO_USERS[0]

def enforce_permission(permission: str, request: Request):
    user = get_current_user(request)
    if not has_permission(user.role, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Role '{user.role.value}' does not possess required permission '{permission}'."
        )
    return user

def mask_sensitive_value(value: Optional[str], role: Role, prefix_len: int = 3, suffix_len: int = 4) -> Optional[str]:
    """
    Masks sensitive values (such as Customer ID, Bank UTR reference) for AUDITOR role.
    """
    if not value:
        return value
    if role != Role.AUDITOR:
        return value
    if len(value) <= prefix_len + suffix_len:
        return "*****"
    return f"{value[:prefix_len]}*****{value[-suffix_len:]}"
