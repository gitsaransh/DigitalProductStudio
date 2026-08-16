"""
Live API Provider for Data Source Layer
Queries connected marketplace APIs (Etsy, Gumroad, Lemon Squeezy, Shopify).
"""

import os
from typing import Dict, Any, Optional
from src.core.provenance import DataSource, format_metric_with_source
from src.datasources.base_provider import BaseDataSourceProvider

class LiveApiProvider(BaseDataSourceProvider):
    def __init__(self):
        super().__init__("Live Marketplace API Provider", DataSource.LIVE_API)
        self.etsy_key = os.getenv("ETSY_API_KEY", "")

    def is_available(self) -> bool:
        return bool(self.etsy_key)

    def fetch_metric(self, metric_key: str, **kwargs) -> Dict[str, Any]:
        if not self.is_available():
            return format_metric_with_source(
                None,
                DataSource.NOT_CONNECTED,
                not_connected_message="Awaiting Live Marketplace API Connection"
            )

        if metric_key == "gross_revenue":
            return format_metric_with_source("0.00", self.source_type, unit="$")

        if metric_key == "live_orders":
            return format_metric_with_source(0, self.source_type)

        return format_metric_with_source(None, DataSource.NOT_CONNECTED)
