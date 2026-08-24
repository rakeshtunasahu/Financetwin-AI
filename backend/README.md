# FinanceTwin AI Backend Core

Production-style conservative reconciliation matching engine, exception classifier, risk automation controller, scikit-learn clustering analytics, and schema-validated AI audits.

## Backend Setup

### 1. Initialize Virtual Environment
```bash
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install Packages
```bash
pip install -r requirements.txt
```

### 3. Initialize & Seed Database
```bash
python scripts/generate_dataset.py
```
This runs the deterministic data generator creating 500 payments, 45 gateway settlement batches, and 52 bank transaction statements, loading them into SQLite.

### 4. Run Pytest Suite
```bash
pytest -v
```

### 5. Run Matching Evaluation CLI
```bash
python scripts/run_evaluation.py
```
Outputs structural precision, recall, and false match rates against evaluation ground-truth.

### 6. Spin Up Local FastAPI Server
```bash
uvicorn app.main:app --reload
```
API docs available at: `http://localhost:8000/docs`
