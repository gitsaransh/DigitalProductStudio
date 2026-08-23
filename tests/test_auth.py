"""
Unit & Integration Tests for Google Authentication & RBAC
"""

import unittest
import os
import shutil
import tempfile
import time
from fastapi.testclient import TestClient

# Create temp database path
temp_dir = tempfile.mkdtemp()
temp_db_path = os.path.join(temp_dir, "test_auth_catalog.db")

# Patch ProductDatabase to use the temporary database file BEFORE importing the API app
from src.core.database import ProductDatabase
original_init = ProductDatabase.__init__

def patched_init(self, db_path: str = temp_db_path):
    original_init(self, db_path)

ProductDatabase.__init__ = patched_init

# Configure environmental variables for testing
os.environ["ADMIN_GOOGLE_EMAIL"] = "admin@digitalproductstudio.in"
os.environ["GOOGLE_CLIENT_ID"] = "mock-client-id"
os.environ["GOOGLE_CLIENT_SECRET"] = "mock-client-secret"
os.environ["GOOGLE_REDIRECT_URI"] = "http://localhost:8000/api/auth/google/callback"
os.environ["JWT_SECRET"] = "test-secret-key-12345"

from src.api.main import app
from src.core.auth import create_access_token, verify_access_token

class TestAuthAndRbac(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = ProductDatabase()
        
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(temp_dir)

    def test_token_creation_and_verification(self):
        payload = {"sub": "user_id_123", "email": "test@example.com", "role": "customer"}
        token = create_access_token(payload, expires_in=10)
        
        decoded = verify_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "user_id_123")
        self.assertEqual(decoded["email"], "test@example.com")
        self.assertEqual(decoded["role"], "customer")
        self.assertTrue(decoded["exp"] > time.time())

        # Test invalid token
        self.assertIsNone(verify_access_token("invalid.token"))

        # Test expired token
        expired_token = create_access_token(payload, expires_in=-10)
        self.assertIsNone(verify_access_token(expired_token))

    def test_mock_login_customer(self):
        response = self.client.post("/api/auth/mock/login", json={
            "email": "customer@gmail.com",
            "name": "Jane Customer",
            "avatar_url": "http://avatar.url/jane"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "customer")
        self.assertEqual(data["user"]["email"], "customer@gmail.com")
        self.assertEqual(data["user"]["name"], "Jane Customer")

        # Verify in DB
        db_user = self.db.get_user(data["user"]["id"])
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user["role"], "customer")

    def test_mock_login_admin(self):
        # The admin email matches the configured ADMIN_GOOGLE_EMAIL
        response = self.client.post("/api/auth/mock/login", json={
            "email": "admin@digitalproductstudio.in",
            "name": "Alex Admin",
            "avatar_url": "http://avatar.url/alex"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "admin")
        
        # Verify in DB
        db_user = self.db.get_user(data["user"]["id"])
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user["role"], "admin")

    def test_role_preservation_on_subsequent_logins(self):
        # 1. Login as customer
        response = self.client.post("/api/auth/mock/login", json={"email": "preserve@gmail.com", "name": "Preserve User"})
        user_id = response.json()["user"]["id"]
        
        # 2. Update role to 'admin' in database manually
        self.db.update_user(user_id, role="admin")
        
        # 3. Login again via mock login
        response2 = self.client.post("/api/auth/mock/login", json={"email": "preserve@gmail.com", "name": "Preserve User Updated"})
        self.assertEqual(response2.json()["user"]["role"], "admin") # Preserved the role!

    def test_auth_me_endpoint(self):
        # 1. Create a user and token
        response = self.client.post("/api/auth/mock/login", json={"email": "profile@gmail.com"})
        token = response.json()["token"]
        
        # 2. Fetch profile without token (should fail)
        response_fail = self.client.get("/api/auth/me")
        self.assertEqual(response_fail.status_code, 401)
        
        # 3. Fetch profile with token (should succeed)
        response_success = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response_success.status_code, 200)
        self.assertEqual(response_success.json()["email"], "profile@gmail.com")

    def test_protected_routes(self):
        # 1. Create customer token and admin token
        res_cust = self.client.post("/api/auth/mock/login", json={"email": "cust_route@gmail.com"})
        token_cust = res_cust.json()["token"]
        
        res_adm = self.client.post("/api/auth/mock/login", json={"email": "admin@digitalproductstudio.in"})
        token_adm = res_adm.json()["token"]

        # 2. Test /api/stats (protected route)
        # Without auth (401)
        resp = self.client.get("/api/stats")
        self.assertEqual(resp.status_code, 401)

        # With customer auth (403 Access Denied)
        resp = self.client.get("/api/stats", headers={"Authorization": f"Bearer {token_cust}"})
        self.assertEqual(resp.status_code, 403)

        # With admin auth (200 OK)
        resp = self.client.get("/api/stats", headers={"Authorization": f"Bearer {token_adm}"})
        self.assertEqual(resp.status_code, 200)

if __name__ == "__main__":
    unittest.main()
