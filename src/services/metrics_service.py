"""
Unified Metrics Service for Digital Product Studio
Acts as the central middleware layer between the Dashboard UI and the underlying Data Source Layer.
Decouples dashboard rendering from raw data source implementation details.

Architecture:
Dashboard -> Metrics Service -> Data Source Layer -> [Live APIs, Database, AI Models, Manual Input, Demo Provider]
"""

from typing import Dict, Any, List
from src.datasources.live_api_provider import LiveApiProvider
from src.datasources.database_provider import DatabaseProvider
from src.datasources.ai_model_provider import AiModelProvider
from src.datasources.manual_input_provider import ManualInputProvider
from src.datasources.demo_provider import DemoSandboxProvider

class MetricsService:
    def __init__(self):
        self.live_api = LiveApiProvider()
        self.db_provider = DatabaseProvider()
        self.ai_provider = AiModelProvider()
        self.manual_provider = ManualInputProvider()
        self.demo_provider = DemoSandboxProvider()

    def get_executive_summary(self) -> Dict[str, Any]:
        """
        Consolidates top-level executive COO metrics from underlying Data Source Providers.
        """
        revenue_metric = self.live_api.fetch_metric("gross_revenue")
        orders_metric = self.live_api.fetch_metric("live_orders")
        catalog_metric = self.db_provider.fetch_metric("total_products")
        review_metric = self.db_provider.fetch_metric("products_waiting_review")
        target_metric = self.manual_provider.fetch_metric("monthly_revenue_target")

        return {
            "gross_revenue": revenue_metric,
            "live_orders": orders_metric,
            "master_catalog_products": catalog_metric,
            "products_in_review": review_metric,
            "monthly_target": target_metric,
            "data_source_layer_status": {
                "live_api_connected": self.live_api.is_available(),
                "database_connected": self.db_provider.is_available(),
                "ai_models_connected": self.ai_provider.is_available(),
                "manual_input_connected": self.manual_provider.is_available(),
                "demo_sandbox_active": self.demo_provider.is_available()
            }
        }

    def get_product_intelligence(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetches scores and recommendations for a product from the AI Model Data Source Provider.
        """
        scores = self.ai_provider.fetch_metric("intelligence_scores", product_data=product_data)
        recs = self.ai_provider.fetch_metric("recommendations", product_data=product_data)
        return {
            "intelligence_scores": scores,
            "recommendations": recs
        }
