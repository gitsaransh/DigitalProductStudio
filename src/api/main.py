"""
Digital Product Studio — FastAPI Bridge Server (D-008)
Exposes the Python back-end catalog, approval pipeline, and system stats
over HTTP so the React front-end can fetch live data.

Run: uvicorn src.api.main:app --reload --port 8000
"""

import os
import warnings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import health, products, approvals, stats, auth, payments
from src.core.database import ProductDatabase

app = FastAPI(
    title="Digital Product Studio API",
    description="Internal catalog and approval bridge between Python back-end and React front-end.",
    version="1.0.0",
)

# CORS: Allow the local Vite dev server to fetch from this API.
# In production, replace with the actual deployed domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "https://digitalproductstudio.in",
        "https://www.digitalproductstudio.in"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(payments.router, prefix="/api")


# ── Startup Validation ────────────────────────────────────────────────────────

@app.on_event("startup")
async def validate_environment():
    """
    Validates critical environment variables on startup.

    Razorpay policy (Sprint 05A):
    - RAZORPAY_KEY_ID  : must be set and must start with 'rzp_test_' (TEST mode only).
    - RAZORPAY_KEY_SECRET : must be set. Never logged or exposed to the frontend.
    - VITE_RAZORPAY_KEY_ID : must match RAZORPAY_KEY_ID (frontend read-only public key).

    Non-fatal issues emit warnings so the server still starts for development work.
    Fatal misconfigurations (live keys detected) raise RuntimeError.
    """
    errors = []
    warnings_list = []

    key_id = os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    vite_key_id = os.getenv("VITE_RAZORPAY_KEY_ID", "")

    # ── KEY_ID checks ─────────────────────────────────────────────────────────
    if not key_id:
        warnings_list.append("RAZORPAY_KEY_ID is not set — payments will use mock mode.")
    elif key_id.startswith("rzp_live_"):
        errors.append(
            "FATAL: RAZORPAY_KEY_ID is a LIVE key. Only TEST keys (rzp_test_*) are permitted."
        )
    elif not key_id.startswith("rzp_test_"):
        warnings_list.append(
            f"RAZORPAY_KEY_ID does not start with 'rzp_test_' — confirm this is a valid test key."
        )

    # ── KEY_SECRET checks ─────────────────────────────────────────────────────
    if not key_secret:
        warnings_list.append("RAZORPAY_KEY_SECRET is not set — signature verification will use mock mode.")
    # NOTE: We deliberately do NOT log key_secret value here under any circumstances.

    # ── VITE_KEY_ID consistency check ─────────────────────────────────────────
    if key_id and vite_key_id and vite_key_id != key_id:
        warnings_list.append(
            "VITE_RAZORPAY_KEY_ID does not match RAZORPAY_KEY_ID — frontend may use a stale key."
        )

    # ── ADMIN_GOOGLE_EMAIL ────────────────────────────────────────────────────
    if not os.getenv("ADMIN_GOOGLE_EMAIL"):
        warnings_list.append("ADMIN_GOOGLE_EMAIL is not set — no admin account will be seeded.")

    # ── Emit results ──────────────────────────────────────────────────────────
    for w in warnings_list:
        print(f"[Startup WARNING] {w}")

    for e in errors:
        print(f"[Startup FATAL] {e}")

    if errors:
        raise RuntimeError(
            "Server startup aborted due to security misconfiguration. Check environment variables."
        )

    if not warnings_list and not errors:
        print("[Startup] [OK] All environment checks passed. Running in Razorpay TEST mode.")

    # ── Seed products from filesystem ─────────────────────────────────────────
    # Idempotent: only inserts SKUs not already in the DB.
    # Runs from the working directory (repo root in both local and Render envs).
    try:
        db = ProductDatabase()
        n = db.seed_products_from_filesystem(products_root="products")
        if n == 0:
            print("[Startup] Product catalog: all filesystem products already seeded.")
    except Exception as seed_err:
        print(f"[Startup WARNING] Filesystem seed failed: {seed_err}")

