import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.services.data_loader import load_all_csvs

test_db_url = "sqlite:///./test_api.db"
engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_all_csvs(db, base_path)
    db.close()
    
    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    
    if os.path.exists("./test_api.db"):
        try:
            os.remove("./test_api.db")
        except Exception:
            pass

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert data["environment"] == "development"

def test_reconciliation_cycle_and_apis():
    # 1. Trigger run
    res = client.post("/api/reconciliation/run")
    assert res.status_code == 200
    data = res.json()
    assert "run_id" in data
    assert data["status"] == "COMPLETED"
    
    # 2. Get run details
    run_id = data["run_id"]
    res = client.get(f"/api/reconciliation/runs/{run_id}")
    assert res.status_code == 200
    assert res.json()["run_id"] == run_id
    
    # 3. Get matches
    res = client.get("/api/reconciliation/matches")
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) > 0
    
    # 4. Get exceptions
    res = client.get("/api/exceptions")
    assert res.status_code == 200
    exceptions = res.json()
    assert len(exceptions) > 0
    
    # 5. Get exception details
    exc_id = exceptions[0]["exception_id"]
    res = client.get(f"/api/exceptions/{exc_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["exception_id"] == exc_id
    assert "risk_decision" in detail
    assert "audit_history" in detail
    
    # 6. Run AI investigation
    res = client.post(f"/api/exceptions/{exc_id}/investigate")
    assert res.status_code == 200
    inv = res.json()
    assert "explanation" in inv
    assert "recommended_action" in inv
    
    # 7. Dashboard API summary
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["total_settlements"] > 0
    assert summary["matched_count"] > 0
    assert summary["precision"] is not None
    
    # 8. Dashboard anomalies
    res = client.get("/api/dashboard/anomalies")
    assert res.status_code == 200
    anom = res.json()
    assert "anomalies" in anom
    
    # 9. Dashboard clusters
    res = client.get("/api/dashboard/clusters")
    assert res.status_code == 200
    clusters = res.json()
    assert "clusters" in clusters
    
    # 10. Governance policy
    res = client.get("/api/governance/policy")
    assert res.status_code == 200
    policy = res.json()
    assert "minimum_match_confidence" in policy
    
    # 11. Policy simulation
    res = client.post("/api/governance/simulate", json={"minimum_match_confidence": 0.99})
    assert res.status_code == 200
    sim = res.json()
    assert "before" in sim
    assert "after" in sim
