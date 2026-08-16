"""
Human-in-the-Loop Manual Approval Manager for Digital Products House
Enforces quality control before products are published to live marketplaces.
"""

from typing import Dict, Any, List
from src.core.database import ProductDatabase
from src.publishers.etsy_publisher import EtsyPublisher
from src.publishers.gumroad_publisher import GumroadPublisher
from src.publishers.lemonsqueezy_publisher import LemonSqueezyPublisher
from src.publishers.web_publisher import WebPublisher

class ApprovalManager:
    def __init__(self, db: ProductDatabase = None):
        self.db = db or ProductDatabase()
        self.publishers = {
            "etsy": EtsyPublisher(),
            "gumroad": GumroadPublisher(),
            "lemonsqueezy": LemonSqueezyPublisher(),
            "custom_web": WebPublisher()
        }

    def get_pending_approvals(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns list of products awaiting human studio director review."""
        # Queries the indexed lifecycle_state column directly (D-009)
        return self.db.list_products(lifecycle_state="review", limit=limit)

    def approve_and_publish(self, product_id: str, target_marketplaces: List[str] = None) -> Dict[str, Any]:
        """
        Approves product listing and triggers multi-channel publishing.
        """
        product = self.db.get_product(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")

        # 1. Update internal status to approved
        product["status"] = "approved"

        # 2. Publish to selected or all enabled channels
        target_marketplaces = target_marketplaces or ["etsy", "gumroad", "lemonsqueezy", "custom_web"]
        mp_results = product.get("marketplaces", {})

        for mp_name in target_marketplaces:
            if mp_name in self.publishers:
                publisher = self.publishers[mp_name]
                try:
                    res = publisher.publish(product)
                    mp_results[mp_name] = {
                        "listing_id": res.get("external_id"),
                        "status": res.get("status", "active"),
                        "published_at": res.get("published_at"),
                        "listing_url": res.get("listing_url") or res.get("product_url") or res.get("buy_url")
                    }
                except Exception as e:
                    print(f"[Error] Failed publishing to {mp_name}: {e}")
                    mp_results[mp_name] = {
                        "listing_id": None,
                        "status": "error",
                        "published_at": None,
                        "listing_url": None
                    }

        product["marketplaces"] = mp_results
        product["status"] = "published"

        # 3. Save updated state into DB
        self.db.upsert_product(product)
        print(f"[ApprovalManager] Product {product_id} APPROVED and published to {target_marketplaces}")
        return product

    def reject_product(self, product_id: str, reason: str = "Quality review rejected") -> Dict[str, Any]:
        """Rejects product listing and returns to draft or rejected state."""
        product = self.db.get_product(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")

        product["status"] = "rejected"
        product["rejection_reason"] = reason
        self.db.upsert_product(product)
        print(f"[ApprovalManager] Product {product_id} REJECTED: {reason}")
        return product
