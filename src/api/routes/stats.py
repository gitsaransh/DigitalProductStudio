"""
GET /api/stats
Returns aggregate catalog statistics: counts by lifecycle_state and category.
"""

from fastapi import APIRouter
from src.core.database import ProductDatabase

router = APIRouter()
_db = ProductDatabase()


@router.get("/stats")
def get_stats():
    """Aggregate catalog stats — live from the indexed DB columns (D-009)."""
    stats = _db.get_catalog_stats()
    return stats
