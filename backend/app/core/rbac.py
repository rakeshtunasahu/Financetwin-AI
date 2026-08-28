from enum import Enum
from typing import Dict, Any, List, Optional
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session

# =========================================================================
# RevenueRescue AI — Three-Role RBAC Model
# =========================================================================

class Role(str, Enum):
    RECOVERY_OPERATOR = "RECOVERY_OPERATOR"
    RECOVERY_MANAGER = "RECOVERY_MANAGER"
    RECOVERY_ADMIN = "RECOVERY_ADMIN"


class DemoUser:
    def __init__(
        self,
        email: str,
        name: str,
        role: Role,
        title: str,
        department: str,
        organization: str = "RevenueRescue AI Org",
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


# 3 distinct recovery-focused enterprise personas (RevenueRescue AI)
DEMO_USERS: List[DemoUser] = [
    DemoUser(
        email="operator.aarav@revenuerescue.ai",
        name="Aarav Mehta",
        role=Role.RECOVERY_OPERATOR,
        title="Senior Recovery Specialist",
        department="Daily Recovery Operations",
        aliases=[
            "aarav.mehta@revenuerescue.ai",
            "operator@revenuerescue.ai",
            "operator.aarav@revenuerescue.ai",
            "analyst.priya@revenuerescue.ai",
            "priya.sharma@revenuerescue.ai",
            "ops@financetwin.ai"
        ]
    ),
    DemoUser(
        email="manager.priya@revenuerescue.ai",
        name="Priya Sharma",
        role=Role.RECOVERY_MANAGER,
        title="Revenue Exposure & Recovery Manager",
        department="Recovery Operations & Approvals",
        aliases=[
            "priya.sharma@revenuerescue.ai",
            "manager@revenuerescue.ai",
            "manager.priya@revenuerescue.ai",
            "manager.rahul@revenuerescue.ai",
            "rahul.verma@revenuerescue.ai",
            "manager@financetwin.ai"
        ]
    ),
    DemoUser(
        email="admin.arjun@revenuerescue.ai",
        name="Arjun Rao",
        role=Role.RECOVERY_ADMIN,
        title="Principal Recovery Architect & Controller",
        department="Autonomous Recovery Leadership",
        aliases=[
            "arjun.rao@revenuerescue.ai",
            "admin@revenuerescue.ai",
            "admin.arjun@revenuerescue.ai",
            "admin.root@revenuerescue.ai",
            "admin@financetwin.ai",
            "admin.root@financetwin.ai",
            "auditor@financetwin.ai",
            "auditor.vikram@revenuerescue.ai",
            "risk.ananya@revenuerescue.ai"
        ]
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
    Role.RECOVERY_OPERATOR: [
        "can_view_dashboard",
        "can_view_recovery_cases",
        "can_run_recovery_detection",
        "can_diagnose_recovery_case",
        "can_execute_recovery_action",
        "can_escalate_case",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_view_audit_logs",
        "can_view_calculator"
    ],
    Role.RECOVERY_MANAGER: [
        "can_view_dashboard",
        "can_view_recovery_cases",
        "can_view_all_cases",
        "can_diagnose_recovery_case",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_approve_high_value_action",
        "can_approve_recovery",
        "can_view_recovery_analytics",
        "can_simulate_policy",
        "can_view_policy_violations",
        "can_view_audit_logs",
        "can_view_risk_cases",
        "can_view_calculator"
    ],
    Role.RECOVERY_ADMIN: [
        "can_view_dashboard",
        "can_view_recovery_cases",
        "can_view_all_cases",
        "can_run_recovery_detection",
        "can_diagnose_recovery_case",
        "can_execute_recovery_action",
        "can_escalate_case",
        "can_investigate_exception",
        "can_trigger_ai_investigation",
        "can_approve_high_value_action",
        "can_approve_recovery",
        "can_view_recovery_analytics",
        "can_run_recovery_batch",
        "can_configure_guardrails",
        "can_simulate_policy",
        "can_apply_policy",
        "can_manage_users",
        "can_view_system_audit",
        "can_view_audit_logs",
        "can_view_anomalies",
        "can_view_risk_cases",
        "can_view_policy_violations",
        "can_view_calculator",
        "can_run_reconciliation",
        "can_view_full_reconciliation"
    ]
}


def has_permission(role: Role, permission: str) -> bool:
    return permission in PERMISSIONS.get(role, [])

def get_current_user(request: Request) -> DemoUser:
    """
    Extract authenticated demo user context from incoming request headers.
    Supports X-User-Email header or X-User-Role header with fallback to RECOVERY_ADMIN.
    """
    user_email = request.headers.get("X-User-Email")
    user_role_str = request.headers.get("X-User-Role")

    if user_email and user_email.lower() in DEMO_USER_BY_EMAIL:
        return DEMO_USER_BY_EMAIL[user_email.lower()]

    if user_role_str:
        role_str = user_role_str.upper()
        # Direct match or role mapping
        for u in DEMO_USERS:
            if u.role.value == role_str:
                return u
        if "OPERATOR" in role_str or "ANALYST" in role_str:
            return DEMO_USERS[0]
        elif "MANAGER" in role_str:
            return DEMO_USERS[1]
        elif "ADMIN" in role_str or "RISK" in role_str or "AUDIT" in role_str:
            return DEMO_USERS[2]

    # Default fallback to Administrator
    return DEMO_USERS[2]

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
# Security & Confidentiality: Zero Secret Exposure
# =========================================================================

def sanitize_system_config(config_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures that raw API keys, passwords, database credentials, or LLM secrets
    are NEVER exposed in API responses. Replaces them with safe status indicators.
    """
    sanitized = {}
    secret_keywords = {"key", "secret", "password", "token", "credential", "auth", "pwd"}
    
    for k, v in config_dict.items():
        lower_k = k.lower()
        if any(keyword in lower_k for keyword in secret_keywords):
            sanitized[k] = "Configured" if v else "Not Configured"
        elif isinstance(v, dict):
            sanitized[k] = sanitize_system_config(v)
        else:
            sanitized[k] = v
    return sanitized

def mask_sensitive_value(value: Optional[str], role: Optional[Role] = None, prefix_len: int = 3, suffix_len: int = 4) -> Optional[str]:
    """
    Helper for masking sensitive identifiers where requested.
    """
    if not value:
        return value
    str_val = str(value)
    if len(str_val) <= prefix_len + suffix_len:
        return "*****"
    return f"{str_val[:prefix_len]}*****{str_val[-suffix_len:]}"
