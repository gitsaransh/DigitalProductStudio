"""
GET  /api/approvals/pending      — products in lifecycle_state "review"
POST /api/approvals/{id}/approve — approve and publish a product
POST /api/approvals/{id}/reject  — reject a product with a reason
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.approvals.approval_manager import ApprovalManager

router = APIRouter()
_approval_mgr = ApprovalManager()


class RejectRequest(BaseModel):
    reason: Optional[str] = "Quality review rejected"


@router.get("/approvals/pending")
def get_pending_approvals(limit: int = 50):
    """Returns products awaiting human review (lifecycle_state = 'review')."""
    pending = _approval_mgr.get_pending_approvals(limit=limit)
    return {"pending": pending, "count": len(pending)}


@router.post("/approvals/{product_id}/approve")
def approve_product(product_id: str):
    """
    Approves a product and triggers publishing to all configured marketplace adapters.
    This is the first time the front-end can trigger back-end publishing (D-008).
    """
    try:
        result = _approval_mgr.approve_and_publish(product_id)
        return {"status": "approved", "product": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {e}")


@router.post("/approvals/{product_id}/reject")
def reject_product(product_id: str, body: RejectRequest = None):
    """Rejects a product and returns it to rejected state."""
    reason = body.reason if body else "Quality review rejected"
    try:
        result = _approval_mgr.reject_product(product_id, reason=reason)
        return {"status": "rejected", "product": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection failed: {e}")
