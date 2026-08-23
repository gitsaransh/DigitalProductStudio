"""
Integration and Unit Tests for Razorpay Sandbox checkout, signature verification, and download gating.
"""

import unittest
import os
import shutil
import tempfile
import time
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Create temp database path
temp_dir = tempfile.mkdtemp()
temp_db_path = os.path.join(temp_dir, "test_payments_catalog.db")

# Patch ProductDatabase to use the temporary database file BEFORE importing the API app
from src.core.database import ProductDatabase
original_init = ProductDatabase.__init__

def patched_init(self, db_path: str = temp_db_path):
    original_init(self, db_path)

ProductDatabase.__init__ = patched_init

# Configure environmental variables for testing
os.environ["ADMIN_GOOGLE_EMAIL"] = "admin@digitalproductstudio.in"
os.environ["RAZORPAY_KEY_ID"] = "rzp_test_placeholder_id"
os.environ["RAZORPAY_KEY_SECRET"] = "rzp_test_placeholder_secret"

# Create product folders in the temp directory to test file downloads
os.makedirs("products/DPS-PRM-001", exist_ok=True)
with open("products/DPS-PRM-001/prompt_vault_master.csv", "w", encoding="utf-8") as f:
    f.write("id,prompt_text,category\n1,Write a marketing SOP,Marketing")

from src.api.main import app

class TestPaymentsAndGating(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = ProductDatabase()

    @classmethod
    def tearDownClass(cls):
        # Clean up temporary database files and directories
        if os.path.exists("products/DPS-PRM-001"):
            shutil.rmtree("products/DPS-PRM-001")
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

    def setUp(self):
        # Clean users and orders tables before each test
        with self.db._get_connection() as conn:
            conn.execute("DELETE FROM orders")
            conn.execute("DELETE FROM users")
            conn.commit()

        # Seed test user
        self.user_email = "buyer@gmail.com"
        res = self.client.post("/api/auth/mock/login", json={
            "email": self.user_email,
            "name": "Buyer Customer"
        })
        self.token = res.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_create_order_invalid_sku(self):
        response = self.client.post(
            "/api/payments/create-order",
            json={"sku": "INVALID-SKU"},
            headers=self.headers
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Invalid SKU or product not configured for purchase")

    def test_create_order_success_mock(self):
        # When key starts with rzp_test_placeholder, it generates a mock order
        response = self.client.post(
            "/api/payments/create-order",
            json={"sku": "DPS-PRM-001"},
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["mock"])
        self.assertTrue(data["order_id"].startswith("order_mock_"))
        self.assertEqual(data["amount"], 49900)
        self.assertEqual(data["currency"], "INR")

        # Verify stored in SQLite db
        db_order = self.db.get_order_by_rzp_id(data["order_id"])
        self.assertIsNotNone(db_order)
        self.assertEqual(db_order["status"], "created")
        self.assertEqual(db_order["sku"], "DPS-PRM-001")

    def test_verify_payment_mock_success(self):
        # 1. Create order
        order_res = self.client.post(
            "/api/payments/create-order",
            json={"sku": "DPS-PRM-001"},
            headers=self.headers
        )
        rzp_order_id = order_res.json()["order_id"]

        # 2. Verify payment (should succeed automatically for mock order)
        verify_res = self.client.post(
            "/api/payments/verify-payment",
            json={
                "razorpay_order_id": rzp_order_id,
                "razorpay_payment_id": "pay_mock_12345",
                "razorpay_signature": "mock_signature_approved"
            },
            headers=self.headers
        )
        self.assertEqual(verify_res.status_code, 200)
        self.assertEqual(verify_res.json()["status"], "success")

        # Check DB updated status
        db_order = self.db.get_order_by_rzp_id(rzp_order_id)
        self.assertEqual(db_order["status"], "paid")
        self.assertEqual(db_order["razorpay_payment_id"], "pay_mock_12345")
        # Hardened: backend stores MOCK_VERIFIED, never echoing client-supplied signature
        self.assertEqual(db_order["razorpay_signature"], "MOCK_VERIFIED")

    def test_gated_download_protection(self):
        # 1. Access before purchasing -> should fail (403 Forbidden)
        response = self.client.get(
            "/api/payments/download/DPS-PRM-001",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("purchase required", response.json()["detail"].lower())

        # 2. Complete mock order purchase
        order_res = self.client.post(
            "/api/payments/create-order",
            json={"sku": "DPS-PRM-001"},
            headers=self.headers
        )
        rzp_order_id = order_res.json()["order_id"]

        self.client.post(
            "/api/payments/verify-payment",
            json={
                "razorpay_order_id": rzp_order_id,
                "razorpay_payment_id": "pay_mock_12345",
                "razorpay_signature": "mock_sig"
            },
            headers=self.headers
        )

        # 3. Access after purchase -> should succeed (200 OK and stream file)
        response2 = self.client.get(
            "/api/payments/download/DPS-PRM-001",
            headers=self.headers
        )
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response2.headers["content-type"], "text/csv; charset=utf-8")
        self.assertIn("Write a marketing SOP", response2.text)

    def test_orders_history_endpoint(self):
        # Create order
        self.client.post(
            "/api/payments/create-order",
            json={"sku": "DPS-PRM-001"},
            headers=self.headers
        )

        # Get list
        response = self.client.get("/api/payments/orders", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        orders_list = response.json()
        self.assertEqual(len(orders_list), 1)
        self.assertEqual(orders_list[0]["sku"], "DPS-PRM-001")

if __name__ == "__main__":
    unittest.main()
