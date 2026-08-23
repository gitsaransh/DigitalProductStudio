"""
Digital Product Studio — Cryptographic Token Manager and Auth Dependencies
"""

import hmac
import hashlib
import json
import base64
import time
import os
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
from src.core.database import ProductDatabase

# Secret key for token signing
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-dps-key")

def create_access_token(data: dict, expires_in: int = 86400) -> str:
    """
    Creates a signed access token containing data, valid for expires_in seconds.
    Uses standard HMAC SHA-256 for cryptographic signature (no external JWT library needed).
    """
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in
    payload_json = json.dumps(payload)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip("=")
    
    # Sign payload
    signature = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{payload_b64}.{sig_b64}"

def verify_access_token(token: str) -> Optional[dict]:
    """
    Verifies the cryptographic signature and expiration of a token.
    Returns the payload dictionary if valid, otherwise None.
    """
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig_b64 = parts
        
        # Verify signature first to prevent timing attacks
        expected_signature = hmac.new(JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_signature).decode().rstrip("=")
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
            
        # Decode payload
        pad = len(payload_b64) % 4
        payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * (4 - pad) if pad else payload_b64).decode()
        payload = json.loads(payload_json)
        
        # Check expiration
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the Bearer token from the Authorization header.
    Returns the user dictionary from the database.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication credentials")
    
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
        
    db = ProductDatabase()
    user = db.get_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
        
    return user

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    FastAPI dependency that restricts route access to users with the 'admin' role.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    return current_user
