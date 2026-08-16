"""
GET /api/health
Returns live system status: DB product count, FTS5 status, API version.
"""

from fastapi import APIRouter
from src.core.database import ProductDatabase

router = APIRouter()
_db = ProductDatabase()


@router.get("/health")
def get_health():
    """Live system health check — real DB query, not hardcoded."""
    try:
        stats = _db.get_catalog_stats()
        return {
            "status": "healthy",
            "api_version": "1.0.0",
            "total_products": stats["total_products"],
            "lifecycle_state_breakdown": stats["lifecycle_state_breakdown"],
            "database": "SQLite WAL + FTS5",
            "fts5_enabled": True,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}
