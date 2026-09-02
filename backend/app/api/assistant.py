"""FinanceTwin AI & RevenueRescue AI Copilot / Full Project Knowledge Engine.
Comprehensive AI assistant with omniscient knowledge of:
- Project Purpose & Architecture (FMR minimization, shadow ledger, Razorpay buildathon)
- 10-Step Autonomous Recovery Lifecycle
- 4-Pass Conservative Reconciliation Matcher (Pass 0 to Pass 4)
- Expected Recovery Mathematical Formula & Proofs
- 5 Revenue Leakage Domains & 5 Enterprise RBAC Personas
- Policy Guardrails, Circuit Breakers & High-Value Approvals (>= ₹50,000)
- ML Outlier Detection (IsolationForest) & Error Clustering (DBSCAN)
- Real-time SQLite Database Telemetry Grounding
- Bilingual Hindi, Hinglish & English natural language understanding
- Codebase Directory Structure & API Reference
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import re

from backend.app.db.session import get_db
from backend.app.models.recovery import RecoveryCase
from backend.app.models.reconciliation import ReconciliationRun, ReconciliationMatch, ExceptionRecord
from backend.app.core.rbac import PERMISSIONS, DEMO_USERS

router = APIRouter(prefix="/api/assistant", tags=["Assistant Copilot"])

class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    current_page: Optional[str] = None
    role: Optional[str] = "ADMIN"

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    deep_link: Optional[str] = None
    related_metrics: Optional[Dict[str, Any]] = None

SYSTEM_KNOWLEDGE_BASE = """
Project: FinanceTwin AI / RevenueRescue AI (Razorpay Buildathon)
Architecture:
- Backend: FastAPI (Python), SQLAlchemy, Pydantic, Scikit-learn (IsolationForest, DBSCAN), RapidFuzz
- Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite
- Deterministic Reconciliation: 4-Pass matching with FMR (False Match Rate) minimization & ABSTAIN safety gate.
- Autonomous Revenue Recovery: 10-Step Lifecycle (Detect, Ingest, Diagnose, Predict, Prioritize, Decide, Guardrail Check, Execute, Verify, Learn).
- Expected Recovery Math: Expected Recovery = Amount at Risk * P(recovery) * P(action_success).
- 5 Leakage Domains: Payment Failures, Checkout Abandonment, Overdue Receivables, Mandate Declines, Settlement Shortfalls.
- 5 RBAC Personas: Admin, Finance Analyst, Finance Manager, Risk Officer, Auditor.
- Safety Guardrails: Max Retries <= 3, Cooldown Windows (6-24h), High-Value >= Rs 50,000 human signoff, Max Missed Promises <= 2, Cryptographic SHA-256 logs.
"""

def generate_copilot_response(query: str, current_page: str, user_role: str, db: Session) -> ChatResponse:
    q = query.lower().strip()

    # 1. Fetch live telemetry from DB
    try:
        total_cases = db.query(RecoveryCase).count()
        cases_recovered = db.query(RecoveryCase).filter(RecoveryCase.current_status == 'RECOVERED').count()
        active_cases = db.query(RecoveryCase).filter(RecoveryCase.current_status.in_(['DETECTED', 'DIAGNOSED', 'ACTION_EXECUTED', 'RETRY'])).count()
        all_cases = db.query(RecoveryCase).all()
        total_at_risk = sum(float(c.amount_at_risk or 0) for c in all_cases)
        total_recovered = sum(float(c.amount_recovered or 0) for c in all_cases)
        
        # Reconciliation and exceptions count
        recon_records = db.query(ReconciliationMatch).count()
        exceptions_count = db.query(ExceptionRecord).count()
        unresolved_exceptions = db.query(ExceptionRecord).filter(ExceptionRecord.status == 'UNRESOLVED').count()
    except Exception:
        total_cases = 0
        cases_recovered = 0
        active_cases = 0
        total_at_risk = 0.0
        total_recovered = 0.0
        recon_records = 0
        exceptions_count = 0
        unresolved_exceptions = 0

    recovery_rate = (cases_recovered / total_cases * 100) if total_cases > 0 else 0.0

    # -------------------------------------------------------------
    # 1. LIVE DATABASE STATS & TELEMETRY
    # -------------------------------------------------------------
    if any(k in q for k in ['live stat', 'how many case', 'recovered amount', 'at risk', 'total money', 'kpi', 'performance', 'stats', 'metrics', 'kitna paisa', 'total cases', 'kitne case', 'current status', 'telemetry']):
        reply = (
            f"📊 **Live System Telemetry & Financial Health Summary**:\n\n"
            f"| Metric | Current Value |\n"
            f"| :--- | :--- |\n"
            f"| 💰 **Total Revenue at Risk** | ₹{total_at_risk:,.2f} |\n"
            f"| 🟢 **Total Recovered Revenue** | ₹{total_recovered:,.2f} |\n"
            f"| 📈 **Recovery Success Rate** | **{recovery_rate:.1f}%** ({cases_recovered}/{total_cases} cases) |\n"
            f"| ⚡ **Active In-Flight Cases** | {active_cases} cases |\n"
            f"| 🔍 **Total Reconciled Records** | {recon_records} transactions |\n"
            f"| ⚠️ **Unresolved Ledger Exceptions** | {unresolved_exceptions} of {exceptions_count} |\n\n"
            f"👉 **Actions:** Explore active pipelines in the [Recovery Command Center](/recovery) or drill into [Revenue Leakage Forensics](/leakage)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/recovery",
            suggested_actions=["View Recovery Command Center", "Inspect Revenue Leakage", "Run Autonomous Batch"],
            related_metrics={
                "total_at_risk": total_at_risk,
                "total_recovered": total_recovered,
                "total_cases": total_cases,
                "cases_recovered": cases_recovered,
                "recovery_rate": recovery_rate,
                "unresolved_exceptions": unresolved_exceptions
            }
        )

    # -------------------------------------------------------------
    # 2. OVERALL PROJECT OVERVIEW / "YE PROJECT KYA HAI?" / PROBLEM STATEMENT
    # -------------------------------------------------------------
    if any(k in q for k in ['kya hai', 'kya karta hai', 'what is this project', 'project overview', 'about project', 'what does this project do', 'purpose', 'intro', 'financetwin', 'revenuerescue', 'buildathon']):
        reply = (
            "🚀 **FinanceTwin AI / RevenueRescue AI — Complete Platform Overview**:\n\n"
            "**Problem Solved:**\n"
            "Digital businesses lose millions to *silent revenue leakage* — failed payment gateway retries, checkout drop-offs, unpaid B2B invoices, broken e-mandates, and settlement fee mismatches. Traditional reconciliation systems force matches indiscriminately, causing dangerous ledger errors.\n\n"
            "**Core Innovations:**\n"
            "1. **Autonomous 10-Step Recovery**: End-to-end detection, root-cause diagnosis, probabilistic ranking, and bounded execution that recovers lost revenue automatically.\n"
            "2. **4-Pass Conservative Reconciliation**: Minimizes the **False Match Rate (FMR)** rather than forcing bad matches, using deterministic safety **ABSTAIN** gates.\n"
            "3. **Expected Recovery Optimization**: Prioritizes actions mathematically via $\\mathbf{Expected\\ Recovery} = \\text{Amount} \\times P_{\\text{rec}} \\times P_{\\text{action}}$.\n"
            "4. **AI Root-Cause Diagnostics**: Classifies payment failures into specific deterministic causes with confidence bounds.\n"
            "5. **Policy Guardrails & Circuit Breakers**: Hard bounds (Max 3 retries, cooldowns, $\\ge ₹50,000$ manager approvals).\n"
            "6. **Machine Learning Auditing**: IsolationForest for variance anomalies and DBSCAN for gateway timeout clustering.\n\n"
            "👉 Dive into the [Recovery Command Center](/recovery) or test the [Recovery Simulator](/simulator)!"
        )
        return ChatResponse(
            reply=reply,
            deep_link="/recovery",
            suggested_actions=["Explore 10-Step Lifecycle", "Learn 4-Pass Reconciliation", "Check Mathematical Formula", "Open Simulator"]
        )

    # -------------------------------------------------------------
    # 3. 10-STEP AUTONOMOUS RECOVERY LIFECYCLE
    # -------------------------------------------------------------
    if any(k in q for k in ['10 step', 'ten step', 'lifecycle', 'workflow', 'how does recovery work', 'kaise kaam karta', 'recovery process', 'steps', 'recovery engine']):
        reply = (
            "🔄 **The 10-Step Autonomous Revenue Recovery Lifecycle**:\n\n"
            "1. **DETECT**: Ingests payment failure webhooks, checkout drop-offs, overdue B2B receivables, and reconciliation mismatches.\n"
            "2. **INGEST**: Normalizes transaction metadata, amounts, customer profiles, payment methods, and dispute history.\n"
            "3. **DIAGNOSE**: AI model determines root causes (e.g. `BANK_SERVER_OUTAGE`, `CARD_EXPIRED`, `INCORRECT_UPI_PIN`, `GATEWAY_TIMEOUT`, `INSUFFICIENT_FUNDS`).\n"
            "4. **PREDICT**: Computes statistical base recovery probability ($P_{\\text{recovery}} \\in [0.0, 1.0]$).\n"
            "5. **PRIORITIZE**: Ranks cases by **Expected Recovery** = $\\text{Amount at Risk} \\times P_{\\text{recovery}} \\times P_{\\text{action\\_success}}$.\n"
            "6. **DECIDE**: Evaluates candidate interventions (Dynamic Payment Link, Smart Retry, Alternate UPI Request, Automated Chaser, Executive Escalation).\n"
            "7. **GUARDRAIL CHECK**: Validates safety constraints (Max Retries $\\le 3$, cooldown windows, $\\ge ₹50,000$ high-value review).\n"
            "8. **EXECUTE / SIMULATE**: Dispatches the optimal recovery action via API or routes to human queue.\n"
            "9. **VERIFY**: Monitors gateway settlement webhooks to confirm recovered funds.\n"
            "10. **LEARN**: Feeds outcome data back into the empirical model to optimize future conversion rates.\n\n"
            "👉 You can test and run this complete pipeline in the [Autonomous Batch Runner](/recovery/batch)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/recovery/batch",
            suggested_actions=["Run Autonomous Batch", "Open Recovery Simulator", "Check Policy Guardrails"]
        )

    # -------------------------------------------------------------
    # 4. 4-PASS RECONCILIATION MATCHER & FMR MINIMIZATION
    # -------------------------------------------------------------
    if any(k in q for k in ['4 pass', 'four pass', 'reconciliation', 'matching', 'fmr', 'false match rate', 'abstain', 'matcher', 'pass 0', 'pass 1', 'pass 2', 'pass 3', 'pass 4', 'reconcile']):
        reply = (
            "⚖️ **4-Pass Conservative Reconciliation & FMR Minimization**:\n\n"
            "In financial bookkeeping, a **False Match is catastrophic**. FinanceTwin AI prioritizes minimizing the False Match Rate (FMR) over blindly maximizing match count:\n\n"
            "1. **Pass 0 — Integrity Validation**: Verifies that the sum of individual payment contributions strictly equals the batch net payout amount.\n"
            "2. **Pass 1 — Strict Match**: Matches records with 100% confidence when the UTR / bank narration reference and net amounts align perfectly.\n"
            "3. **Pass 2 — Date Proximity**: Matches non-referenced credits within a T+2 settlement window only if exactly one candidate exists.\n"
            "4. **Pass 3 — Fuzzy Narration Match**: Employs weighted RapidFuzz ratio on bank narrations (minimum 85% token similarity).\n"
            "5. **Pass 4 — Safety Gate (ABSTAIN)**: If confidence $< 95\\%$ or margin over the 2nd best candidate $< 5\\%$, the engine **ABSTAINS** and logs an exception instead of guessing.\n\n"
            "👉 View active reconciliation records on the [Reconciliation Ledger](/reconciliation) or inspect flagged [Exceptions](/exceptions)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/reconciliation",
            suggested_actions=["View Reconciliation Ledger", "Inspect Open Exceptions", "Check Policy Limits"]
        )

    # -------------------------------------------------------------
    # 5. EXPECTED RECOVERY MATHEMATICAL FORMULA
    # -------------------------------------------------------------
    if any(k in q for k in ['expected recovery', 'formula', 'calculate', 'math', 'probability', 'how do you compute', 'equation', 'hisab', 'calculation']):
        reply = (
            "📐 **Expected Recovery Calculation Engine**:\n\n"
            "RevenueRescue AI uses mathematical expectation to prioritize cases and select the highest-yield intervention:\n\n"
            "$$\\mathbf{Expected\\ Recovery} = \\text{Amount at Risk} \\times \\mathbf{P}_{\\text{recovery}} \\times \\mathbf{P}_{\\text{action\\_success}}$$\n\n"
            "**Components:**\n"
            "- **Amount at Risk ($A$)**: Gross transaction or invoice amount.\n"
            "- **$P_{\\text{recovery}}$**: Base recovery probability based on root cause, failure type, and customer history (e.g. Bank Downtime = $0.85$, Expired Card = $0.40$, Abandoned Cart = $0.60$).\n"
            "- **$P_{\\text{action\\_success}}$**: Empirical success probability of the selected channel:\n"
            "  - *Dynamic Payment Link (WhatsApp/SMS)*: **88%** ($0.88$)\n"
            "  - *Smart Gateway Retry*: **72%** ($0.72$)\n"
            "  - *Alternate Payment Method Request*: **68%** ($0.68$)\n"
            "  - *Automated Chaser Sequence*: **55%** ($0.55$)\n"
            "  - *Executive Escalation*: **45%** ($0.45$)\n\n"
            "💡 Try varying the parameters on the [Recovery Simulator](/simulator)!"
        )
        return ChatResponse(
            reply=reply,
            deep_link="/simulator",
            suggested_actions=["Open Recovery Simulator", "View Channel Benchmarks", "Run Autonomous Batch"]
        )

    # -------------------------------------------------------------
    # 6. 5 REVENUE LEAKAGE DOMAINS
    # -------------------------------------------------------------
    if any(k in q for k in ['leak', 'leaking', 'leakage', 'lost revenue', 'drop off', 'mandate', 'receivable', 'payment failure', 'where is revenue lost', 'kaha paisa', 'shortfall', 'domains', 'channel']):
        reply = (
            "🔍 **5 Revenue Leakage Domains Monitored by RevenueRescue AI**:\n\n"
            "1. **Payment Failures**: Gateway timeouts, bank 500 downtime, declined cards, UPI technical errors.\n"
            "2. **Checkout Abandonment**: Dropped carts at OTP / 2FA stage, address verification friction, payment method fatigue.\n"
            "3. **Overdue Receivables**: B2B invoices unpaid past 30/60/90 days credit limits.\n"
            "4. **Mandate Failures**: Recurring subscription auto-debit dishonors, expired e-mandates, debit card expiries.\n"
            "5. **Settlement Shortfalls**: Gateway MDR fee over-deductions, un-reconciled payouts, GST/tax calculation mismatches.\n\n"
            "👉 Dive into forensic domain breakdowns on the [Revenue Leakage Forensics Page](/leakage)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/leakage",
            suggested_actions=["Open Leakage Forensics", "Simulate Recovery Action", "Run 10-Step Batch"]
        )

    # -------------------------------------------------------------
    # 7. 5 ENTERPRISE RBAC PERSONAS & PERMISSIONS
    # -------------------------------------------------------------
    if any(k in q for k in ['role', 'persona', 'rbac', 'admin', 'analyst', 'manager', 'risk officer', 'auditor', 'permission', 'login', 'who can do what', 'user roles']):
        reply = (
            "🛡️ **Enterprise 5-Persona RBAC Security System**:\n\n"
            "RevenueRescue AI enforces strict segregation of duties across 5 roles:\n\n"
            "1. **Admin (`admin.arjun@revenuerescue.ai`)**:\n"
            "   - Full execution privileges: trigger autonomous batches, execute interventions, modify policies, manage users.\n"
            "2. **Finance Analyst (`operator.aarav@revenuerescue.ai`)**:\n"
            "   - Operational investigator: triage queues, simulate what-if scenarios, inspect exception forensics.\n"
            "3. **Finance Manager (`manager.priya@revenuerescue.ai`)**:\n"
            "   - Sign-off authority: approves high-value cases ($\\ge ₹50,000$), reviews team performance, authorizes escalations.\n"
            "4. **Risk Officer (`risk.ananya@revenuerescue.ai`)**:\n"
            "   - Governance oversight: configures circuit breakers, cooldown limits, retry caps, and financial exposure policies.\n"
            "5. **Auditor (`auditor.vikram@revenuerescue.ai`)**:\n"
            "   - Forensic verifier: read-only access to verify cryptographic SHA-256 tamper-evident logs.\n\n"
            "🔐 Switch demo personas anytime using the dropdown in the top header or visit [Login](/login)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/login",
            suggested_actions=["Switch Persona at Header", "Review Audit Logs", "Configure Governance Rules"]
        )

    # -------------------------------------------------------------
    # 8. POLICY GUARDRAILS & CIRCUIT BREAKERS
    # -------------------------------------------------------------
    if any(k in q for k in ['guardrail', 'policy', 'circuit breaker', 'safety', 'cooldown', 'limit', 'max retry', 'high value', 'safety gate', 'rules']):
        reply = (
            "🛡️ **Financial Policy Guardrails & Circuit Breakers**:\n\n"
            "To prevent automated runaway actions, spam, or accounting discrepancies, RevenueRescue enforces:\n\n"
            "- **Max Retries Allowed**: Maximum **3 automated retry attempts** per failed payment.\n"
            "- **Retry Cooldown Window**: Minimum **6 to 24 hours** between automated attempts.\n"
            "- **High-Value Threshold**: Any transaction **$\\ge ₹50,000$** requires human manager sign-off.\n"
            "- **Max Missed Promises**: Max **2 broken promises** before escalating to executive channels.\n"
            "- **Zero Floating-Point Drift**: Strict `Decimal` arithmetic across all currency calculations.\n"
            "- **Cryptographic Audit Trail**: Every decision, state transition, and execution is hashed with SHA-256.\n\n"
            "⚙️ Review active policies under [Governance & Policies](/governance)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/governance",
            suggested_actions=["Check Governance Policies", "Inspect Audit Trail", "Test Guardrails in Simulator"]
        )

    # -------------------------------------------------------------
    # 9. MACHINE LEARNING & ANOMALIES
    # -------------------------------------------------------------
    if any(k in q for k in ['ml', 'machine learning', 'anomaly', 'isolationforest', 'dbscan', 'cluster', 'ai model', 'outlier']):
        reply = (
            "🧠 **Machine Learning & Anomaly Intelligence Engine**:\n\n"
            "- **IsolationForest**: Performs unsupervised outlier detection on variance and timing distributions to flag abnormal failure bursts.\n"
            "- **DBSCAN (Density-Based Spatial Clustering)**: Groups topologically dense clusters of recurring failures (e.g. repeated HDFC gateway timeouts on Sunday afternoons).\n"
            "- **Principle of Non-Interference**: ML models provide diagnostic intelligence and priority ranking; they never override deterministic accounting invariants.\n\n"
            "📈 Explore clusters and outlier cases on the [Anomaly Patterns Page](/anomalies)."
        )
        return ChatResponse(
            reply=reply,
            deep_link="/anomalies",
            suggested_actions=["Inspect DBSCAN Clusters", "View IsolationForest Outliers", "Open Recovery Registry"]
        )

    # -------------------------------------------------------------
    # 10. TECH STACK, CODE STRUCTURE & HOW TO RUN
    # -------------------------------------------------------------
    if any(k in q for k in ['tech stack', 'codebase', 'how to run', 'kaise run kare', 'folder structure', 'api documentation', 'fastapi', 'react', 'sqlite']):
        reply = (
            "💻 **Technology Stack & Repository Architecture**:\n\n"
            "**Backend:**\n"
            "- **Framework**: FastAPI (Python 3.10+), SQLAlchemy 2.0 ORM, Pydantic v2.\n"
            "- **Algorithms**: RapidFuzz (fuzzy matching), Scikit-learn (IsolationForest, DBSCAN), Decimal financial math.\n"
            "- **Database**: SQLite (`financetwin.db`) with relational integrity and SHA-256 audit hashing.\n\n"
            "**Frontend:**\n"
            "- **Framework**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.\n"
            "- **State Management**: React Query (@tanstack/react-query), AuthContext (RBAC).\n\n"
            "**How to Run Locally:**\n"
            "```bash\n"
            "# Backend\n"
            "cd backend\n"
            "python -m venv .venv && .venv\\Scripts\\activate\n"
            "pip install -r requirements.txt\n"
            "python scripts/generate_dataset.py\n"
            "uvicorn app.main:app --reload\n\n"
            "# Frontend\n"
            "cd frontend\n"
            "npm install\n"
            "npm run dev\n"
            "```\n"
            "Open `http://localhost:5173` to explore the dashboard!"
        )
        return ChatResponse(
            reply=reply,
            deep_link="/recovery",
            suggested_actions=["View Recovery Command Center", "Open Governance Lab", "Run 10-Step Batch"]
        )

    # -------------------------------------------------------------
    # 11. HINDI / HINGLISH GREETINGS & CASUAL QUESTIONS
    # -------------------------------------------------------------
    if any(k in q for k in ['namaste', 'hello', 'hi', 'hey', 'kaise ho', 'help', 'madad', 'bhai', 'kya hal', 'sun']):
        reply = (
            "👋 **Namaste! Main hoon aapka FinanceTwin & RevenueRescue AI Copilot.**\n\n"
            "Mujhe is poore project ka 100% knowledge hai! Aap mujhse Hindi ya English mein koi bhi sawal pooch sakte hain:\n\n"
            "- 💰 *\"Live revenue stats aur kitna paisa recover hua?\"*\n"
            "- 🔄 *\"10-step autonomous recovery lifecycle explain karo\"*\n"
            "- ⚖️ *\"4-pass reconciliation engine kaise kaam karta hai?\"*\n"
            "- 📐 *\"Expected Recovery ka mathematical formula kya hai?\"*\n"
            "- 🛡️ *\"5 RBAC roles aur unki permissions kya hain?\"*\n"
            "- 🔍 *\"5 revenue leakage categories kaun si hain?\"*\n"
            "- ⚙️ *\"Policy guardrails aur circuit breakers kya hain?\"*\n\n"
            "Bataiye, main aapki kya madad karoon?"
        )
        return ChatResponse(
            reply=reply,
            deep_link="/recovery",
            suggested_actions=[
                "Live Revenue Stats",
                "10-Step Lifecycle",
                "4-Pass Reconciliation",
                "Expected Recovery Math"
            ]
        )

    # -------------------------------------------------------------
    # 12. GENERAL CONTEXTUAL FALLBACK
    # -------------------------------------------------------------
    reply = (
        f"🤖 **RevenueRescue AI Intelligence Response**:\n\n"
        f"Regarding your query on *\"{query}\"*:\n\n"
        f"In **FinanceTwin & RevenueRescue AI**, every operational workflow connects directly to our core pillars:\n"
        f"1. **Autonomous 10-Step Recovery**: Automating lost revenue recovery across 5 failure domains.\n"
        f"2. **Conservative 4-Pass Reconciliation**: Minimizing False Match Rate (FMR) using strict ABSTAIN safety gates.\n"
        f"3. **Mathematical Expected Value**: Optimizing action ROI using $Expected = Amount \\times P_{{rec}} \\times P_{{action}}$.\n"
        f"4. **Policy Guardrails**: Max 3 retries, cooldown periods, and $\\ge ₹50,000$ high-value safety limits.\n"
        f"5. **Audit Integrity**: Cryptographic SHA-256 tamper-evident logs.\n\n"
        f"**Live System Stats:**\n"
        f"- At Risk: ₹{total_at_risk:,.2f} | Recovered: ₹{total_recovered:,.2f} | Active Cases: {active_cases}\n\n"
        f"Aap specific sawal pooch sakte hain jaise: *\"10-step lifecycle\"*, *\"Expected recovery formula\"*, *\"Reconciliation passes\"*, ya *\"RBAC roles\"*!"
    )
    return ChatResponse(
        reply=reply,
        deep_link="/recovery",
        suggested_actions=[
            "Show Live Revenue Stats",
            "Explain 10-Step Workflow",
            "Explain 4-Pass Reconciliation",
            "Calculate Expected Recovery"
        ]
    )

@router.post("/chat", response_model=ChatResponse)
def copilot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Interactive conversational copilot with deep project knowledge and live DB grounding."""
    return generate_copilot_response(
        query=req.message,
        current_page=req.current_page or "/",
        user_role=req.role or "ADMIN",
        db=db
    )

@router.get("/suggestions")
def get_prompt_suggestions():
    """Returns curated starter questions for quick single-click inquiry."""
    return {
        "suggestions": [
            "What is our current revenue at risk and recovered total?",
            "Explain the 10-step autonomous recovery lifecycle.",
            "How does the 4-pass conservative reconciliation engine work?",
            "How is Expected Recovery calculated mathematically?",
            "What are the 5 enterprise RBAC personas and permissions?",
            "Where is revenue leaking across our payment channels?",
            "How do policy guardrails protect against excessive retries?"
        ]
    }
