"""
Unit Tests for Product Lifecycle State Machine
"""

import unittest
import os
import shutil
import tempfile
import uuid
from src.core.database import ProductDatabase
from src.lifecycle.lifecycle_manager import ProductLifecycleManager

class TestLifecycleManager(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, "test_lifecycle.db")
        self.db = ProductDatabase(self.db_path)
        self.mgr = ProductLifecycleManager(self.db)

        self.p_id = str(uuid.uuid4())
        self.db.upsert_product({
            "id": self.p_id,
            "title": "Lifecycle Test Item",
            "slug": "lifecycle-test-item",
            "category": "Planners",
            "lifecycle_state": "idea",
            "status": "draft",
            "file_hash": "d" * 64,
            "pricing": {"base_price": 10.0}
        })

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_state_transitions(self):
        # Valid state transitions
        p1 = self.mgr.transition_state(self.p_id, "research", notes="Research step")
        self.assertEqual(p1["lifecycle_state"], "research")

        p2 = self.mgr.transition_state(self.p_id, "generating", notes="Generating payload")
        self.assertEqual(p2["lifecycle_state"], "generating")

        p3 = self.mgr.transition_state(self.p_id, "review", notes="QA review")
        self.assertEqual(p3["lifecycle_state"], "review")

        # Verify audit history logged
        history = p3.get("lifecycle_history", [])
        self.assertGreaterEqual(len(history), 3)

    def test_invalid_state_rejection(self):
        with self.assertRaises(ValueError):
            self.mgr.transition_state(self.p_id, "invalid_nonexistent_state")

if __name__ == "__main__":
    unittest.main()
