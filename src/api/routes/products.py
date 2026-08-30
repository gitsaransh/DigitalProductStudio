"""
GET /api/products              — paginated list with optional filters
GET /api/products/by-slug/{slug}  — lookup by URL slug (e.g. 'ultimate-finance-os')
GET /api/products/by-sku/{sku}    — lookup by SKU (e.g. 'DPS-XLS-001')
GET /api/products/{id}         — single product by UUID
GET /api/products/search       — full-text search via FTS5
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from src.core.database import ProductDatabase

router = APIRouter()
_db = ProductDatabase()


@router.get("/products")
def list_products(
    status: Optional[str] = Query(None, description="Filter by status field"),
    lifecycle_state: Optional[str] = Query(None, description="Filter by lifecycle_state (D-009 indexed column)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Returns paginated product list. Uses indexed columns for filtering."""
    products = _db.list_products(
        status=status,
        lifecycle_state=lifecycle_state,
        category=category,
        limit=limit,
        offset=offset,
    )
    return {"products": products, "count": len(products), "limit": limit, "offset": offset}


@router.get("/products/search")
def search_products(
    q: str = Query(..., min_length=1, description="FTS5 search query"),
    limit: int = Query(50, ge=1, le=200),
):
    """Full-text search across title, description, tags, category via FTS5."""
    results = _db.search_products(q, limit=limit)
    return {"products": results, "count": len(results), "query": q}


@router.get("/products/by-slug/{slug}")
def get_product_by_slug(slug: str):
    """Returns a single product by its URL slug (e.g. 'ultimate-finance-os')."""
    product = _db.get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with slug '{slug}' not found")
    return product


@router.get("/products/by-sku/{sku}")
def get_product_by_sku(sku: str):
    """Returns a single product by its SKU (e.g. 'DPS-XLS-001')."""
    product = _db.get_product_by_sku(sku)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku}' not found")
    return product


@router.get("/products/{product_id}")
def get_product(product_id: str):
    """Returns a single product by UUID. Also tries SKU lookup as a fallback."""
    product = _db.get_product(product_id)
    if not product:
        # Fallback: treat product_id as a SKU (e.g. 'DPS-XLS-001')
        product = _db.get_product_by_sku(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    return product
