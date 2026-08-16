"""
Unit & Integration Tests for the FastAPI Bridge Server
"""

import unittest
import os
import shutil
import tempfile
import uuid

# Create temp database path
temp_dir = tempfile.mkdtemp()
temp_db_path = os.path.join(temp_dir, "test_api_catalog.db")

# Patch ProductDatabase to use the temporary database file BEFORE importing the API app
from src.core.database import ProductDatabase
original_init = ProductDatabase.__init__

def patched_init(self, db_path: str = temp_db_path):
    original_init(self, db_path)

ProductDatabase.__init__ = patched_init

# Now import TestClient and the app
from fastapi.testclient import TestClient
from src.api.main import app

class TestFastApiServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = ProductDatabase()
        
        # Populate the test database with a few items
        cls.p1_id = str(uuid.uuid4())
        cls.p1 = {
            "id": cls.p1_id,
            "sku": "API-TEST-001",
            "title": "Aesthetic Life Planner 2026",
            "slug": "aesthetic-life-planner-2026",
            "category": "Planners",
            "lifecycle_state": "review",
            "status": "draft",
            "file_hash": "e" * 64,
            "pricing": {"base_price": 9.99, "currency": "USD"},
            "marketplaces": {}
        }
        cls.db.upsert_product(cls.p1)

        cls.p2_id = str(uuid.uuid4())
        cls.p2 = {
            "id": cls.p2_id,
            "sku": "API-TEST-002",
            "title": "Excel Budget Calculator",
            "slug": "excel-budget-calculator",
            "category": "Calculators",
            "lifecycle_state": "idea",
            "status": "draft",
            "file_hash": "f" * 64,
            "pricing": {"base_price": 14.99, "currency": "USD"},
            "marketplaces": {}
        }
        cls.db.upsert_product(cls.p2)

    @classmethod
    def tearDownClass(cls):
        # Cleanup temp directory
        shutil.rmtree(temp_dir)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["total_products"], 2)

    def test_list_products(self):
        response = self.client.get("/api/products")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 2)
        
        # Test status filter
        response = self.client.get("/api/products?status=draft")
        self.assertEqual(response.json()["count"], 2)

        # Test category filter
        response = self.client.get("/api/products?category=Planners")
        self.assertEqual(response.json()["count"], 1)

    def test_get_product_by_id(self):
        response = self.client.get(f"/api/products/{self.p1_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.p1_id)
        self.assertEqual(data["title"], "Aesthetic Life Planner 2026")

        # Test 404
        response = self.client.get("/api/products/non-existent-id")
        self.assertEqual(response.status_code, 404)

    def test_search_products(self):
        response = self.client.get("/api/products/search?q=Excel")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["products"][0]["id"], self.p2_id)

    def test_get_stats(self):
        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_products"], 2)
        self.assertEqual(data["category_breakdown"]["Planners"], 1)

    def test_pending_approvals(self):
        response = self.client.get("/api/approvals/pending")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Item 1 is in "review" state, so it should be pending approval
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["pending"][0]["id"], self.p1_id)

    def test_approve_and_reject_flow(self):
        # Create a new product specifically for testing approve/reject flow
        p_id = str(uuid.uuid4())
        p = {
            "id": p_id,
            "sku": "API-TEST-003",
            "title": "Flow Test Product",
            "slug": "flow-test-product",
            "category": "Planners",
            "lifecycle_state": "review",
            "status": "draft",
            "file_hash": "0" * 64,
            "pricing": {"base_price": 5.00, "currency": "USD"},
            "marketplaces": {}
        }
        self.db.upsert_product(p)

        # 1. Reject first
        response = self.client.post(f"/api/approvals/{p_id}/reject", json={"reason": "Incorrect image resolution"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "rejected")
        self.assertEqual(response.json()["product"]["status"], "rejected")
        self.assertEqual(response.json()["product"]["rejection_reason"], "Incorrect image resolution")

        # 2. Approve
        response = self.client.post(f"/api/approvals/{p_id}/approve")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "approved")
        self.assertEqual(response.json()["product"]["status"], "published")

        # Cleanup
        with self.db._get_connection() as conn:
            conn.execute("DELETE FROM products WHERE id = ?", (p_id,))
            conn.execute("DELETE FROM products_fts WHERE id = ?", (p_id,))
            conn.commit()

if __name__ == "__main__":
    unittest.main()
