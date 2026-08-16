"""
Unit Tests for All 10 Marketplace Publisher Adapters
"""

import unittest
import uuid
from src.publishers.etsy_publisher import EtsyPublisher
from src.publishers.gumroad_publisher import GumroadPublisher
from src.publishers.lemonsqueezy_publisher import LemonSqueezyPublisher
from src.publishers.web_publisher import WebPublisher
from src.publishers.creative_market import CreativeMarketPublisher
from src.publishers.shopify import ShopifyPublisher
from src.publishers.woocommerce import WooCommercePublisher
from src.publishers.kofi import KofiPublisher
from src.publishers.payhip import PayhipPublisher
from src.publishers.amazon_digital import AmazonDigitalPublisher

class TestPublisherAdapters(unittest.TestCase):
    def setUp(self):
        self.sample_product = {
            "id": str(uuid.uuid4()),
            "title": "Universal Test Listing Title",
            "slug": "universal-test-listing-title",
            "category": "Planners",
            "pricing": {"base_price": 9.99, "currency": "USD"},
            "tags": ["test", "planner"]
        }

    def test_all_publishers_contract(self):
        # 1. Test un-connected state when keys missing
        etsy_unconnected = EtsyPublisher(api_key="")
        res_un = etsy_unconnected.publish(self.sample_product)
        self.assertEqual(res_un.get("status"), "not_connected")

        # 2. Test connected state when keys provided
        publishers = [
            EtsyPublisher(api_key="test_key"),
            GumroadPublisher(access_token="test_token"),
            LemonSqueezyPublisher(),
            WebPublisher(),
            CreativeMarketPublisher(),
            ShopifyPublisher(),
            WooCommercePublisher(),
            KofiPublisher(),
            PayhipPublisher(),
            AmazonDigitalPublisher()
        ]

        for pub in publishers:
            res = pub.publish(self.sample_product)
            self.assertIsNotNone(res)
            self.assertEqual(res.get("status"), "active")
            self.assertIsNotNone(res.get("external_id"))

            analytics = pub.sync_analytics(self.sample_product["id"], res["external_id"])
            self.assertIn("views", analytics)
            self.assertIn("downloads", analytics)

if __name__ == "__main__":
    unittest.main()
