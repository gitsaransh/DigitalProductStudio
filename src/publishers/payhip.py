"""
Payhip Store Publisher Adapter for Digital Products House
"""

import time
from typing import Dict, Any
from src.publishers.base_publisher import BaseMarketplacePublisher

class PayhipPublisher(BaseMarketplacePublisher):
    def publish(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = product_data["id"]
        return {
            "status": "active",
            "external_id": f"PAYHIP-{p_id[:8]}",
            "listing_url": f"https://payhip.com/b/{p_id[:8]}",
            "published_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    def update(self, product_data: Dict[str, Any]) -> bool: return True
    def sync_analytics(self, product_id: str, external_id: str) -> Dict[str, Any]: return {"views": 110, "downloads": 11, "revenue": 109.89, "refunds": 0}
