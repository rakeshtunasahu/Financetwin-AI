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
    assert "ADMIN" in roles
    assert "FINANCE_ANALYST" in roles
    assert "FINANCE_MANAGER" in roles
    assert "RISK_COMPLIANCE_OFFICER" in roles
    assert "AUDITOR" in roles

def test_login_and_me_endpoints():
    # Login as Finance Analyst
    login_res = client.post("/api/auth/login", json={"email": "analyst.priya@financetwin.ai"})
    assert login_res.status_code == 200
    user_info = login_res.json()["user"]
    assert user_info["role"] == "FINANCE_ANALYST"
    assert user_info["name"] == "Priya Sharma"

    # Alias login
    alias_res = client.post("/api/auth/login", json={"email": "priya.sharma@financetwin.ai"})
    assert alias_res.status_code == 200
    assert alias_res.json()["user"]["role"] == "FINANCE_ANALYST"

    # Verify /api/auth/me with header
    me_res = client.get("/api/auth/me", headers={"X-User-Email": "manager.rahul@financetwin.ai"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "FINANCE_MANAGER"

def test_admin_permissions():
    headers = {"X-User-Email": "admin@financetwin.ai"}

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

def test_finance_analyst_permissions():
    headers = {"X-User-Email": "analyst.priya@financetwin.ai"}

    # Analyst can trigger reconciliation
    run_res = client.post("/api/reconciliation/run", headers=headers)
    assert run_res.status_code == 200

    # Analyst CANNOT apply policy (403 Forbidden)
    apply_res = client.post("/api/governance/policy", json={}, headers=headers)
    assert apply_res.status_code == 403
    assert "Access Denied" in apply_res.json()["detail"]

    # Analyst CANNOT simulate policy (403 Forbidden)
    sim_res = client.post("/api/governance/simulate", json={}, headers=headers)
    assert sim_res.status_code == 403

def test_finance_manager_permissions():
    headers = {"X-User-Email": "manager.rahul@financetwin.ai"}

    # Manager CANNOT run reconciliation
    run_res = client.post("/api/reconciliation/run", headers=headers)
    assert run_res.status_code == 403

    # Manager CAN simulate policy
    sim_res = client.post("/api/governance/simulate", json={"minimum_match_confidence": 0.92}, headers=headers)
    assert sim_res.status_code == 200

    # Manager CANNOT apply policy
    apply_res = client.post("/api/governance/policy", json={}, headers=headers)
    assert apply_res.status_code == 403

def test_risk_officer_permissions():
    headers = {"X-User-Email": "risk.ananya@financetwin.ai"}

    # Risk Officer CANNOT run reconciliation
    run_res = client.post("/api/reconciliation/run", headers=headers)
    assert run_res.status_code == 403

    # Risk Officer CAN simulate policy
    sim_res = client.post("/api/governance/simulate", json={"amount_tolerance": 0.05}, headers=headers)
    assert sim_res.status_code == 200

    # Risk Officer CANNOT apply policy
    apply_res = client.post("/api/governance/policy", json={}, headers=headers)
    assert apply_res.status_code == 403

def test_auditor_read_only_and_masking():
    headers = {"X-User-Email": "auditor.vikram@financetwin.ai"}

    # Auditor CANNOT run reconciliation
    run_res = client.post("/api/reconciliation/run", headers=headers)
    assert run_res.status_code == 403

    # Auditor CANNOT apply policy
    apply_res = client.post("/api/governance/policy", json={}, headers=headers)
    assert apply_res.status_code == 403

    # Auditor CANNOT simulate policy
    sim_res = client.post("/api/governance/simulate", json={}, headers=headers)
    assert sim_res.status_code == 403

    # Auditor CAN read matches and exceptions
    matches_res = client.get("/api/reconciliation/matches", headers=headers)
    assert matches_res.status_code == 200
    matches = matches_res.json()
    if matches:
        # Sensitive UTR or Bank references should be masked
        for m in matches:
            if m.get("settlement_batch") and m["settlement_batch"].get("utr"):
                assert "*****" in m["settlement_batch"]["utr"]

    # Auditor CAN read audit logs
    audit_res = client.get("/api/audit/logs", headers=headers)
    assert audit_res.status_code == 200
    assert audit_res.json()["role"] == "AUDITOR"

def test_audit_logs_rbac_filtering():
    # Admin gets full logs
    admin_logs = client.get("/api/audit/logs", headers={"X-User-Email": "admin@financetwin.ai"}).json()
    assert admin_logs["role"] == "ADMIN"
    assert "logs" in admin_logs

    # Analyst gets filtered operational logs
    analyst_logs = client.get("/api/audit/logs", headers={"X-User-Email": "analyst.priya@financetwin.ai"}).json()
    assert analyst_logs["role"] == "FINANCE_ANALYST"
