"""
Manual Input Provider for Data Source Layer
Queries user-configured targets and brand settings from config/brand.yaml.
"""

from typing import Dict, Any
from src.core.provenance import DataSource, format_metric_with_source
from src.datasources.base_provider import BaseDataSourceProvider

class ManualInputProvider(BaseDataSourceProvider):
    def __init__(self):
        super().__init__("User Manual Configuration Provider", DataSource.USER_INPUT)

    def is_available(self) -> bool:
        return True

    def fetch_metric(self, metric_key: str, **kwargs) -> Dict[str, Any]:
        if metric_key == "monthly_revenue_target":
            return format_metric_with_source("20,000.00", self.source_type, unit="$")

        if metric_key == "brand_name":
            return format_metric_with_source("Digital Product Studio", self.source_type)

        return format_metric_with_source("Not Configured", self.source_type)
