"""
Verification simulation for Google Authentication & RBAC routing rules.
"""

import unittest
import os
import json
from fastapi.testclient import TestClient

from src.core.database import ProductDatabase
from src.api.main import app

class TestRbacSimulation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database is instantiated (which seeds the admin email from .env)
        cls.db = ProductDatabase()
        cls.client = TestClient(app)
        cls.admin_email = os.getenv("ADMIN_GOOGLE_EMAIL", "digitalproductstudio.admin@gmail.com")
        cls.customer_email = "personal.gmail@gmail.com"

    def test_simulation_flow(self):
        print(f"\n--- Starting Authentication & RBAC Simulation ---")
        print(f"Configured Admin Email in .env: {self.admin_email}")
        
        # 1. Login with digitalproductstudio.admin@gmail.com
        print(f"Step 1: Logging in as admin ({self.admin_email})...")
        resp_admin = self.client.post("/api/auth/mock/login", json={
            "email": self.admin_email,
            "name": "DPS Admin Owner"
        })
        self.assertEqual(resp_admin.status_code, 200)
        admin_data = resp_admin.json()
        self.assertEqual(admin_data["user"]["role"], "admin")
        print(f"  Result: Success. Role: {admin_data['user']['role']}")
        
        # Verify access to admin endpoint
        print("  Verifying admin can access /api/stats...")
        resp_stats_admin = self.client.get("/api/stats", headers={"Authorization": f"Bearer {admin_data['token']}"})
        self.assertEqual(resp_stats_admin.status_code, 200)
        print("  Result: Success. Access granted (200 OK)")

        # 2. Login with personal Gmail (customer)
        print(f"Step 2: Logging in as customer ({self.customer_email})...")
        resp_cust = self.client.post("/api/auth/mock/login", json={
            "email": self.customer_email,
            "name": "Personal Account"
        })
        self.assertEqual(resp_cust.status_code, 200)
        cust_data = resp_cust.json()
        self.assertEqual(cust_data["user"]["role"], "customer")
        print(f"  Result: Success. Role: {cust_data['user']['role']}")
        
        # Verify access is blocked (403 Forbidden)
        print("  Verifying customer is BLOCKED from /api/stats...")
        resp_stats_cust = self.client.get("/api/stats", headers={"Authorization": f"Bearer {cust_data['token']}"})
        self.assertEqual(resp_stats_cust.status_code, 403)
        print(f"  Result: Success. Access blocked with code {resp_stats_cust.status_code} (403 Forbidden)")

        print("--- Simulation Completed Successfully ---")

if __name__ == "__main__":
    unittest.main()
