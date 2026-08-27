from enum import Enum
from typing import Dict, Any, List, Optional
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session

class Role(str, Enum):
    ADMIN = "ADMIN"
    FINANCE_ANALYST = "FINANCE_ANALYST"
    FINANCE_MANAGER = "FINANCE_MANAGER"
    RISK_COMPLIANCE_OFFICER = "RISK_COMPLIANCE_OFFICER"
    AUDITOR = "AUDITOR"

class DemoUser:
    def __init__(
        self,
        email: str,
        name: str,
        role: Role,
        title: str,
        department: str,
        organization: str = "Razorpay FinTwin Org",
        aliases: Optional[List[str]] = None
    ):
        self.email = email
        self.name = name
        self.role = role
        self.title = title
        self.department = department
        self.organization = organization
        self.aliases = aliases or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "email": self.email,
            "name": self.name,
            "role": self.role.value,
            "title": self.title,
            "department": self.department,
            "organization": self.organization,
            "permissions": PERMISSIONS.get(self.role, [])
        }

# 5 distinct enterprise personas with role-related emails
DEMO_USERS: List[DemoUser] = [
    DemoUser(
        email="admin@financetwin.ai",
        name="Admin User",
        role=Role.ADMIN,
        title="Chief Systems Architect & Controller",
        department="FinOps Leadership",
        aliases=["admin.root@financetwin.ai"]
    ),
    DemoUser(
        email="analyst.priya@financetwin.ai",
        name="Priya Sharma",
        role=Role.FINANCE_ANALYST,
        title="Senior Settlement Analyst",
        department="Daily Settlement Operations",
        aliases=["priya.sharma@financetwin.ai"]
    ),
    DemoUser(
        email="manager.rahul@financetwin.ai",
        name="Rahul Verma",
        role=Role.FINANCE_MANAGER,
        title="Finance Operations Manager",
        department="Treasury & Exposure Control",
        aliases=["rahul.verma@financetwin.ai"]
    ),
    DemoUser(
        email="risk.ananya@financetwin.ai",
        name="Ananya Singh",
        role=Role.RISK_COMPLIANCE_OFFICER,
        title="Risk & Compliance Officer",
        department="FinCrime & Anomaly Governance",
        aliases=["ananya.singh@financetwin.ai"]
    ),
    DemoUser(
        email="auditor.vikram@financetwin.ai",
        name="Vikram Mehta",
        role=Role.AUDITOR,
        title="External Financial Auditor",
        department="Statutory Audit & Verification",
        aliases=["vikram.mehta@financetwin.ai", "auditor@financetwin.ai"]
    )
]

# Map both primary emails and aliases to demo user
DEMO_USER_BY_EMAIL: Dict[str, DemoUser] = {}
for u in DEMO_USERS:
    DEMO_USER_BY_EMAIL[u.email.lower()] = u
    for alias in u.aliases:
        DEMO_USER_BY_EMAIL[alias.lower()] = u

# Centralized Capabilities & Permissions Matrix
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
        "can_view_anomalies",
        "can_view_calculator"
    ],
    Role.FINANCE_ANALYST: [
        "can_view_dashboard",
        "can_run_reconciliation",
        "can_view_full_reconciliation",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_view_audit_logs",
        "can_view_calculator"
    ],
    Role.FINANCE_MANAGER: [
        "can_view_dashboard",
        "can_view_full_reconciliation",
        "can_investigate_exception",
        "can_simulate_policy",
        "can_view_audit_logs",
        "can_view_risk_cases",
        "can_approve_high_risk_case",
        "can_view_calculator"
    ],
    Role.RISK_COMPLIANCE_OFFICER: [
        "can_view_dashboard",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_simulate_policy",
        "can_view_audit_logs",
        "can_view_risk_cases",
        "can_view_anomalies",
        "can_view_calculator"
    ],
    Role.AUDITOR: [
        "can_view_dashboard",
        "can_view_audit_logs",
        "can_view_full_reconciliation",
        "can_view_historical_records",
        "can_view_calculator"
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

    if user_email and user_email.lower() in DEMO_USER_BY_EMAIL:
        return DEMO_USER_BY_EMAIL[user_email.lower()]

    if user_role_str:
        for u in DEMO_USERS:
            if u.role.value == user_role_str.upper():
                return u

    # Default fallback for unauthenticated calls or backwards compatibility
    return DEMO_USERS[0]

def require_permission(permission: str):
    """
    FastAPI dependency that validates whether the current user has the required permission.
    Rejects unauthorized access with HTTP 403 Forbidden and logs security audit events.
    """
    def dependency(request: Request):
        user = get_current_user(request)
        if not has_permission(user.role, permission):
            # Attempt to record denied authorization attempt to audit log if possible
            try:
                from backend.app.db.session import SessionLocal
                from backend.app.services.audit_service import log_action
                db = SessionLocal()
                try:
                    log_action(
                        db=db,
                        entity_type="SecurityPolicy",
                        entity_id=request.url.path,
                        action="ACCESS_DENIED",
                        actor=f"{user.name} ({user.email})",
                        decision="DENIED",
                        reason=f"Role '{user.role.value}' denied required permission '{permission}' for path {request.url.path}",
                        metadata_json={"method": request.method, "role": user.role.value, "permission": permission}
                    )
                finally:
                    db.close()
            except Exception:
                pass

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{user.role.value}' does not possess required permission '{permission}'."
            )
        return user
    return dependency

def enforce_permission(permission: str, request: Request) -> DemoUser:
    """Synchronous helper version for direct usage inside routes."""
    user = get_current_user(request)
    if not has_permission(user.role, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Role '{user.role.value}' does not possess required permission '{permission}'."
        )
    return user

# =========================================================================
# Field-Level Privacy & Data Masking Utilities
# =========================================================================

def mask_sensitive_value(value: Optional[str], role: Role, prefix_len: int = 3, suffix_len: int = 4) -> Optional[str]:
    """
    Masks sensitive values (such as Customer ID, Bank UTR reference) for AUDITOR role.
    Example: UTR123456789 -> UTR*****6789, CUS-987654321 -> CUS*****4321
    """
    if not value:
        return value
    if role != Role.AUDITOR:
        return value
    str_val = str(value)
    if len(str_val) <= prefix_len + suffix_len:
        return "*****"
    return f"{str_val[:prefix_len]}*****{str_val[-suffix_len:]}"

def mask_dict_fields(data: Dict[str, Any], role: Role) -> Dict[str, Any]:
    """
    Recursively applies field masking on dictionary structures for AUDITOR role.
    """
    if role != Role.AUDITOR or not isinstance(data, dict):
        return data

    masked = dict(data)
    sensitive_keys = {"utr", "customer_id", "reference", "bank_reference", "account_number"}
    
    for key, val in masked.items():
        if key in sensitive_keys and isinstance(val, str):
            masked[key] = mask_sensitive_value(val, role)
        elif isinstance(val, dict):
            masked[key] = mask_dict_fields(val, role)
        elif isinstance(val, list):
            masked[key] = [mask_dict_fields(item, role) if isinstance(item, dict) else item for item in val]
            
    return masked
