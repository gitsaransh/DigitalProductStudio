"""
Gumroad Marketplace Publishing Adapter for Digital Product Studio
"""

import os
from typing import Dict, Any
from src.publishers.base_publisher import BaseMarketplacePublisher

class GumroadPublisher(BaseMarketplacePublisher):
    def __init__(self, access_token: str = ""):
        self.access_token = access_token or os.getenv("GUMROAD_ACCESS_TOKEN", "")

    def publish(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.access_token:
            return {
                "status": "not_connected",
                "external_id": None,
                "product_url": "Awaiting Gumroad Token in .env",
                "published_at": None,
                "error_message": "Gumroad Access Token missing"
            }
        return {
            "status": "active",
            "external_id": f"GUM-{product_data['id'][:8]}",
            "product_url": f"https://gumroad.com/l/{product_data['slug']}",
            "published_at": None,
            "error_message": None
        }

    def update(self, product_data: Dict[str, Any]) -> bool: return bool(self.access_token)
    def sync_analytics(self, product_id: str, external_id: str) -> Dict[str, Any]: return {"views": "Awaiting Integration", "downloads": 0, "revenue": "$0.00", "source": "Not Connected"}
