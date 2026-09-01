import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.rbac import Role, DEMO_USERS, DEMO_USER_BY_EMAIL

client = TestClient(app)

def test_demo_users_list():
    response = client.get("/api/auth/demo-users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    roles = [u["role"] for u in data]
    assert "RECOVERY_OPERATOR" in roles
    assert "RECOVERY_MANAGER" in roles
    assert "RECOVERY_ADMIN" in roles
    assert "RISK_OFFICER" in roles
    assert "AUDITOR" in roles

def test_login_and_me_endpoints():
    # Login as Recovery Operator
    login_res = client.post("/api/auth/login", json={"email": "operator.aarav@revenuerescue.ai"})
    assert login_res.status_code == 200
    user_info = login_res.json()["user"]
    assert user_info["role"] == "RECOVERY_OPERATOR"
    assert user_info["name"] == "Aarav Mehta"

    # Alias login
    alias_res = client.post("/api/auth/login", json={"email": "aarav.mehta@revenuerescue.ai"})
    assert alias_res.status_code == 200
    assert alias_res.json()["user"]["role"] == "RECOVERY_OPERATOR"

    # Verify /api/auth/me with header for Manager
    me_res = client.get("/api/auth/me", headers={"X-User-Email": "manager.priya@revenuerescue.ai"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "RECOVERY_MANAGER"

def test_recovery_admin_permissions():
    headers = {"X-User-Email": "admin.arjun@revenuerescue.ai"}

    # Admin can trigger reconciliation
    run_res = client.post("/api/reconciliation/run", headers=headers)
    assert run_res.status_code == 200

    # Admin can simulate policy
    sim_res = client.post("/api/governance/simulate", json={"minimum_match_confidence": 0.95}, headers=headers)
    assert sim_res.status_code == 200

    # Admin can apply policy
    policy_res = client.get("/api/governance/policy", headers=headers)
    current_policy = policy_res.json()
    apply_res = client.post("/api/governance/policy", json=current_policy, headers=headers)
    assert apply_res.status_code == 200

    # Admin can run batch recovery
    batch_res = client.post("/api/recovery/batch/run", json={"payment_failures": 5, "checkout_abandonments": 5, "overdue_receivables": 5}, headers=headers)
    assert batch_res.status_code == 200

def test_recovery_operator_permissions():
    headers = {"X-User-Email": "operator.aarav@revenuerescue.ai"}

    # Operator can view recovery cases
    cases_res = client.get("/api/recovery/cases", headers=headers)
    assert cases_res.status_code == 200

    # Operator CANNOT run batch recovery (403 Forbidden)
    batch_res = client.post("/api/recovery/batch/run", json={"payment_failures": 5}, headers=headers)
    assert batch_res.status_code == 403
    assert "Access Denied" in batch_res.json()["detail"]

    # Operator CANNOT apply policy (403 Forbidden)
    apply_res = client.post("/api/governance/policy", json={}, headers=headers)
    assert apply_res.status_code == 403

def test_recovery_manager_permissions():
    headers = {"X-User-Email": "manager.priya@revenuerescue.ai"}

    # Manager CAN simulate policy
    sim_res = client.post("/api/governance/simulate", json={"minimum_match_confidence": 0.92}, headers=headers)
    assert sim_res.status_code == 200

    # Manager CANNOT apply policy
    apply_res = client.post("/api/governance/policy", json={}, headers=headers)
    assert apply_res.status_code == 403

    # Manager CANNOT run batch recovery
    batch_res = client.post("/api/recovery/batch/run", json={"payment_failures": 5}, headers=headers)
    assert batch_res.status_code == 403

def test_audit_logs_rbac_filtering():
    # Admin gets full logs
    admin_logs = client.get("/api/audit/logs", headers={"X-User-Email": "admin.arjun@revenuerescue.ai"}).json()
    assert admin_logs["role"] == "RECOVERY_ADMIN"
    assert "logs" in admin_logs

    # Operator gets filtered operational logs
    operator_logs = client.get("/api/audit/logs", headers={"X-User-Email": "operator.aarav@revenuerescue.ai"}).json()
    assert operator_logs["role"] == "RECOVERY_OPERATOR"
