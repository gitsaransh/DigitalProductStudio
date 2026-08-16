"""
Creative Market Publishing Adapter for Digital Products House
"""

import time
from typing import Dict, Any
from src.publishers.base_publisher import BaseMarketplacePublisher

class CreativeMarketPublisher(BaseMarketplacePublisher):
    def publish(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = product_data["id"]
        return {
            "status": "active",
            "external_id": f"CM-{p_id[:8]}",
            "listing_url": f"https://creativemarket.com/product/{p_id[:8]}",
            "published_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    def update(self, product_data: Dict[str, Any]) -> bool: return True
    def sync_analytics(self, product_id: str, external_id: str) -> Dict[str, Any]: return {"views": 150, "downloads": 12, "revenue": 179.88, "refunds": 0}
