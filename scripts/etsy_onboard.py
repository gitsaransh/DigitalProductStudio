"""
Etsy API v3 OAuth2 End-to-End Onboarding Assistant
"""

import os
import sys
import webbrowser
import urllib.parse
from typing import Dict, Any

# Adjust path to find src package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.etsy.oauth_handler import EtsyOAuthHandler

def update_env_file(updates: dict):
    env_path = ".env"
    if not os.path.exists(env_path):
        with open(env_path, "w") as f:
            f.write("# Environment Configuration\n")
            
    with open(env_path, "r") as f:
        lines = f.readlines()
        
    for key, val in list(updates.items()):
        found = False
        for idx, line in enumerate(lines):
            if line.strip().startswith(f"{key}="):
                lines[idx] = f"{key}={val}\n"
                found = True
                break
        if not found:
            lines.append(f"{key}={val}\n")
            
    with open(env_path, "w") as f:
        f.writelines(lines)

def main():
    print("=" * 60)
    print("        ETSY API V3 ONBOARDING PROCESS ASSISTANT")
    print("=" * 60)
    
    # Load client ID
    client_id = os.getenv("ETSY_API_KEY", "")
    if not client_id:
        print("\n[STEP 1] Retrieve Etsy Keystring (Client ID)")
        print("To proceed, you must register a developer application at:")
        print("https://developer.etsy.com/portal/register")
        print("Set the Redirect URI to: http://localhost:5174/oauth/callback")
        
        client_id = input("\nEnter your Etsy App Client ID (Keystring): ").strip()
        if not client_id:
            print("Error: Client ID is required to start authorization.")
            sys.exit(1)
            
    shop_id = os.getenv("ETSY_SHOP_ID", "ZenithPlannersCo")
    
    # Initialize Handler
    handler = EtsyOAuthHandler(client_id=client_id)
    
    print("\n[STEP 2] Generate Authorization Link")
    auth_url, state, code_verifier = handler.generate_authorization_url()
    
    print("OAuth authorization URL generated successfully.")
    print("We will now attempt to open it in your browser...")
    
    # Try opening browser
    try:
        webbrowser.open(auth_url)
    except Exception as e:
        print(f"Unable to open browser automatically: {e}")
        
    print("\nIf the browser did not open, copy and paste this link manually:")
    print("-" * 60)
    print(auth_url)
    print("-" * 60)
    
    print("\n[STEP 3] Capture Authorization Callback")
    print("Log in, grant permissions, and copy the resulting redirect URL from your browser address bar.")
    print("It should look like: http://localhost:5174/oauth/callback?code=xxxx&state=yyyy")
    
    callback_url = input("\nPaste the callback URL here: ").strip()
    if not callback_url:
        print("Error: Callback URL cannot be empty.")
        sys.exit(1)
        
    # Parse code and state
    parsed = urllib.parse.urlparse(callback_url)
    query_params = urllib.parse.parse_qs(parsed.query)
    
    code = query_params.get("code", [""])[0]
    returned_state = query_params.get("state", [""])[0]
    
    if not code:
        print("Error: Could not find 'code' parameter in pasted URL.")
        sys.exit(1)
        
    # Validate state
    if not handler.validate_callback_params(code, returned_state, state):
        print("Error: State parameter mismatch. Security check failed.")
        sys.exit(1)
        
    print("\n[STEP 4] Exchange Authorization Code for Access & Refresh Tokens")
    tokens = handler.exchange_code_for_tokens(code, code_verifier)
    
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    
    if not access_token:
        print("Error: Token exchange failed. Access token not retrieved.")
        sys.exit(1)
        
    print(f"\n[SUCCESS] Retrieved Access Token (ends in ...{access_token[-5:]})")
    
    # Save to env
    print("\n[STEP 5] Writing credentials to .env file...")
    updates = {
        "ETSY_API_KEY": client_id,
        "ETSY_SHOP_ID": shop_id,
        "VITE_ETSY_API_KEY": client_id,
        "VITE_ETSY_SHOP_ID": shop_id,
        "VITE_ETSY_ACCESS_TOKEN": access_token,
        "VITE_ETSY_REFRESH_TOKEN": refresh_token
    }
    update_env_file(updates)
    print("Credentials saved successfully. The storefront and dashboard can now consume live API metrics!")
    print("=" * 60)

if __name__ == "__main__":
    main()
