"""
Unit Tests for Data Source Layer & Metrics Service Architecture
"""

import unittest
from src.core.provenance import DataSource
from src.datasources.live_api_provider import LiveApiProvider
from src.datasources.database_provider import DatabaseProvider
from src.datasources.ai_model_provider import AiModelProvider
from src.datasources.manual_input_provider import ManualInputProvider
from src.datasources.demo_provider import DemoSandboxProvider
from src.services.metrics_service import MetricsService

class TestDataSourceLayer(unittest.TestCase):
    def test_providers_contract(self):
        providers = [
            LiveApiProvider(),
            DatabaseProvider(),
            AiModelProvider(),
            ManualInputProvider(),
            DemoSandboxProvider()
        ]

        for prov in providers:
            self.assertIsNotNone(prov.provider_name)
            self.assertIsNotNone(prov.source_type)

    def test_metrics_service_decoupling(self):
        svc = MetricsService()
        summary = svc.get_executive_summary()
        self.assertIn("gross_revenue", summary)
        self.assertIn("data_source_layer_status", summary)
        self.assertIn("live_api_connected", summary["data_source_layer_status"])

        # Verify provenanced metric output structure
        rev_metric = summary["gross_revenue"]
        self.assertIn("display_value", rev_metric)
        self.assertIn("source", rev_metric)

if __name__ == "__main__":
    unittest.main()
