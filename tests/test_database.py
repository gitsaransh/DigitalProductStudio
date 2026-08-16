"""
Unit & Integration Tests for ProductDatabase
"""

import unittest
import os
import shutil
import tempfile
import uuid
from src.core.database import ProductDatabase

class TestProductDatabase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, "test_catalog.db")
        self.db = ProductDatabase(self.db_path)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_upsert_and_get_product(self):
        p_id = str(uuid.uuid4())
        product_data = {
            "id": p_id,
            "sku": "DPH-TEST-001",
            "title": "Test Product Title",
            "slug": "test-product-title",
            "category": "Planners & Organizers",
            "status": "draft",
            "file_hash": "a" * 64,
            "pricing": {"base_price": 9.99, "currency": "USD"},
            "marketplaces": {"etsy": {"status": "draft"}}
        }

        res_id = self.db.upsert_product(product_data)
        self.assertEqual(res_id, p_id)

        fetched = self.db.get_product(p_id)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["title"], "Test Product Title")

    def test_find_by_hash(self):
        p_id = str(uuid.uuid4())
        fake_hash = "b" * 64
        product_data = {
            "id": p_id,
            "title": "Hash Test Product",
            "slug": "hash-test-product",
            "category": "Templates",
            "status": "draft",
            "file_hash": fake_hash,
            "pricing": {"base_price": 14.99}
        }
        self.db.upsert_product(product_data)

        existing = self.db.find_by_hash(fake_hash)
        self.assertIsNotNone(existing)
        self.assertEqual(existing["id"], p_id)

    def test_fts5_search(self):
        p_id = str(uuid.uuid4())
        product_data = {
            "id": p_id,
            "title": "Unique Keyword Search Test",
            "slug": "unique-search",
            "category": "Planners & Organizers",
            "description": "Special hidden query keyword",
            "tags": ["unique", "test"],
            "status": "draft",
            "file_hash": "c" * 64,
            "pricing": {"base_price": 12.00}
        }
        self.db.upsert_product(product_data)

        results = self.db.search_products("Unique")
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["id"], p_id)

    def test_catalog_stats(self):
        stats = self.db.get_catalog_stats()
        self.assertIn("total_products", stats)
        self.assertIn("status_breakdown", stats)

if __name__ == "__main__":
    unittest.main()
