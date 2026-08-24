import os
import uuid
import time
import json
import urllib.request
import urllib.parse
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from src.core.database import ProductDatabase
from src.core.auth import create_access_token, get_current_user

# Production frontend URL — set via FRONTEND_URL env var.
# Falls back to the local Vite dev server for development.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174")

router = APIRouter()

class MockLoginRequest(BaseModel):
    email: str
    name: Optional[str] = "Mock User"
    avatar_url: Optional[str] = ""

@router.get("/auth/google/login")
def google_login(state: str = "dps_state"):
    """
    Redirects the user to Google's OAuth 2.0 Consent Screen.
    If GOOGLE_CLIENT_ID is not set, redirects back to the frontend
    requesting mock developer mode.
    """
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    
    if not client_id:
        # Fallback to dev mock mode
        return RedirectResponse(url=f"{FRONTEND_URL}/login?mock=true")
        
    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&state={state}"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
    return RedirectResponse(url=google_url)

@router.get("/auth/google/callback")
def google_callback(code: str, state: str = None):
    """
    Handles Google's OAuth redirect. Exchanges the authorization code for an ID/Access token,
    retrieves user profile info, registers/updates the user in the database, and redirects
    to the frontend with the signed session token.
    """
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    
    if not client_id or not client_secret:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=credentials_missing")
        
    # Exchange authorization code for token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    
    req_body = urllib.parse.urlencode(token_data).encode("utf-8")
    req = urllib.request.Request(token_url, data=req_body, headers={"Content-Type": "application/x-www-form-urlencoded"})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            access_token = res_data.get("access_token")
    except Exception as e:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=token_exchange_failed&detail={urllib.parse.quote(str(e))}")
        
    # Request user profile details
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    req_user = urllib.request.Request(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
    
    try:
        with urllib.request.urlopen(req_user) as response:
            user_info = json.loads(response.read().decode())
    except Exception as e:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=userinfo_failed&detail={urllib.parse.quote(str(e))}")
        
    google_id = user_info.get("sub")
    email = user_info.get("email", "").strip().lower()
    name = user_info.get("name", "")
    avatar_url = user_info.get("picture", "")
    
    if not email:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=email_missing")
        
    # Process user in the local database
    db = ProductDatabase()
    user = db.get_user_by_email(email)
    
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    admin_email = os.getenv("ADMIN_GOOGLE_EMAIL")
    is_admin = admin_email and email == admin_email.strip().lower()
    
    if user:
        # User already exists, preserve its role
        role = user.get("role", "customer")
        db.update_user(
            user["id"],
            google_id=google_id,
            name=name,
            avatar_url=avatar_url,
            last_login=now
        )
        user_id = user["id"]
    else:
        # Unknown Google users are automatically customer (unless matches ADMIN_GOOGLE_EMAIL)
        role = "admin" if is_admin else "customer"
        user_id = str(uuid.uuid4())
        db.create_user(
            id=user_id,
            google_id=google_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
            role=role,
            created_at=now,
            last_login=now
        )
        
    # Create session token
    token = create_access_token({"sub": user_id, "email": email, "role": role})
    
    # Redirect to frontend login page which will parse the token
    return RedirectResponse(url=f"{FRONTEND_URL}/login?token={token}")

@router.post("/auth/mock/login")
def mock_login(body: MockLoginRequest):
    """
    Mock developer login endpoint. Generates a valid signed token for any email.
    If the email matches ADMIN_GOOGLE_EMAIL, assigns the 'admin' role.
    If user already exists, preserves its role.
    """
    email = body.email.strip().lower()
    name = body.name or "Mock User"
    avatar_url = body.avatar_url or ""
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    db = ProductDatabase()
    user = db.get_user_by_email(email)
    
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    admin_email = os.getenv("ADMIN_GOOGLE_EMAIL")
    is_admin = admin_email and email == admin_email.strip().lower()
    
    if user:
        # User exists, preserve role
        role = user.get("role", "customer")
        db.update_user(
            user["id"],
            name=name,
            avatar_url=avatar_url,
            last_login=now
        )
        user_id = user["id"]
    else:
        # Create as admin if matches ADMIN_GOOGLE_EMAIL, otherwise customer
        role = "admin" if is_admin else "customer"
        user_id = str(uuid.uuid4())
        db.create_user(
            id=user_id,
            google_id=None,
            email=email,
            name=name,
            avatar_url=avatar_url,
            role=role,
            created_at=now,
            last_login=now
        )
        
    token = create_access_token({"sub": user_id, "email": email, "role": role})
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
            "role": role,
            "created_at": user.get("created_at", now) if user else now,
            "last_login": now
        }
    }

@router.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile details.
    """
    return current_user

class GoogleVerifyRequest(BaseModel):
    id_token: str

@router.post("/auth/google/verify")
def google_verify(body: GoogleVerifyRequest):
    """
    Verifies the Google ID Token sent by the frontend GSI library,
    registers or updates the user in the database, and returns a session token.
    """
    client_id = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID is not configured on the server")
        
    id_token = body.id_token
    
    # Call Google's tokeninfo endpoint to verify the ID token
    tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    
    import urllib.request
    import json
    
    try:
        req = urllib.request.Request(tokeninfo_url)
        with urllib.request.urlopen(req) as response:
            token_info = json.loads(response.read().decode())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google ID Token: {str(e)}")
        
    # Verify the audience (must match our client_id)
    aud = token_info.get("aud")
    if aud != client_id:
        raise HTTPException(status_code=400, detail="Google ID Token audience mismatch")
        
    google_id = token_info.get("sub")
    email = token_info.get("email", "").strip().lower()
    name = token_info.get("name", "")
    avatar_url = token_info.get("picture", "")
    
    if not email:
        raise HTTPException(status_code=400, detail="Google ID Token is missing email address")
        
    db = ProductDatabase()
    user = db.get_user_by_email(email)
    
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    admin_email = os.getenv("ADMIN_GOOGLE_EMAIL")
    is_admin = admin_email and email == admin_email.strip().lower()
    
    if user:
        role = user.get("role", "customer")
        db.update_user(
            user["id"],
            google_id=google_id,
            name=name,
            avatar_url=avatar_url,
            last_login=now
        )
        user_id = user["id"]
    else:
        role = "admin" if is_admin else "customer"
        user_id = str(uuid.uuid4())
        db.create_user(
            id=user_id,
            google_id=google_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
            role=role,
            created_at=now,
            last_login=now
        )
        
    token = create_access_token({"sub": user_id, "email": email, "role": role})
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
            "role": role,
            "created_at": user.get("created_at", now) if user else now,
            "last_login": now
        }
    }
