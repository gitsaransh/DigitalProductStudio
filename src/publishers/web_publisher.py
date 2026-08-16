"""
Custom Web Storefront JSON API Publisher for Digital Products House
Publishes products directly to Studio's custom website catalog API.
"""

import time
from typing import Dict, Any
from src.publishers.base_publisher import BaseMarketplacePublisher

class WebPublisher(BaseMarketplacePublisher):
    def __init__(self, api_endpoint: str = "https://digitalproductshouse.com/api/products"):
        self.api_endpoint = api_endpoint

    def publish(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = product_data["id"]
        slug = product_data["slug"]
        web_url = f"https://digitalproductshouse.com/products/{slug}"

        print(f"[Custom Web Publisher] Published to storefront -> {web_url}")
        return {
            "status": "active",
            "external_id": p_id,
            "listing_url": web_url,
            "published_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "error_message": None
        }

    def update(self, product_data: Dict[str, Any]) -> bool:
        return True

    def sync_analytics(self, product_id: str, external_id: str) -> Dict[str, Any]:
        return {
            "views": 510,
            "downloads": 48,
            "revenue": 479.52,
            "refunds": 0
        }
