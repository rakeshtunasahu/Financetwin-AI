from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging import setup_logging
from backend.app.db.init_db import init_db
from backend.app.api import health, reconciliation, exceptions, governance, dashboard, auth, audit, recovery

# 1. Setup logging
setup_logging()

# 2. Automatically initialize SQLite tables on startup
init_db()

app = FastAPI(
    title="RevenueRescue AI API",
    description="Autonomous Revenue Recovery Agent — Detect. Decide. Recover.",
    version="2.0.0"
)

# 3. CORS Configuration
origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include APIRouters
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(recovery.router)
app.include_router(reconciliation.router)
app.include_router(exceptions.router)
app.include_router(governance.router)
app.include_router(dashboard.router)
app.include_router(audit.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to RevenueRescue AI — Autonomous Revenue Recovery Agent. Go to /docs for OpenAPI specifications.",
        "tagline": "Detect. Decide. Recover."
    }
