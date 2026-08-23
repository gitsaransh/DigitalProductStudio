"""
Digital Product Studio — FastAPI Bridge Server (D-008)
Exposes the Python back-end catalog, approval pipeline, and system stats
over HTTP so the React front-end can fetch live data.

Run: uvicorn src.api.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import health, products, approvals, stats, auth

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
        "https://digitalproductstudio.in"
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
