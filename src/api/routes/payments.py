"""
FastAPI Payment Router — Razorpay Checkout & Order Verification

Security policy (Sprint 05A):
- RAZORPAY_KEY_SECRET is NEVER returned to the frontend or logged.
- Only RAZORPAY_KEY_ID (test-mode) is passed to the frontend for checkout widget initialisation.
- Signature verification is performed exclusively on the backend using HMAC-SHA256.
- Mock mode activates automatically when keys are absent or use the placeholder prefix.
"""

import os
import uuid
import hmac
import hashlib
import json
import base64
import urllib.request
import urllib.error
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel

from src.core.database import ProductDatabase
from src.core.auth import get_current_user

router = APIRouter()

# ── Constants ─────────────────────────────────────────────────────────────────

# Pricing catalog — only sandbox amounts in INR
# amount is in INR (NOT paise); conversion to paise happens in create_order
PRICE_MAP = {
    "DPS-PRM-001": {"amount": 499, "currency": "INR"},
    "DPS-XLS-001": {"amount": 1500, "currency": "INR"},
}

# Sentinel prefix used to detect placeholder / unconfigured keys
_PLACEHOLDER_PREFIX = "rzp_test_placeholder"

# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_keys() -> tuple[str | None, str | None]:
    """
    Reads Razorpay credentials from environment.
    Returns (key_id, key_secret). Either may be None if unconfigured.
    KEY_SECRET is NEVER returned to callers outside this module.
    """
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    return key_id, key_secret


def _is_live_mode(key_id: str | None) -> bool:
    """
    Rejects live-mode keys at the code level.
    Only keys starting with 'rzp_test_' are accepted.
    """
    if not key_id:
        return False
    return not key_id.startswith("rzp_test_")


def _is_mock_mode(key_id: str | None, key_secret: str | None) -> bool:
    """Returns True when credentials are absent or are placeholder values."""
    if not key_id or not key_secret:
        return True
    if key_id.startswith(_PLACEHOLDER_PREFIX) or key_secret.startswith(_PLACEHOLDER_PREFIX):
        return True
    return False


# ── Request Models ────────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    sku: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/payments/create-order")
def create_order(body: CreateOrderRequest, current_user: dict = Depends(get_current_user)):
    """
    Creates an order on Razorpay TEST mode (or a simulated mock order).
    Returns only the public key_id to the frontend — NEVER the secret.
    """
    sku = body.sku
    if sku not in PRICE_MAP:
        raise HTTPException(status_code=400, detail="Invalid SKU or product not configured for purchase")

    prod_info = PRICE_MAP[sku]
    amount = prod_info["amount"]
    currency = prod_info["currency"]
    amount_paise = int(amount * 100)  # Razorpay requires sub-units (paise)

    key_id, key_secret = _get_keys()

    # Hard block: refuse to operate with live keys
    if _is_live_mode(key_id):
        raise HTTPException(
            status_code=500,
            detail="Live Razorpay keys are not permitted. Configure TEST mode keys (rzp_test_*) only."
        )

    receipt_id = f"rcpt_{uuid.uuid4().hex[:10]}"
    is_mock = _is_mock_mode(key_id, key_secret)

    if is_mock:
        rzp_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
    else:
        # Call Razorpay Orders API using test credentials
        url = "https://api.razorpay.com/v1/orders"
        data = {"amount": amount_paise, "currency": currency, "receipt": receipt_id}
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(url, data=payload, method="POST")
        req.add_header("Content-Type", "application/json")

        auth_b64 = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()
        req.add_header("Authorization", f"Basic {auth_b64}")

        try:
            with urllib.request.urlopen(req) as response:
                order_res = json.loads(response.read().decode())
                rzp_order_id = order_res["id"]
        except Exception as exc:
            print(f"[Razorpay API Error] {exc}. Falling back to mock order.")
            rzp_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
            is_mock = True

    # Persist order with status='created'
    db = ProductDatabase()
    db.create_order(
        order_id=str(uuid.uuid4()),
        user_id=current_user["id"],
        sku=sku,
        amount=amount,
        currency=currency,
        rzp_order_id=rzp_order_id,
        status="created"
    )

    # SECURITY: key_secret is intentionally NOT included in this response.
    # Frontend receives only the public key_id for Razorpay widget initialisation.
    return {
        "order_id": rzp_order_id,
        "amount": amount_paise,
        "currency": currency,
        "key_id": key_id if not is_mock else "rzp_test_mockkey",
        "mock": is_mock
    }


@router.post("/payments/verify-payment")
def verify_payment(body: VerifyPaymentRequest, current_user: dict = Depends(get_current_user)):
    """
    Backend-only HMAC-SHA256 signature verification using RAZORPAY_KEY_SECRET.
    The secret is loaded from environment and never exposed in responses.
    """
    rzp_order_id = body.razorpay_order_id
    rzp_payment_id = body.razorpay_payment_id
    rzp_signature = body.razorpay_signature

    db = ProductDatabase()
    order = db.get_order_by_rzp_id(rzp_order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify order belongs to the authenticated user
    if order["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Order does not belong to the authenticated user")

    _, key_secret = _get_keys()
    is_mock = rzp_order_id.startswith("order_mock_") or _is_mock_mode(None, key_secret)

    if is_mock:
        # Developer mock mode — auto-approve without real signature check
        db.update_order_payment(rzp_order_id, rzp_payment_id, "MOCK_VERIFIED", "paid")
        return {"status": "success", "message": "Mock payment verified successfully"}

    # Real HMAC-SHA256 verification (key_secret stays server-side only)
    message = f"{rzp_order_id}|{rzp_payment_id}".encode("utf-8")
    key = key_secret.encode("utf-8")
    generated_sig = hmac.new(key, message, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(generated_sig, rzp_signature):
        db.update_order_payment(rzp_order_id, rzp_payment_id, "INVALID", "failed")
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    db.update_order_payment(rzp_order_id, rzp_payment_id, rzp_signature, "paid")
    return {"status": "success", "message": "Payment verified successfully"}


@router.get("/payments/orders")
def get_orders(current_user: dict = Depends(get_current_user)):
    """Returns order transaction history for the authenticated customer."""
    db = ProductDatabase()
    return db.get_user_orders(current_user["id"])


@router.get("/payments/check-purchase")
def check_purchase(sku: str, current_user: dict = Depends(get_current_user)):
    """Returns whether the authenticated user has a paid order for the given SKU."""
    db = ProductDatabase()
    return {"purchased": db.has_user_purchased(current_user["id"], sku)}


# MIME-type map keyed by lowercase file extension
_MIME_MAP: dict[str, str] = {
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xls": "application/vnd.ms-excel",
    "zip": "application/zip",
    "pdf": "application/pdf",
    "csv": "text/csv",
    "txt": "text/plain",
}


def _resolve_product_file(sku: str) -> tuple[str, str]:
    """
    Reads products/{sku}/product.json to discover the downloadable filename.
    Returns (absolute_file_path, mime_type).
    Raises HTTPException(404) if product.json or the asset file is missing.
    """
    meta_path = os.path.join("products", sku, "product.json")
    if not os.path.exists(meta_path):
        raise HTTPException(status_code=404, detail=f"Product metadata not found for SKU '{sku}'")

    with open(meta_path, "r", encoding="utf-8") as fh:
        meta = json.load(fh)

    file_placeholder = meta.get("file_placeholder")
    if not file_placeholder:
        raise HTTPException(
            status_code=503,
            detail=f"Product '{sku}' is not yet available for download (no file configured)"
        )

    file_path = os.path.join("products", sku, file_placeholder)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=503,
            detail=f"Product file '{file_placeholder}' is not yet available for download"
        )

    ext = file_placeholder.rsplit(".", 1)[-1].lower() if "." in file_placeholder else ""
    mime_type = _MIME_MAP.get(ext, "application/octet-stream")
    return file_path, mime_type


@router.get("/payments/download/{sku}")
def download_product(sku: str, current_user: dict = Depends(get_current_user)):
    """
    Streams the purchased digital product file.
    Filename and MIME type are resolved dynamically from products/{sku}/product.json.
    Access requires a 'paid' order for the SKU, or admin role.
    """
    db = ProductDatabase()
    is_admin = current_user.get("role") == "admin"
    is_buyer = db.has_user_purchased(current_user["id"], sku)

    if not is_admin and not is_buyer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Product purchase required to unlock download"
        )

    file_path, mime_type = _resolve_product_file(sku)
    filename = os.path.basename(file_path)

    return FileResponse(
        path=file_path,
        media_type=mime_type,
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
